import { VRM } from "@pixiv/three-vrm";
import { MotionExpression } from "../MotionExpressionManager";
import { MotionConversionWorkerClient } from "../MotionExpressionWorkerClient";
export declare class VRMAConverter {
    private _vrm;
    private _vrmas;
    private _loader;
    private _worker;
    constructor(vrm: VRM, worker?: MotionConversionWorkerClient | undefined);
    vrma2motion(filePath: string, onProgress?: (name: string, progress: number) => void, buffer?: ArrayBuffer): Promise<MotionExpression>;
    private workerConvertVrmaToMotion;
    private convertVrmaToMotion;
}
//# sourceMappingURL=VRMAConverter.d.ts.map