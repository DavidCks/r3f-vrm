import { VRM } from "@pixiv/three-vrm";
import { MotionExpression } from "../MotionExpressionManager";
import { MotionConversionWorkerClient } from "../MotionExpressionWorkerClient";
export declare class FBXConverter {
    private _vrm;
    private _fbxs;
    private _loader;
    private _worker;
    constructor(vrm: VRM, worker?: MotionConversionWorkerClient | undefined);
    fbx2motion(filePath: string, onProgress?: (name: string, progress: number) => void, buffer?: ArrayBuffer): Promise<MotionExpression>;
    private workerConvertFbxToMotion;
    private convertFbxToMotion;
}
//# sourceMappingURL=FBXConverter.d.ts.map