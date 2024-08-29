// utils/ExpressionManager.ts
import { VRM } from "@pixiv/three-vrm";
import {
  MouthExpressionManager,
  MouthExpression,
} from "./MouthExpressionManager.ts";
import {
  FaceExpressionManager,
  FaceExpression,
} from "./FaceExpressionManager.ts";
import {
  MotionExpressionManager,
  MotionExpression,
} from "./MotionExpressionManager.ts";
import { MotionConversionWorkerClient } from "./MotionExpressionWorkerClient.ts";
import { LoopRepeat, LoopOnce } from "three";

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
   * 2201: THREE.LoopRepeat
   *
   * 2200: THREE.LoopOnce
   */
  loopMotion?: typeof LoopRepeat | typeof LoopOnce;
}

export class ExpressionManager {
  public mouth: MouthExpressionManager;
  public face: FaceExpressionManager;
  public motion: MotionExpressionManager;
  private _vrmUrl: string;

  constructor(
    vrm: VRM,
    vrmUrl: string,
    motionConversionWorkerClient?: MotionConversionWorkerClient
  ) {
    this._vrmUrl = vrmUrl;
    this.mouth = new MouthExpressionManager(vrm, vrmUrl);
    this.face = new FaceExpressionManager(vrm, vrmUrl);
    this.motion = new MotionExpressionManager(
      vrm,
      vrmUrl,
      motionConversionWorkerClient
    );
  }

  // Pass the expression arrays to the respective managers
  express(expressionInput: ExpressionInput) {
    if (expressionInput.faceExpressions) {
      this.face.applyExpressions(expressionInput.faceExpressions);
    }

    if (expressionInput.mouthExpressions) {
      this.mouth.applyExpressions(expressionInput.mouthExpressions);
    }

    if (expressionInput.motionExpressions) {
      this.motion.applyExpressions(
        expressionInput.motionExpressions,
        expressionInput.loopMotion
      );
    }
  }

  // Update function to call processExpressions for all managers
  update(delta: number) {
    this.face.processExpressions(delta);
    this.mouth.processExpressions(delta);
    this.motion.processExpressions(delta);
  }
}
