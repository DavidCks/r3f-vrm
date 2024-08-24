import { Group, Object3DEventMap } from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { mixamoFbx2motion } from "./FBXConverter/mixamoFbx2motion";
import { VRM } from "@pixiv/three-vrm";
import { MotionExpression } from "../MotionExpressionManager";
import { mootionFbx2motion } from "./FBXConverter/mootionFbx2motion";
import { MotionConversionWorkerClient } from "../MotionExpressionWorkerClient";
import { abFetch } from "./_common/arrayBufferFetcher";
import * as THREE from "three";

interface FBXs {
  [fileName: string]: {
    motionExpression: MotionExpression | undefined;
  };
}

export class FBXConverter {
  private _vrm: VRM;
  private _fbxs: FBXs;
  private _loader: FBXLoader;
  private _worker: MotionConversionWorkerClient | undefined;

  constructor(
    vrm: VRM,
    worker: MotionConversionWorkerClient | undefined = undefined
  ) {
    this._vrm = vrm;
    this._fbxs = {};
    this._loader = new FBXLoader();
    this._worker = worker;
  }

  async fbx2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {},
    buffer?: ArrayBuffer
  ): Promise<MotionExpression> {
    if (this._fbxs[filePath] && this._fbxs[filePath].motionExpression) {
      return this._fbxs[filePath].motionExpression!;
    }
    this._fbxs[filePath] = {
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
        const data = await this.workerConvertFbxToMotion(
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
        this._fbxs[data.filePath].motionExpression = data.motion;
        resolve(data.motion);
        return;
      }

      // do it on the current thread
      const fbx = this._loader.parse(buffer, filePath);
      const motion = this.convertFbxToMotion(fbx, onProgress);
      if (motion) {
        this._fbxs[filePath].motionExpression = motion;
        resolve(motion);
        return;
      } else {
        reject(
          `An error occured while trying to convert ${filePath} to motion from its arrayBuffer`
        );
        return;
      }
    });
  }

  private async workerConvertFbxToMotion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<{ filePath: string; motion: MotionExpression } | undefined> {
    return this._worker!.fbx2motion(filePath, arrayBuffer, onProgress);
  }

  private convertFbxToMotion(
    object: Group<Object3DEventMap>,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): MotionExpression | undefined {
    if (object.animations.length > 0) {
      const names = [object.name, object.animations[0].name];
      if (names.some((name) => name.includes("mixamo.com"))) {
        return mixamoFbx2motion(object, this._vrm, onProgress);
      } else if (names.some((name) => name.includes("Mootion"))) {
        return mootionFbx2motion(object, this._vrm, onProgress);
      }
    }
  }
}
