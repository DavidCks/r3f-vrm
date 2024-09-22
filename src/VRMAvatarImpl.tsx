import { Group, Object3D } from "three";
import { VRMManager } from "./utils/VRMManager";
import { useEffect, useRef } from "react";
import { VRMAvatarProps } from "./VRMAvatar";
import { MotionConversionWorkerClient } from "./utils/MotionExpressionWorkerClient";
import { VRM } from "@pixiv/three-vrm";

export interface VRMAvatarImplProps extends VRMAvatarProps {
  vrmArrayBuffer: ArrayBuffer;
  vrmBlobUrl: string;
  vrm: VRM;
  motionExpressionWorkerClient?: MotionConversionWorkerClient;
}

export const VRMAvatarImpl: React.FC<VRMAvatarImplProps> = ({
  vrmUrl,
  vrm,
  motionExpressionWorkerClient,
  onLoad,
  initialPosition,
  scene,
  camera,
}) => {
  const avatarRef = useRef<Object3D | null>(null);
  const vrmManagerRef = useRef<VRMManager | null>(null); // Reference to store VRMManager

  useEffect(() => {
    if (vrm && camera) {
      if (!avatarRef.current) {
        avatarRef.current = vrm.scene;
        vrm.scene.traverse(function (obj) {
          obj.frustumCulled = false;
        });
        initialPosition && vrm.scene.position.copy(initialPosition);
        scene.add(vrm.scene as Group);
      }
      if (!vrmManagerRef.current) {
        const vrmManager = new VRMManager(
          camera,
          vrm,
          vrmUrl,
          motionExpressionWorkerClient
        );
        vrmManagerRef.current = vrmManager; // Store VRMManager in ref
      }
      if (onLoad) {
        onLoad(vrmManagerRef.current); // Pass the VRMManager instance to the onLoad callback
      }
    }
  }, [vrm, camera, onLoad]);

  return null;
};
