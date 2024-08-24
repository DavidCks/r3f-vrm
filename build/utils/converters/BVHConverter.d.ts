import { VRM } from "@pixiv/three-vrm";
import { MotionExpression } from "../MotionExpressionManager";
import { MotionConversionWorkerClient } from "../MotionExpressionWorkerClient";
export declare class BVHConverter {
    private _vrm;
    private _bvhs;
    private _loader;
    private _vrmaConverter;
    private _worker;
    constructor(vrm: VRM, worker?: MotionConversionWorkerClient | undefined);
    bvh2motion(filePath: string, onProgress?: (name: string, progress: number) => void, buffer?: ArrayBuffer): Promise<MotionExpression>;
    private workerConvertBvhToMotion;
    private convertBvhToMotion;
}
//# sourceMappingURL=BVHConverter.d.ts.map