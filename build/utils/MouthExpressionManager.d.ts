import { VRM } from "@pixiv/three-vrm";
export interface MouthExpression<T = any> {
    duration?: number;
    aa?: number;
    ee?: number;
    ih?: number;
    oh?: number;
    ou?: number;
    metadata?: T;
}
export declare class MouthExpressionManager {
    private _vrm;
    private _currentExpressionIndex;
    private _expressionsQueue;
    private _elapsedTime;
    private _isActive;
    private _vrmUrl;
    private _startExpression;
    private _endExpression;
    constructor(vrm: VRM, vrmUrl: string);
    applyExpressions(expressions: MouthExpression[]): void;
    private _prepareNextTransition;
    processExpressions(delta: number): void;
    private _interpolateExpressions;
}
//# sourceMappingURL=MouthExpressionManager.d.ts.map