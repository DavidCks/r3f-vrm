// utils/MotionExpressionManager.ts
import { VRM, VRMPose, VRMHumanBoneName } from "@pixiv/three-vrm";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { FBXConverter } from "./converters/FBXConverter";
import { file } from "bun";
import * as THREE from "three";
import { BVHConverter } from "./converters/BVHConverter";
import { VRMAConverter } from "./converters/VRMAConverter";
import { MotionConversionWorkerClient } from "./MotionExpressionWorkerClient";
import { Observable, Subject, Subscriber } from "rxjs";
import { LoopType } from "./ExpressionManager";

export interface MotionExpression<T = any> {
  clip: THREE.AnimationClip;
  duration?: number;
  metadata?: T;
}

export class MotionExpressionManager {
  private _vrm: VRM;
  private _mixer: THREE.AnimationMixer;
  private _fbxConverter: FBXConverter;
  private _bvhConverter: BVHConverter;
  private _vrmaConverter: VRMAConverter;
  private _currentAnimationClip: THREE.AnimationClip | undefined;
  private _startNextTimer: Timer | undefined;
  private _worker: MotionConversionWorkerClient | undefined;

  constructor(
    vrm: VRM,
    vrmUrl: string,
    workerClient?: MotionConversionWorkerClient
  ) {
    this._vrm = vrm;
    this._mixer = new THREE.AnimationMixer(vrm.scene);
    this._mixer.timeScale = 1;
    this._worker = workerClient;
    this._fbxConverter = new FBXConverter(this._vrm, this._worker);
    this._bvhConverter = new BVHConverter(this._vrm, this._worker);
    this._vrmaConverter = new VRMAConverter(this._vrm, this._worker);
  }

  async x2motion(
    type: "fbx" | "bvh" | "vrma",
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    switch (type) {
      case "fbx":
        return await this.fbx2motion(filePath, onProgress);
      case "bvh":
        return await this.bvh2motion(filePath, onProgress);
      case "vrma":
        return await this.vrma2motion(filePath, onProgress);
      default:
        throw TypeError(
          `type '${type}' is not supported. please provide a 'bvh', 'fbx' or 'vrma'`
        );
    }
  }

  async fbx2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    return await this._fbxConverter.fbx2motion(filePath, onProgress);
  }

  async bvh2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    return await this._bvhConverter.bvh2motion(filePath, onProgress);
  }

  async vrma2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    return await this._vrmaConverter.vrma2motion(filePath, onProgress);
  }

  applyExpressions(
    expressions: MotionExpression[],
    loop: LoopType = THREE.LoopOnce
  ): Observable<MotionExpression> {
    return new Observable((observer) => {
      if (this._startNextTimer) {
        clearTimeout(this._startNextTimer);
      }

      const expressionCopies = expressions.map((expression) => {
        return { ...expression, clip: expression.clip.clone() };
      });

      if (loop == THREE.LoopRepeat) {
        const repeatedExpressionCopies: MotionExpression[] = [];
        for (const eCopy of expressionCopies) {
          const newECopy = { ...eCopy, clip: eCopy.clip.clone() };
          repeatedExpressionCopies.push(newECopy);
        }
        expressionCopies.push(...repeatedExpressionCopies);
      }

      this._applyExpressions(
        expressionCopies,
        loop,
        0.5,
        this._currentAnimationClip,
        observer // Pass observer to emit updates
      );
    });
  }

  // Apply motion expressions (implementation left blank for now)
  private _applyExpressions(
    expressions: MotionExpression[],
    loop: LoopType = THREE.LoopOnce,
    transitionDuration: number = 0.5,
    previousClip: THREE.AnimationClip | null = null,
    observer?: Subscriber<MotionExpression>
  ) {
    if (loop === LoopType.FastForward) {
      const lastExpressionCopy = {
        ...expressions[expressions.length - 1],
        clip: expressions[expressions.length - 1].clip.clone(),
      };
      expressions.push(lastExpressionCopy);
    }
    const newExpression = expressions.shift();
    if (loop == THREE.LoopRepeat) {
      if (newExpression) {
        expressions.push(newExpression);
      }
    }
    if (!newExpression) {
      observer?.complete();
      return;
    }

    if (observer) {
      observer.next(newExpression);
    }

    this._currentAnimationClip = newExpression.clip;
    const newAction = this._mixer.clipAction(newExpression.clip);
    newAction.loop = THREE.LoopOnce;
    newAction.clampWhenFinished = true;

    if (previousClip) {
      const previousAction = this._mixer.existingAction(previousClip);
      if (previousAction) {
        newAction.crossFadeFrom(previousAction, transitionDuration, true);
        previousAction.crossFadeTo(newAction, transitionDuration, true);
        setTimeout(() => {
          previousAction.stop();
        }, transitionDuration * 1000);
      }
    }
    newAction.play();

    let newExpressionDuration: number;
    if (newExpression.duration) {
      newExpressionDuration = newExpression.duration / 1000;
    } else {
      newExpressionDuration = newExpression.clip.duration;
    }

    const newTransitionDuration =
      newExpressionDuration < 0.5 ? newExpressionDuration / 2 : 0.5;
    this._startNextTimer = setTimeout(
      () => {
        if (expressions.length === 0) {
          newAction.fadeOut(newTransitionDuration);
          setTimeout(() => {
            newAction.stop();
          }, newTransitionDuration * 1000);
        }
        this._applyExpressions(
          expressions,
          loop,
          newTransitionDuration,
          this._currentAnimationClip,
          observer
        );
      },
      newExpressionDuration * 1000 - newTransitionDuration * 1000
    );
  }

  processExpressions(delta: number) {
    this._mixer.update(delta);
  }
}
