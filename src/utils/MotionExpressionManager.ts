// utils/MotionExpressionManager.ts
import { VRM, VRMPose } from "@pixiv/three-vrm";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { FBXConverter } from "./converters/FBXConverter";
import { file } from "bun";
import * as THREE from "three";

export interface MotionExpression {
  clip: THREE.AnimationClip;
}

export class MotionExpressionManager {
  private vrm: VRM;
  private mixer: THREE.AnimationMixer;
  private fbxConverter: FBXConverter;

  constructor(vrm: VRM) {
    this.vrm = vrm;
    this.mixer = new THREE.AnimationMixer(vrm.scene);
    this.mixer.timeScale = 1;
    this.fbxConverter = new FBXConverter(this.vrm);
  }

  // Static method to load an FBX file and return a MotionExpression
  async fbx2motion(
    filePath: string,
    onProgress: (name: string, progress: number) => void = (_1, _2) => {}
  ): Promise<MotionExpression> {
    return await this.fbxConverter.fbx2motion(filePath, onProgress);
  }

  // Apply motion expressions (implementation left blank for now)
  applyExpressions(expressions: MotionExpression[]) {
    this.mixer.clipAction(expressions[0].clip).play();
  }

  processExpressions(delta: number) {
    this.mixer.update(delta);
  }
}
