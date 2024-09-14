import { VRM } from "@pixiv/three-vrm";
import * as THREE from "three";

export interface MouthExpression<T = any> {
  duration?: number;
  aa?: number;
  ee?: number;
  ih?: number;
  oh?: number;
  ou?: number;
  metadata?: T;
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
  private _startExpression: MouthExpression | null = null;
  private _endExpression: MouthExpression | null = null;

  constructor(vrm: VRM, vrmUrl: string) {
    this._vrm = vrm;
    this._vrmUrl = vrmUrl;
  }

  // Apply mouth expressions in sequence based on their individual durations
  applyExpressions(expressions: MouthExpression[]) {
    if (expressions.length === 0) {
      expressions = [{ duration: 33, aa: 0, ih: 0, ou: 0, ee: 0, oh: 0 }];
    }
    expressions.push({
      duration: 1,
      aa: 0,
      ih: 0,
      ou: 0,
      ee: 0,
      oh: 0,
      metadata: "reset",
    });
    this._expressionsQueue = expressions;
    this._currentExpressionIndex = 0;
    this._elapsedTime = 0;
    this._isActive = true;

    // Prepare the first transition
    this._prepareNextTransition();
  }

  // Prepare the next transition between expressions
  private _prepareNextTransition() {
    this._startExpression =
      this._expressionsQueue[this._currentExpressionIndex];
    this._endExpression =
      this._expressionsQueue[this._currentExpressionIndex + 1];

    // Ensure default durations
    this._startExpression.duration ??= 1000;
    if (this._endExpression) {
      this._endExpression.duration ??= 1000;
    }
  }

  // Call this method externally to process expressions
  processExpressions(delta: number) {
    if (!this._isActive || !this._startExpression || !this._endExpression) {
      this._isActive = false;
      return;
    }

    this._elapsedTime += delta * 1000; // Convert delta from seconds to milliseconds
    const duration = this._endExpression.duration ?? 1000;

    // Calculate interpolation factor (t) between 0 and 1
    let t = this._elapsedTime / duration;
    if (t > 1) t = 1;

    // Apply THREE's smootherstep easing function
    const easedT = THREE.MathUtils.smootherstep(t, 0, 1);

    // Interpolate between start and end expressions
    this._interpolateExpressions(
      this._startExpression,
      this._endExpression,
      easedT
    );

    // Check if the current expression's duration has passed
    if (this._elapsedTime >= duration) {
      // Move to the next expression
      this._currentExpressionIndex++;
      this._elapsedTime = 0; // Reset elapsed time for the next expression

      // Prepare the next transition if available
      if (this._currentExpressionIndex < this._expressionsQueue.length - 1) {
        this._prepareNextTransition();
      } else {
        // No more expressions; set to end expression
        this._startExpression = this._endExpression;
        this._endExpression = null;
      }
    }
  }

  // Interpolate between two expressions and apply to VRM
  private _interpolateExpressions(
    startExpression: MouthExpression,
    endExpression: MouthExpression,
    t: number
  ) {
    const surpriseValue =
      this._vrm.expressionManager?.getValue("surprised") ??
      this._vrm.expressionManager?.getValue("Surprised") ??
      0;

    MOUTH_EXPRESSION_KEYS.forEach((key) => {
      const startValue = startExpression[key] ?? 0;
      const endValue = endExpression ? endExpression[key] ?? 0 : startValue;

      // Interpolate using eased t
      const value = startValue + (endValue - startValue) * t;

      this._vrm.expressionManager?.setValue(key, value - surpriseValue * 0.5);
    });
  }
}
