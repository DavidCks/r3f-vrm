import { VRM } from "@pixiv/three-vrm";
export interface FaceExpression {
    duration: number;
    angry?: number;
    happy?: number;
    neutral?: number;
    relaxed?: number;
    sad?: number;
    surprised?: number;
}
export declare class FaceExpressionManager {
    private _vrm;
    private _currentExpressionIndex;
    private _expressionsQueue;
    private _elapsedTime;
    private _isActive;
    private _vrmUrl;
    constructor(vrm: VRM, vrmUrl: string);
    applyExpressions(expressions: FaceExpression[]): void;
    processExpressions(delta: number): void;
    private applyExpression;
}
//# sourceMappingURL=FaceExpressionManager.d.ts.map