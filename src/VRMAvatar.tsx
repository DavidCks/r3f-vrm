import React, { Suspense, useRef, useEffect } from "react";
import { useLoader, useThree, useFrame, invalidate } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRM } from "@pixiv/three-vrm";
import { Object3D, Group } from "three";
import { FallbackSquare } from "./LoadingFallback";
import VRMManager from "./utils/VRMManager"; // Import VRMManager

interface VRMAvatarProps {
  vrmUrl: string;
  onLoad?: (vrmManager: VRMManager) => void;
}

const VRMAvatarComponent: React.FC<VRMAvatarProps> = ({ vrmUrl, onLoad }) => {
  const { scene, camera } = useThree();
  const avatarRef = useRef<Object3D | null>(null);
  const vrmManagerRef = useRef<VRMManager | null>(null); // Reference to store VRMManager
  const gltf = useLoader(GLTFLoader, vrmUrl, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  const vrm = gltf.userData.vrm as VRM;

  if (!avatarRef.current) {
    avatarRef.current = vrm.scene;
    scene.add(vrm.scene as Group);
  }

  useEffect(() => {
    if (vrm && camera) {
      const vrmManager = new VRMManager(camera, vrm);
      vrmManagerRef.current = vrmManager; // Store VRMManager in ref
      if (onLoad) {
        onLoad(vrmManager); // Pass the VRMManager instance to the onLoad callback
      }
    }
  }, [vrm, camera, onLoad]);

  // Frame updates for VRMManager
  useFrame((_, delta) => {
    if (vrmManagerRef.current) {
      vrmManagerRef.current.update(delta); // Call the update method on every frame
    }
  });

  return null;
};

// Wrapper component to add Suspense
export const VRMAvatar: React.FC<VRMAvatarProps> = ({ vrmUrl, onLoad }) => {
  return (
    <Suspense fallback={<FallbackSquare />}>
      <VRMAvatarComponent vrmUrl={vrmUrl} onLoad={onLoad} />
    </Suspense>
  );
};
