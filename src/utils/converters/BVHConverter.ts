import { Group, Object3DEventMap } from "three";
import { VRM } from "@pixiv/three-vrm";
import { MotionExpression } from "../MotionExpressionManager";
import { BVH, BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";
import { animationBvh2vrma } from "./BVHConverter/animationBvh2motion";
import { VRMAConverter } from "./VRMAConverter";

interface BVHs {
  [fileName: string]: {
    bvh: BVH;
  };
}

export class BVHConverter {
  private vrm: VRM;
  private bvhs: BVHs;
  private loader: BVHLoader;
  private vrmaConverter: VRMAConverter;

  constructor(vrm: VRM) {
    this.vrm = vrm;
    this.bvhs = {};
    this.loader = new BVHLoader();
    this.vrmaConverter = new VRMAConverter(vrm);
  }

  async bvh2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    // Create a promise to handle async loading
    return new Promise((resolve, reject) => {
      this.loader.load(
        filePath,
        (object) => {
          console.log("BVH file loaded:", object);
          // For now, just return the loaded object
          this.bvhs[filePath] = { bvh: object };
          const motionPromise = this.convertBvhToMotion(object, onProgress);
          motionPromise.then((motion) => {
            if (motion) {
              resolve(motion);
            } else {
              reject("unknown or unimplemented bvh format");
            }
          });
        },
        (xhr) => {
          onProgress("bvhLoader - " + filePath, xhr.loaded / xhr.total);
        },
        (error) => {
          console.error("An error happened while loading the BVH file:", error);
          reject(error);
        }
      );
    });
  }

  private async convertBvhToMotion(
    object: BVH,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression | undefined> {
    if (object.clip) {
      switch (object.clip.name) {
        case "animation":
          const vrmaBlob = await animationBvh2vrma(
            object,
            this.vrm,
            onProgress
          );
          return this.vrmaConverter.vrma2motion(vrmaBlob, onProgress);
        default:
          return undefined;
      }
    }
  }
}
