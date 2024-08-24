import { MotionExpression } from "./MotionExpressionManager";
import { AnimationClip } from "three";
import {
  ConversionWorkerFunctionNames,
  MotionExpressionWorkerMessage,
  MotionExpressionWorkerResponse,
} from "./motion-expression-worker";
import { abFetch } from "./converters/_common/arrayBufferFetcher";

export class MotionConversionWorkerClient {
  private _worker: { [filePath: string]: Worker } = {};
  private _workerUrl: string;
  private _vrmUrl: string;
  public _vrmArrayBuffer: ArrayBuffer | undefined;
  public prefetchFiles: { [filePath: string]: Promise<ArrayBuffer> } = {};

  constructor(
    workerUrl: string,
    vrmUrl: string,
    vrmArrayBuffer?: ArrayBuffer,
    prefetch?: string[]
  ) {
    this._vrmUrl = vrmUrl;
    this._workerUrl = workerUrl;
    this._vrmArrayBuffer = vrmArrayBuffer;
    if (prefetch) {
      prefetch.forEach((filePath) => {
        this.prefetchFiles[filePath] = abFetch(filePath);
        this._worker[filePath] = new Worker(workerUrl);
      });
    }
  }

  async _fetchVrm(url: string) {
    if (!this._vrmArrayBuffer) {
      this._vrmArrayBuffer = await fetch(url).then((res) => res.arrayBuffer());
    }
    const newArrayBuffer = new ArrayBuffer(this._vrmArrayBuffer!.byteLength);
    // Create a view for both the original and new ArrayBuffer
    const view = new Uint8Array(newArrayBuffer);
    view.set(new Uint8Array(this._vrmArrayBuffer!));

    return newArrayBuffer;
  }

  async _initialize(filePath: string): Promise<{
    vrmArrayBuffer: ArrayBuffer;
    worker: Worker;
  }> {
    if (!this._worker[filePath]) {
      this._worker[filePath] = new Worker(this._workerUrl);
    }
    const vrmArrayBuffer = await this._fetchVrm(this._vrmUrl);
    const uid = Math.random().toString(36).slice(-8);
    return { vrmArrayBuffer, worker: this._worker[filePath] };
  }

  private async _dispatch(
    func: ConversionWorkerFunctionNames,
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<{ filePath: string; motion: MotionExpression }> {
    const { vrmArrayBuffer, worker } = await this._initialize(filePath);
    const uid = Math.random().toString(36).slice(-8);
    return new Promise((resolve, reject) => {
      const message = {
        func,
        uid,
        filePath,
        arrayBuffer,
        vrmArrayBuffer,
      } as MotionExpressionWorkerMessage;
      const workerListener = (e: MessageEvent) => {
        if (e.data.uid !== uid) return;
        const data = e.data as MotionExpressionWorkerResponse;
        switch (data.response.kind) {
          case "progress":
            onProgress(data.response.data.name, data.response.data.progress);
            break;
          case "output":
            const response = data.response.data;
            const clip = AnimationClip.parse(response.clip);
            resolve({
              filePath: data.filePath,
              motion: { clip: clip },
            });
            worker.terminate();
            break;
          default:
            break;
        }
      };
      worker.addEventListener("message", workerListener);
      worker.postMessage(message, [arrayBuffer, vrmArrayBuffer!]);
    });
  }

  async vrma2motion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<{ filePath: string; motion: MotionExpression }> {
    return await this._dispatch(
      "CWvrma2motion",
      filePath,
      arrayBuffer,
      onProgress
    );
  }

  async fbx2motion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<{ filePath: string; motion: MotionExpression }> {
    return await this._dispatch(
      "CWfbx2motion",
      filePath,
      arrayBuffer,
      onProgress
    );
  }

  async bvh2motion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<{ filePath: string; motion: MotionExpression }> {
    return await this._dispatch(
      "CWbvh2motion",
      filePath,
      arrayBuffer,
      onProgress
    );
  }
}
