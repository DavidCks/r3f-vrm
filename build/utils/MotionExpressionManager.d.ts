import { VRM } from "@pixiv/three-vrm";
import * as THREE from "three";
import { MotionConversionWorkerClient } from "./MotionExpressionWorkerClient";
export interface MotionExpression {
    clip: THREE.AnimationClip;
    duration?: number;
}
export declare class MotionExpressionManager {
    private _vrm;
    private _mixer;
    private _fbxConverter;
    private _bvhConverter;
    private _vrmaConverter;
    private _currentAnimationClip;
    private _startNextTimer;
    private _worker;
    constructor(vrm: VRM, vrmUrl: string, workerClient?: MotionConversionWorkerClient);
    fbx2motion(filePath: string, onProgress?: (name: string, progress: number) => void): Promise<MotionExpression>;
    bvh2motion(filePath: string, onProgress?: (name: string, progress: number) => void): Promise<MotionExpression>;
    vrma2motion(filePath: string, onProgress?: (name: string, progress: number) => void): Promise<MotionExpression>;
    applyExpressions(expressions: MotionExpression[], loop?: THREE.AnimationActionLoopStyles): void;
    private _applyExpressions;
    processExpressions(delta: number): void;
}
//# sourceMappingURL=MotionExpressionManager.d.ts.map