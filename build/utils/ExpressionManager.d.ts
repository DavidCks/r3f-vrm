import { VRM } from "@pixiv/three-vrm";
import { MouthExpressionManager, MouthExpression } from "./MouthExpressionManager.ts";
import { FaceExpressionManager, FaceExpression } from "./FaceExpressionManager.ts";
import { MotionExpressionManager, MotionExpression } from "./MotionExpressionManager.ts";
import { MotionConversionWorkerClient } from "./MotionExpressionWorkerClient.ts";
export interface ExpressionInput {
    faceExpressions?: FaceExpression[];
    mouthExpressions?: MouthExpression[];
    motionExpressions?: MotionExpression[];
}
export declare class ExpressionManager {
    mouth: MouthExpressionManager;
    face: FaceExpressionManager;
    motion: MotionExpressionManager;
    private _vrmUrl;
    constructor(vrm: VRM, vrmUrl: string, motionConversionWorkerClient?: MotionConversionWorkerClient);
    express(expressionInput: ExpressionInput): void;
    update(delta: number): void;
}
//# sourceMappingURL=ExpressionManager.d.ts.map