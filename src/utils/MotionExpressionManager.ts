// utils/MotionExpressionManager.ts
import { VRM, VRMPose, VRMHumanBoneName } from "@pixiv/three-vrm";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { FBXConverter } from "./converters/FBXConverter";
import { file } from "bun";
import * as THREE from "three";
import { BVHConverter } from "./converters/BVHConverter";
import { VRMAConverter } from "./converters/VRMAConverter";

export interface MotionExpression {
  clip: THREE.AnimationClip;
}

export class MotionExpressionManager {
  private vrm: VRM;
  private mixer: THREE.AnimationMixer;
  private fbxConverter: FBXConverter;
  private bvhConverter: BVHConverter;
  private vrmaConverter: VRMAConverter;
  private currentAnimationClip: THREE.AnimationClip | undefined;
  private startNextTimer: Timer | undefined;

  constructor(vrm: VRM) {
    this.vrm = vrm;
    this.mixer = new THREE.AnimationMixer(vrm.scene);
    this.mixer.timeScale = 1;
    this.fbxConverter = new FBXConverter(this.vrm);
    this.bvhConverter = new BVHConverter(this.vrm);
    this.vrmaConverter = new VRMAConverter(this.vrm);
  }

  async fbx2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    return await this.fbxConverter.fbx2motion(filePath, onProgress);
  }

  async bvh2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    return await this.bvhConverter.bvh2motion(filePath, onProgress);
  }

  async vrma2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    return await this.vrmaConverter.vrma2motion(filePath, onProgress);
  }

  applyExpressions(
    expressions: MotionExpression[],
    loop: THREE.AnimationActionLoopStyles = THREE.LoopOnce
  ) {
    if (this.startNextTimer) {
      clearTimeout(this.startNextTimer);
    }
    this._applyExpressions(expressions, loop, 0.5, this.currentAnimationClip);
  }

  // Apply motion expressions (implementation left blank for now)
  private _applyExpressions(
    expressions: MotionExpression[],
    loop: THREE.AnimationActionLoopStyles = THREE.LoopOnce,
    transitionDuration: number = 0.5,
    previousClip: THREE.AnimationClip | null = null
  ) {
    const newExpression = expressions.shift();
    if (!newExpression) {
      return;
    }
    this.currentAnimationClip = newExpression.clip;
    const newAction = this.mixer.clipAction(newExpression.clip);
    newAction.loop = THREE.LoopOnce;
    newAction.clampWhenFinished = true;

    if (previousClip) {
      const previousAction = this.mixer.existingAction(previousClip);
      if (previousAction) {
        newAction.crossFadeFrom(previousAction, transitionDuration, true);
        previousAction.crossFadeTo(newAction, transitionDuration, true);
        setTimeout(() => {
          previousAction.stop();
        }, transitionDuration * 1000);
      }
    }
    newAction.play();

    const newTransitionDuration =
      newExpression.clip.duration < 0.5 ? newExpression.clip.duration / 2 : 0.5;
    this.startNextTimer = setTimeout(
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
          this.currentAnimationClip
        );
      },
      newExpression.clip.duration * 1000 - newTransitionDuration * 1000
    );
  }

  processExpressions(delta: number) {
    this.mixer.update(delta);
  }
}
