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

export interface ExpressionInput {
  faceExpressions?: FaceExpression[];
  mouthExpressions?: MouthExpression[];
  motionExpressions?: MotionExpression[];
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
      this.motion.applyExpressions(expressionInput.motionExpressions);
    }
  }

  // Update function to call processExpressions for all managers
  update(delta: number) {
    this.face.processExpressions(delta);
    this.mouth.processExpressions(delta);
    this.motion.processExpressions(delta);
  }
}
