import { MotionExpression } from "../../MotionExpressionManager";
import * as THREE from "three";
import { VRMHumanBoneName, VRM } from "@pixiv/three-vrm";
import {
  createVRMAnimationClip,
  VRMAnimation,
} from "@pixiv/three-vrm-animation";

export function vrma2motion(
  vrmaObject: VRMAnimation,
  vrm: VRM,
  onProgress: (name: string, progress: number) => void
): MotionExpression {
  const clip = createVRMAnimationClip(vrmaObject, vrm);
  return {
    clip: clip,
  };
}
