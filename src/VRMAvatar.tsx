import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { VRM } from "@pixiv/three-vrm";
import { Object3D, Group, Vector3, Scene, Camera } from "three";
import { DefaultLoadingFallback } from "./LoadingFallback";
import { VRMManager } from "./utils/VRMManager"; // Import VRMManager
import { MotionConversionWorkerClient } from "./utils/MotionExpressionWorkerClient";
import { abFetch } from "./utils/converters/_common/arrayBufferFetcher";
import { loadVrm } from "./utils/common/loadVrm";
import { Suspendable } from "./Suspendable";
import { VRMAvatarImpl } from "./VRMAvatarImpl";

export interface VRMAvatarProps {
  scene: Scene;
  camera: Camera;
  vrmUrl: string;
  prefetchFiles?: string[];
  motionExpressionWorkerUrl?: string;
  initialPosition?: Vector3;
  onLoad?: (vrmManager: VRMManager) => void;
  onProgress?: (progress: number) => void;
}

export const VRMAvatar: React.FC<VRMAvatarProps> = (props) => {
  const progress = useRef(0);
  const progressUpdateRef = useRef<() => void>();

  return (
    <Suspense
      fallback={
        <DefaultLoadingFallback
          position={props.initialPosition ?? new Vector3(0, 1, 0)}
          progress={progress.current}
          onInit={(u) => {
            progressUpdateRef.current = u;
          }}
        />
      }
    >
      <Suspendable
        promise={(async () => {
          const buffer = await loadVrmArrayBuffer(
            props.vrmUrl,
            (newProgress) => {
              progressUpdateRef.current && progressUpdateRef.current();
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
                <VRMAvatarImpl
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
