import { Group, Object3DEventMap } from "three";
import { VRM } from "@pixiv/three-vrm";
import { MotionExpression } from "../MotionExpressionManager";
import { BVH, BVHLoader } from "three/examples/jsm/loaders/BVHLoader.js";
import { animationBvh2vrmaBlob as animationBvh2vrmaBlob } from "./BVHConverter/animationBvh2motion";
import { VRMAConverter } from "./VRMAConverter";
import { MotionConversionWorkerClient } from "../MotionExpressionWorkerClient";
import { abFetch } from "./_common/arrayBufferFetcher";
import { arrayBufferToString } from "./_common/arrayBufferToString";

interface BVHs {
  [fileName: string]: {
    motionExpression: MotionExpression | undefined;
  };
}

export class BVHConverter {
  private _vrm: VRM;
  private _bvhs: BVHs;
  private _loader: BVHLoader;
  private _vrmaConverter: VRMAConverter;
  private _worker: MotionConversionWorkerClient | undefined;

  constructor(
    vrm: VRM,
    worker: MotionConversionWorkerClient | undefined = undefined
  ) {
    this._vrm = vrm;
    this._bvhs = {};
    this._loader = new BVHLoader();
    this._vrmaConverter = new VRMAConverter(vrm, worker);
  }

  async bvh2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {},
    buffer?: ArrayBuffer
  ): Promise<MotionExpression> {
    if (this._bvhs[filePath] && this._bvhs[filePath].motionExpression) {
      return this._bvhs[filePath].motionExpression!;
    }
    this._bvhs[filePath] = {
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
        const data = await this.workerConvertBvhToMotion(
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
        this._bvhs[data.filePath].motionExpression = data.motion;
        resolve(data.motion);
        return;
      }

      const bvhPlainText = arrayBufferToString(buffer);
      const bvh = this._loader.parse(bvhPlainText);
      const motion = await this.convertBvhToMotion(bvh, onProgress);
      if (motion) {
        this._bvhs[filePath].motionExpression = motion;
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

  private async workerConvertBvhToMotion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<{ filePath: string; motion: MotionExpression } | undefined> {
    return this._worker!.bvh2motion(filePath, arrayBuffer, onProgress);
  }

  private async convertBvhToMotion(
    object: BVH,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression | undefined> {
    if (object.clip) {
      let vrmaBlob: Blob;
      switch (object.clip.name) {
        case "animation":
          vrmaBlob = await animationBvh2vrmaBlob(object, this._vrm, onProgress);
          const blobUrl = URL.createObjectURL(vrmaBlob);
          return this._vrmaConverter.vrma2motion(blobUrl, onProgress);
        default:
          return undefined;
      }
    }
  }
}
