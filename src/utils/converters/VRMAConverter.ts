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
import { MotionConversionWorkerClient } from "../MotionExpressionWorkerClient";
import { abFetch } from "./_common/arrayBufferFetcher";

interface VRMAs {
  [fileName: string]: {
    motionExpression: MotionExpression | undefined;
  };
}

export class VRMAConverter {
  private _vrm: VRM;
  private _vrmas: VRMAs;
  private _loader: GLTFLoader;
  private _worker: MotionConversionWorkerClient | undefined;

  constructor(
    vrm: VRM,
    worker: MotionConversionWorkerClient | undefined = undefined
  ) {
    this._vrm = vrm;
    this._vrmas = {};
    this._loader = new GLTFLoader();
    this._loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    this._worker = worker;
  }

  async vrma2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {},
    buffer?: ArrayBuffer
  ): Promise<MotionExpression> {
    if (this._vrmas[filePath] && this._vrmas[filePath].motionExpression) {
      return this._vrmas[filePath].motionExpression!;
    }
    this._vrmas[filePath] = {
      motionExpression: undefined,
    };
    if (!buffer) {
      if (
        this._worker &&
        Object.keys(this._worker.prefetchFiles).includes(filePath)
      ) {
        buffer = await this._worker.prefetchFiles[filePath];
      } else {
        buffer = await abFetch(filePath, onProgress);
      }
    }
    return new Promise(async (resolve, reject) => {
      // let the worker handle it
      if (this._worker) {
        const data = await this.workerConvertVrmaToMotion(
          filePath,
          buffer,
          onProgress
        );
        if (!data) {
          reject(
            `An error occured while trying to convert ${filePath} to motion from its arrayBuffer using the worker`
          );
          return;
        }
        this._vrmas[data.filePath].motionExpression = data.motion;
        resolve(data.motion);
        return;
      }

      this._loader.parse(
        buffer,
        filePath,
        async (gltf) => {
          const vrma = gltf.userData.vrmAnimations[0] as
            | VRMAnimation
            | undefined;
          if (!vrma) {
            reject(
              `An error occured while trying to load ${filePath} from its arrayBuffer`
            );
            return;
          }
          const motion = await this.convertVrmaToMotion(vrma, onProgress);
          if (motion) {
            this._vrmas[filePath].motionExpression = motion;
            resolve(motion);
            return;
          } else {
            reject(
              `An error occured while trying to convert ${filePath} to motion from its arrayBuffer`
            );
            return;
          }
        },
        (e) => {
          reject(e);
        }
      );
    });
  }

  private async workerConvertVrmaToMotion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<{ filePath: string; motion: MotionExpression } | undefined> {
    return await this._worker!.vrma2motion(filePath, arrayBuffer, onProgress);
  }

  private convertVrmaToMotion(
    object: VRMAnimation,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): MotionExpression | undefined {
    if (object.humanoidTracks) {
      return vrma2motion(object, this._vrm, onProgress);
    }
  }
}
