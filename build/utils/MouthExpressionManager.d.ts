import { VRM } from "@pixiv/three-vrm";
export interface MouthExpression<T = any> {
    duration: number;
    aa?: number;
    ee?: number;
    ih?: number;
    oh?: number;
    ou?: number;
    metadata: T;
}
export declare class MouthExpressionManager {
    private _vrm;
    private _currentExpressionIndex;
    private _expressionsQueue;
    private _elapsedTime;
    private _isActive;
    private _vrmUrl;
    constructor(vrm: VRM, vrmUrl: string);
    applyExpressions(expressions: MouthExpression[]): void;
    processExpressions(delta: number): void;
    private applyExpression;
}
//# sourceMappingURL=MouthExpressionManager.d.ts.map