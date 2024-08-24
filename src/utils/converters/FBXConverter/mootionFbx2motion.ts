import { MotionExpression } from "../../MotionExpressionManager";
import * as THREE from "three";
import { VRMHumanBoneName, VRM } from "@pixiv/three-vrm";

export function mootionFbx2motion(
  fbxObject: THREE.Group<THREE.Object3DEventMap>,
  vrm: VRM,
  onProgress: (name: string, progress: number) => void
): MotionExpression {
  const clip = THREE.AnimationClip.findByName(
    fbxObject.animations,
    fbxObject.animations[0].name
  )!;
  const animationSpeed = 1;

  const tracks: THREE.KeyframeTrack[] = [];

  const restRotationInverse = new THREE.Quaternion();
  const parentRestWorldRotation = new THREE.Quaternion();
  const _quatA = new THREE.Quaternion();
  const _vec3 = new THREE.Vector3();

  const motionHipsHeight =
    fbxObject.getObjectByName("MootionRigHips")?.position.y ?? 2;

  const vrmHips = vrm.humanoid.getNormalizedBoneNode("hips")!;
  const vrmHipsY = vrmHips.getWorldPosition(_vec3).y!;
  const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
  const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
  const hipsPositionScale =
    vrmHipsHeight / (motionHipsHeight == 0 ? 1 : motionHipsHeight);

  const VRMRigMap = mootionVRMRigMap;
  clip.tracks.forEach((track, i) => {
    let trackName = track.name;
    if (trackName.startsWith(".")) {
      trackName = trackName.substring(1);
    }

    // Convert each tracks for VRM use, and push to `tracks`
    const trackSplitted = trackName.split(".");
    const mootionRigName = trackSplitted[0];
    const vrmBoneName = VRMRigMap[mootionRigName];
    const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
    let mootionRigNode;
    if (typeof fbxObject.getObjectByName !== "undefined") {
      mootionRigNode = fbxObject.getObjectByName(mootionRigName);
    }

    if (vrmNodeName != null) {
      const propertyName = trackSplitted[1];

      // Store rotations of rest-pose.
      mootionRigNode?.getWorldQuaternion(restRotationInverse).invert();
      mootionRigNode?.parent?.getWorldQuaternion(parentRestWorldRotation);

      if (track instanceof THREE.QuaternionKeyframeTrack) {
        // Retarget rotation of mixamoRig to NormalizedBone.
        for (let i = 0; i < track.values.length; i += 4) {
          const flatQuaternion = track.values.slice(i, i + 4);

          _quatA.fromArray(flatQuaternion);

          _quatA
            .premultiply(parentRestWorldRotation)
            .multiply(restRotationInverse);

          _quatA.toArray(flatQuaternion);

          flatQuaternion.forEach((v, index) => {
            track.values[index + i] = v;
          });
        }

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times.map((e) => e / animationSpeed),
            track.values.map((v, i) =>
              vrm.meta?.metaVersion === "0" && i % 2 === 0 ? -v : v
            )
          )
        );
      } else if (track instanceof THREE.VectorKeyframeTrack) {
        const value = track.values.map(
          (v, i) =>
            (vrm.meta?.metaVersion === "0" && i % 3 !== 1 ? -v : v) *
            hipsPositionScale
        );
        tracks.push(
          new THREE.VectorKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times,
            value
          )
        );
      }
    }
  });

  return {
    clip: new THREE.AnimationClip("vrmAnimation", clip.duration, tracks),
  };
}

const mootionVRMRigMap: { [mootionBoneName: string]: VRMHumanBoneName } = {
  MootionRigHips: "hips",
  MootionRigSpine: "spine",
  MootionRigLeftUpLeg: "leftUpperLeg",
  MootionRigRightUpLeg: "rightUpperLeg",
  MootionRigLeftLeg: "leftLowerLeg",
  MootionRigRightLeg: "rightLowerLeg",
  MootionRigSpine1: "spine",
  MootionRigLeftFoot: "leftFoot",
  MootionRigRightFoot: "rightFoot",
  MootionRigSpine2: "upperChest",
  MootionRigLeftToeBase: "leftToes",
  MootionRigRightToeBase: "rightToes",
  MootionRigNeck: "neck",
  MootionRigLeftShoulder: "leftShoulder",
  MootionRigRightShoulder: "rightShoulder",
  MootionRigHead: "head",
  MootionRigLeftArm: "leftUpperArm",
  MootionRigRightArm: "rightUpperArm",
  MootionRigLeftForeArm: "leftLowerArm",
  MootionRigRightForeArm: "rightLowerArm",
  MootionRigLeftHand: "leftHand",
  MootionRigRightHand: "rightHand",
} as const;
