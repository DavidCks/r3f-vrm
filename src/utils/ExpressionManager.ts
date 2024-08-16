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

export interface ExpressionInput {
  faceExpressions?: FaceExpression[];
  mouthExpressions?: MouthExpression[];
  motionExpressions?: MotionExpression[];
}

export class ExpressionManager {
  public mouth: MouthExpressionManager;
  public face: FaceExpressionManager;
  public motion: MotionExpressionManager;

  constructor(vrm: VRM) {
    this.mouth = new MouthExpressionManager(vrm);
    this.face = new FaceExpressionManager(vrm);
    this.motion = new MotionExpressionManager(vrm);
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
