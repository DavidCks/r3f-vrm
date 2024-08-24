import { MotionExpression } from "./MotionExpressionManager";
import { VRM } from "@pixiv/three-vrm";
type MotionExpressionWorkerResponseData = {
    kind: "progress";
    data: {
        name: string;
        progress: number;
    };
} | {
    kind: "output";
    data: {
        clip: any;
    };
};
export type MotionExpressionWorkerResponse = {
    uid: string;
    filePath: string;
    response: MotionExpressionWorkerResponseData;
};
declare function workerVrma2motion(filePath: string, uid: string, arrayBuffer: ArrayBuffer, vrm: VRM): Promise<MotionExpression>;
declare function workerFbx2motion(filePath: string, uid: string, arrayBuffer: ArrayBuffer, vrm: VRM): Promise<MotionExpression>;
declare function workerBvh2vrmaBlob(filePath: string, uid: string, arrayBuffer: ArrayBuffer, vrm: VRM): Promise<MotionExpression>;
export type ConversionWorkerFunctionNames = keyof typeof functionMap;
declare const functionMap: {
    readonly CWvrma2motion: typeof workerVrma2motion;
    readonly CWfbx2motion: typeof workerFbx2motion;
    readonly CWbvh2motion: typeof workerBvh2vrmaBlob;
};
export type MotionExpressionWorkerMessage = {
    func: ConversionWorkerFunctionNames;
    uid: string;
    filePath: string;
    arrayBuffer: ArrayBuffer;
    vrmArrayBuffer: ArrayBuffer;
};
export {};
//# sourceMappingURL=motion-expression-worker.d.ts.map