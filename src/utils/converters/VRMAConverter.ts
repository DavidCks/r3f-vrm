import { Group, Object3DEventMap } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { mixamoFbx2motion } from "./FBXConverter/mixamoFbx2motion";
import { VRM } from "@pixiv/three-vrm";
import {
  VRMAnimation,
  VRMAnimationLoaderPlugin,
} from "@pixiv/three-vrm-animation";
import { MotionExpression } from "../MotionExpressionManager";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { vrma2motion } from "./VRMAConverter/vrma2motion";

interface VRMAs {
  [fileName: string]: {
    vrma: VRMAnimation;
  };
}

export class VRMAConverter {
  private vrm: VRM;
  private vrmas: VRMAs;
  private loader: GLTFLoader;

  constructor(vrm: VRM) {
    this.vrm = vrm;
    this.vrmas = {};
    this.loader = new GLTFLoader();
    this.loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
  }

  async vrma2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    // Create a promise to handle async loading
    return new Promise((resolve, reject) => {
      this.loader.load(
        filePath,
        (object) => {
          console.log("VRMA file loaded:", object);
          // For now, just return the loaded object
          const vrmAnimation = object.userData.vrmAnimations[0] as
            | VRMAnimation
            | undefined;
          if (!vrmAnimation) {
            reject("no VRMA found in the loaded gltf object");
            return;
          }
          this.vrmas[filePath] = { vrma: vrmAnimation };
          const motion = this.convertVrmaToMotion(vrmAnimation, onProgress);
          if (motion) {
            resolve(motion);
          } else {
            reject("unknown or unimplemented vrma format");
          }
        },
        (xhr) => {
          onProgress("vrmaLoader - " + filePath, xhr.loaded / xhr.total);
        },
        (error) => {
          console.error(
            "An error happened while loading the VRMA file:",
            error
          );
          reject(error);
        }
      );
    });
  }

  private convertVrmaToMotion(
    object: VRMAnimation,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> | undefined {
    if (object.humanoidTracks) {
      return vrma2motion(object, this.vrm, onProgress);
    }
  }
}
