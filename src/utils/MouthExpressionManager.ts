import { VRM } from "@pixiv/three-vrm";

export interface MouthExpression {
  duration: number;
  aa?: number;
  ee?: number;
  ih?: number;
  oh?: number;
  ou?: number;
}

// Define the keys array once, outside of the class
const MOUTH_EXPRESSION_KEYS: (keyof MouthExpression)[] = [
  "aa",
  "ee",
  "ih",
  "oh",
  "ou",
];

export class MouthExpressionManager {
  private _vrm: VRM;
  private _currentExpressionIndex = 0;
  private _expressionsQueue: MouthExpression[] = [];
  private _elapsedTime: number = 0;
  private _isActive = false;
  private _vrmUrl: string;

  constructor(vrm: VRM, vrmUrl: string) {
    this._vrm = vrm;
    this._vrmUrl = vrmUrl;
  }

  // Apply mouth expressions in sequence based on their individual durations
  applyExpressions(expressions: MouthExpression[]) {
    this._expressionsQueue = expressions;
    this._currentExpressionIndex = 0;
    this._elapsedTime = 0;
    this._isActive = true;

    // Start the first expression immediately
    this.applyExpression(this._expressionsQueue[0]);
  }

  // Call this method externally to process expressions
  processExpressions(delta: number) {
    if (
      !this._isActive ||
      this._currentExpressionIndex >= this._expressionsQueue.length
    ) {
      this._isActive = false;
      return;
    }

    this._elapsedTime += delta * 1000; // Convert delta from seconds to milliseconds

    const currentExpression =
      this._expressionsQueue[this._currentExpressionIndex];

    // Check if the current expression's duration has passed
    if (this._elapsedTime >= currentExpression.duration) {
      // Move to the next expression
      this._currentExpressionIndex++;
      this._elapsedTime = 0; // Reset elapsed time for the next expression

      // Apply the next expression if available
      if (this._currentExpressionIndex < this._expressionsQueue.length) {
        const nextExpression =
          this._expressionsQueue[this._currentExpressionIndex];
        this.applyExpression(nextExpression);
      }
    }
  }

  // Apply a single expression to the VRM, ensuring missing values are treated as zero
  private applyExpression(expression: MouthExpression) {
    const surpriseValue =
      this._vrm.expressionManager?.getValue("surprised") ??
      this._vrm.expressionManager?.getValue("Surprised") ??
      null;
    MOUTH_EXPRESSION_KEYS.forEach((key) => {
      const value = expression[key] !== undefined ? expression[key]! : 0;

      this._vrm.expressionManager?.setValue(
        key,
        value - (surpriseValue ?? 0) * 0.5
      );
    });
  }
}
