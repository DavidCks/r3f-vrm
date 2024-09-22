import { VRM } from "@pixiv/three-vrm";
import * as THREE from "three";
import { MotionConversionWorkerClient } from "../../src/utils/MotionExpressionWorkerClient";
import { Observable } from "rxjs";
import { LoopType } from "../../src/utils/ExpressionManager";
export interface MotionExpression<T = any> {
  clip: THREE.AnimationClip;
  duration?: number;
  metadata?: T;
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
  constructor(
    vrm: VRM,
    vrmUrl: string,
    workerClient?: MotionConversionWorkerClient
  );
  x2motion(
    type: "fbx" | "bvh" | "vrma",
    filePath: string,
    onProgress?: (name: string, progress: number) => void
  ): Promise<MotionExpression>;
  fbx2motion(
    filePath: string,
    onProgress?: (name: string, progress: number) => void
  ): Promise<MotionExpression>;
  bvh2motion(
    filePath: string,
    onProgress?: (name: string, progress: number) => void
  ): Promise<MotionExpression>;
  vrma2motion(
    filePath: string,
    onProgress?: (name: string, progress: number) => void
  ): Promise<MotionExpression>;
  applyExpressions(
    expressions: MotionExpression[],
    loop?: LoopType
  ): Observable<MotionExpression>;
  private _applyExpressions;
  processExpressions(delta: number): void;
}
//# sourceMappingURL=MotionExpressionManager.d.ts.map
