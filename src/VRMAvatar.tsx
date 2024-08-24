import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRM } from "@pixiv/three-vrm";
import { Object3D, Group, Vector3 } from "three";
import { DefaultLoadingFallback } from "./LoadingFallback";
import VRMManager from "./utils/VRMManager"; // Import VRMManager
import { MotionConversionWorkerClient } from "./utils/MotionExpressionWorkerClient";
import { abFetch } from "./utils/converters/_common/arrayBufferFetcher";
import { loadVrm } from "./utils/common/loadVrm";
import useSuspense from "./utils/common/useSuspense";
import { Suspendable } from "./Suspendable";

interface VRMAvatarProps {
  vrmUrl: string;
  prefetchFiles?: string[];
  motionExpressionWorkerUrl?: string;
  initialPosition?: Vector3;
  onLoad?: (vrmManager: VRMManager) => void;
  onProgress?: (progress: number) => void;
}

interface VRMAvatarComponentProps extends VRMAvatarProps {
  vrmArrayBuffer: ArrayBuffer;
  vrmBlobUrl: string;
  vrm: VRM;
  motionExpressionWorkerClient?: MotionConversionWorkerClient;
}

const VRMAvatarComponent: React.FC<VRMAvatarComponentProps> = ({
  vrmUrl,
  vrm,
  motionExpressionWorkerClient,
  onLoad,
  initialPosition,
}) => {
  const { scene, camera } = useThree();
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
      const vrmManager = new VRMManager(
        camera,
        vrm,
        vrmUrl,
        motionExpressionWorkerClient
      );
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

async function loadVrmArrayBuffer(
  vrmUrl: string,
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  const buffer = await abFetch(
    vrmUrl,
    (_, progress) => onProgress && onProgress(progress)
  );
  return buffer;
}

// Wrapper component to add Suspense
export const VRMAvatar: React.FC<VRMAvatarProps> = (props) => {
  const progress = useRef(0);

  return (
    <Suspense
      fallback={
        <DefaultLoadingFallback
          position={props.initialPosition ?? new Vector3(0, 1, 0)}
          progress={progress.current}
        />
      }
    >
      <Suspendable
        promise={(async () => {
          const buffer = await loadVrmArrayBuffer(
            props.vrmUrl,
            (newProgress) => {
              progress.current = newProgress;
              if (props.onProgress) {
                props.onProgress(newProgress);
              }
            }
          );
          const blobUrl = URL.createObjectURL(new Blob([buffer]));
          const mewc =
            props.motionExpressionWorkerUrl !== undefined
              ? new MotionConversionWorkerClient(
                  props.motionExpressionWorkerUrl,
                  blobUrl,
                  buffer,
                  props.prefetchFiles
                )
              : undefined;
          return { buffer, blobUrl, mewc };
        })()}
      >
        {({ buffer, blobUrl, mewc }) => {
          return (
            <Suspendable promise={loadVrm(props.vrmUrl, buffer)}>
              {(vrm) => (
                <VRMAvatarComponent
                  vrm={vrm}
                  vrmBlobUrl={blobUrl}
                  vrmArrayBuffer={buffer}
                  motionExpressionWorkerClient={mewc}
                  {...props}
                />
              )}
            </Suspendable>
          );
        }}
      </Suspendable>
    </Suspense>
  );
};
