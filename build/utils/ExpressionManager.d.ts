import { VRM } from "@pixiv/three-vrm";
import {
  MouthExpressionManager,
  MouthExpression,
} from "../../src/utils/MouthExpressionManager.js";
import {
  FaceExpressionManager,
  FaceExpression,
} from "../../src/utils/FaceExpressionManager.js";
import {
  MotionExpressionManager,
  MotionExpression,
} from "../../src/utils/MotionExpressionManager.js";
import { MotionConversionWorkerClient } from "../../src/utils/MotionExpressionWorkerClient.js";
import { Observable } from "rxjs";
export declare class LoopType {
  static FastForward: number;
  static Repeat: number;
  static Once: number;
}
export interface ExpressionInput {
  /**
   *  ```ts
   *  FaceExpression {
   *    duration: number;
   *    angry?: number; // between 0 and 1
   *    happy?: number; // between 0 and 1
   *    neutral?: number; // between 0 and 1
   *    relaxed?: number; // between 0 and 1
   *    sad?: number; // between 0 and 1
   *    surprised?: number; // between 0 and 1
   * }
   * ```
   */
  faceExpressions?: FaceExpression[];
  /**
   *  ```ts
   *  MouthExpression {
   *    duration: number;
   *    aa?: number; // between 0 and 1
   *    ee?: number; // between 0 and 1
   *    ih?: number; // between 0 and 1
   *    oh?: number; // between 0 and 1
   *    ou?: number; // between 0 and 1
   *  }
   * ```
   */
  mouthExpressions?: MouthExpression[];
  /**
   *  ```ts
   *  MotionExpression {
   *    clip: THREE.AnimationClip;
   *    duration?: number; // will default to clip duration if not provided
   *  }
   * ```
   */
  motionExpressions?: MotionExpression[];
  /**
   * 1001: FastForward
   *
   * 2201: THREE.LoopRepeat
   *
   * 2200: THREE.LoopOnce
   */
  loopMotion?: LoopType;
}
export declare class ExpressionManager {
  mouth: MouthExpressionManager;
  face: FaceExpressionManager;
  motion: MotionExpressionManager;
  private _vrmUrl;
  private _expressionStreams;
  constructor(
    vrm: VRM,
    vrmUrl: string,
    motionConversionWorkerClient?: MotionConversionWorkerClient
  );
  express(
    expressionInput: ExpressionInput
  ): Observable<MotionExpression | FaceExpression | MouthExpression>;
  update(delta: number): void;
}
//# sourceMappingURL=ExpressionManager.d.ts.map
