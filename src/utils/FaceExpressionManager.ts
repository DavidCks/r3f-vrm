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
  private vrm: VRM;
  private currentExpressionIndex = 0;
  private expressionsQueue: FaceExpression[] = [];
  private elapsedTime: number = 0;
  private isActive = false;

  constructor(vrm: VRM) {
    this.vrm = vrm;
  }

  // Apply face expressions in sequence based on their individual durations
  applyExpressions(expressions: FaceExpression[]) {
    this.expressionsQueue = expressions;
    this.currentExpressionIndex = 0;
    this.elapsedTime = 0;
    this.isActive = true;

    // Start the first expression immediately
    this.applyExpression(this.expressionsQueue[0]);
  }

  // Call this method externally to process expressions
  processExpressions(delta: number) {
    if (
      !this.isActive ||
      this.currentExpressionIndex >= this.expressionsQueue.length
    ) {
      this.isActive = false;
      return;
    }

    this.elapsedTime += delta * 1000; // Convert delta from seconds to milliseconds

    const currentExpression =
      this.expressionsQueue[this.currentExpressionIndex];

    // Check if the current expression's duration has passed
    if (this.elapsedTime >= currentExpression.duration) {
      // Move to the next expression
      this.currentExpressionIndex++;
      this.elapsedTime = 0; // Reset elapsed time for the next expression

      // Apply the next expression if available
      if (this.currentExpressionIndex < this.expressionsQueue.length) {
        const nextExpression =
          this.expressionsQueue[this.currentExpressionIndex];
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
      this.vrm.expressionManager?.setValue(key, value);

      // Apply for first-letter-uppercase version
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      this.vrm.expressionManager?.setValue(capitalizedKey, value);
    });
  }
}
