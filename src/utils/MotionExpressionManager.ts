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
  private initialPose: VRMPose | null = null;

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

  storeInitialPose() {
    this.initialPose = this.vrm.humanoid.getNormalizedPose();
  }

  // Apply motion expressions (implementation left blank for now)
  applyExpressions(expressions: MotionExpression[]) {
    if (!this.initialPose) {
      this.storeInitialPose();
    }
    const action = this.mixer.clipAction(expressions[0].clip);
    action.clampWhenFinished = true;
    action.loop = THREE.LoopOnce;
    action.play();

    // Listen for the end of the animation to trigger the blend back to the initial pose
    action.getMixer().addEventListener("finished", () => {
      this.blendToInitialPose();
    });
  }

  // Blend back to the initial pose
  // Blend back to the initial pose
  blendToInitialPose() {
    if (!this.initialPose) return;

    // Create a keyframe track for each bone that will interpolate from the current pose back to the initial pose
    const tracks = [];
    const humanoid = this.vrm.humanoid;

    for (const boneNameString in VRMHumanBoneName) {
      const boneName = boneNameString as VRMHumanBoneName;
      const bone = humanoid.getNormalizedBoneNode(boneName);
      if (bone && this.initialPose?.[boneName]) {
        const initialPosition = this.initialPose[boneName]?.position;
        const initialQuaternion = this.initialPose[boneName]?.rotation;

        if (initialPosition) {
          tracks.push(
            new THREE.VectorKeyframeTrack(
              `${bone.name}.position`,
              [0, 1], // Interpolate over 1 second
              [
                bone.position.x,
                bone.position.y,
                bone.position.z,
                initialPosition[0],
                initialPosition[1],
                initialPosition[2],
              ]
            )
          );
        }

        if (initialQuaternion) {
          tracks.push(
            new THREE.QuaternionKeyframeTrack(
              `${bone.name}.quaternion`,
              [0, 1], // Interpolate over 1 second
              [
                bone.quaternion.x,
                bone.quaternion.y,
                bone.quaternion.z,
                bone.quaternion.w,
                initialQuaternion[0],
                initialQuaternion[1],
                initialQuaternion[2],
                initialQuaternion[3],
              ]
            )
          );
        }
      }
    }

    const resetClip = new THREE.AnimationClip("reset", 1, tracks);
    const resetAction = this.mixer.clipAction(resetClip);
    resetAction.setLoop(THREE.LoopOnce, 1);
    resetAction.timeScale = 1; // Adjust as needed for smoothness
    resetAction.fadeIn(0.5); // Adjust the fade-in time for smoothness
    resetAction.play();
  }

  processExpressions(delta: number) {
    this.mixer.update(delta);
  }
}
