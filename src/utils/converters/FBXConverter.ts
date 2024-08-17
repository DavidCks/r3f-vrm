import { Group, Object3DEventMap } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { mixamoFbx2motion } from "./FBXConverter/mixamoFbx2motion";
import { VRM } from "@pixiv/three-vrm";
import { MotionExpression } from "../MotionExpressionManager";

interface FBXs {
  [fileName: string]: {
    fbx: Group<Object3DEventMap>;
  };
}

export class FBXConverter {
  private vrm: VRM;
  private fbxs: FBXs;
  private loader: FBXLoader;

  constructor(vrm: VRM) {
    this.vrm = vrm;
    this.fbxs = {};
    this.loader = new FBXLoader();
  }

  async fbx2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    // Create a promise to handle async loading
    return new Promise((resolve, reject) => {
      this.loader.load(
        filePath,
        (object) => {
          console.log("FBX file loaded:", object);
          // For now, just return the loaded object
          this.fbxs[filePath] = { fbx: object };
          const motion = this.convertFbxToMotion(object, onProgress);
          if (motion) {
            resolve(motion);
          } else {
            reject("unknown or unimplemented fbx format");
          }
        },
        (xhr) => {
          onProgress("fbxLoader - " + filePath, xhr.loaded / xhr.total);
        },
        (error) => {
          console.error("An error happened while loading the FBX file:", error);
          reject(error);
        }
      );
    });
  }

  private convertFbxToMotion(
    object: Group<Object3DEventMap>,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> | undefined {
    if (object.animations.length > 0) {
      switch (object.animations[0].name) {
        case "mixamo.com":
          return mixamoFbx2motion(object, this.vrm, onProgress);
        default:
          return undefined;
      }
    }
  }
}
