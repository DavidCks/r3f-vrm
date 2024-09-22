import { MotionExpression } from "../../src/utils/MotionExpressionManager";
export declare class MotionConversionWorkerClient {
  private _worker;
  private _workerUrl;
  private _vrmUrl;
  _vrmArrayBuffer: ArrayBuffer | undefined;
  prefetchFiles: {
    [filePath: string]: Promise<ArrayBuffer>;
  };
  constructor(
    workerUrl: string,
    vrmUrl: string,
    vrmArrayBuffer?: ArrayBuffer,
    prefetch?: string[]
  );
  _fetchVrm(url: string): Promise<ArrayBuffer>;
  _initialize(filePath: string): Promise<{
    vrmArrayBuffer: ArrayBuffer;
    worker: Worker;
  }>;
  private _dispatch;
  vrma2motion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress?: (name: string, progress: number) => void
  ): Promise<{
    filePath: string;
    motion: MotionExpression;
  }>;
  fbx2motion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress?: (name: string, progress: number) => void
  ): Promise<{
    filePath: string;
    motion: MotionExpression;
  }>;
  bvh2motion(
    filePath: string,
    arrayBuffer: ArrayBuffer,
    onProgress?: (name: string, progress: number) => void
  ): Promise<{
    filePath: string;
    motion: MotionExpression;
  }>;
}
//# sourceMappingURL=MotionExpressionWorkerClient.d.ts.map
