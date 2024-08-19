import React, { Suspense, useRef, useEffect, useState } from "react";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRM } from "@pixiv/three-vrm";
import { Object3D, Group, Vector3 } from "three";
import { LoadingFallback } from "./LoadingFallback";
import VRMManager from "./utils/VRMManager"; // Import VRMManager

interface VRMAvatarProps {
  vrmUrl: string;
  initialPosition?: Vector3;
  onLoad?: (vrmManager: VRMManager) => void;
  onProgress?: (progress: number) => void;
}

const VRMAvatarComponent: React.FC<VRMAvatarProps> = ({
  vrmUrl,
  onLoad,
  onProgress,
  initialPosition,
}) => {
  const { scene, camera } = useThree();
  const avatarRef = useRef<Object3D | null>(null);
  const vrmManagerRef = useRef<VRMManager | null>(null); // Reference to store VRMManager
  const gltf = useLoader(
    GLTFLoader,
    vrmUrl,
    (loader) => {
      loader.register((parser) => new VRMLoaderPlugin(parser));
    },
    (progressEvent) => {
      if (progressEvent.lengthComputable) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress && onProgress(progress);
      }
    }
  );

  const vrm = gltf.userData.vrm as VRM;

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
export const VRMAvatar: React.FC<VRMAvatarProps> = (props) => {
  const [progress, setProgress] = useState(0);

  return (
    <Suspense
      fallback={
        <LoadingFallback
          position={props.initialPosition ?? new Vector3(0, 1, 0)}
          progress={progress}
        />
      }
    >
      <VRMAvatarComponent
        {...props}
        onProgress={(progress) => {
          setProgress(progress);
          if (props.onProgress) {
            props.onProgress(progress);
          }
        }}
      />
    </Suspense>
  );
};
