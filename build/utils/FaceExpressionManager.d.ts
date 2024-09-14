import { VRM } from "@pixiv/three-vrm";
export interface FaceExpression<T = any> {
    duration: number;
    angry?: number;
    happy?: number;
    neutral?: number;
    relaxed?: number;
    sad?: number;
    surprised?: number;
    metadata?: T;
}
export declare class FaceExpressionManager {
    private _vrm;
    private _currentExpressionIndex;
    private _expressionsQueue;
    private _elapsedTime;
    private _isActive;
    private _vrmUrl;
    constructor(vrm: VRM, vrmUrl: string);
    get currentExpression(): {
        angry: number;
        happy: number;
        neutral: number;
        relaxed: number;
        sad: number;
        surprised: number;
    };
    applyExpressions(expressions: FaceExpression[]): void;
    processExpressions(delta: number): void;
    private applyExpression;
}
//# sourceMappingURL=FaceExpressionManager.d.ts.map