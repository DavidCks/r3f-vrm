import { VRM } from "@pixiv/three-vrm";

export interface FaceExpression {
  duration: number;
  angry?: number;
  happy?: number;
  neutral?: number;
  relaxed?: number;
  sad?: number;
  surprised?: number;
}

// Define the keys array once, outside of the class
const FACE_EXPRESSION_KEYS: (keyof FaceExpression)[] = [
  "angry",
  "happy",
  "neutral",
  "relaxed",
  "sad",
  "surprised",
] as const;

// Define FACE_EXPRESSION_WEIGHTS using a mapped type
const FACE_EXPRESSION_WEIGHTS: { [K in keyof FaceExpression]: number } = {
  duration: 1,
  angry: 1,
  happy: 1,
  neutral: 1,
  relaxed: 1,
  sad: 1,
  surprised: 0.5,
} as const;

export class FaceExpressionManager {
  private _vrm: VRM;
  private _currentExpressionIndex = 0;
  private _expressionsQueue: FaceExpression[] = [];
  private _elapsedTime: number = 0;
  private _isActive = false;
  private _vrmUrl: string;

  constructor(vrm: VRM, vrmUrl: string) {
    this._vrm = vrm;
    this._vrmUrl = vrmUrl;
  }

  // Apply face expressions in sequence based on their individual durations
  applyExpressions(expressions: FaceExpression[]) {
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
  private applyExpression(expression: FaceExpression) {
    FACE_EXPRESSION_KEYS.forEach((key) => {
      const weight = FACE_EXPRESSION_WEIGHTS[key] ?? 1;
      const value =
        (expression[key] !== undefined ? expression[key]! : 0) * weight;
      // Apply for lowercase version
      this._vrm.expressionManager?.setValue(key, value);

      // Apply for first-letter-uppercase version
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      this._vrm.expressionManager?.setValue(capitalizedKey, value);
    });
  }
}
