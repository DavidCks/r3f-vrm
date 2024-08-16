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
  private vrm: VRM;
  private currentExpressionIndex = 0;
  private expressionsQueue: MouthExpression[] = [];
  private elapsedTime: number = 0;
  private isActive = false;

  constructor(vrm: VRM) {
    this.vrm = vrm;
  }

  // Apply mouth expressions in sequence based on their individual durations
  applyExpressions(expressions: MouthExpression[]) {
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
  private applyExpression(expression: MouthExpression) {
    const surpriseValue =
      this.vrm.expressionManager?.getValue("surprised") ??
      this.vrm.expressionManager?.getValue("Surprised") ??
      null;
    MOUTH_EXPRESSION_KEYS.forEach((key) => {
      const value = expression[key] !== undefined ? expression[key]! : 0;

      this.vrm.expressionManager?.setValue(
        key,
        value - (surpriseValue ?? 0) * 0.5
      );
    });
  }
}
