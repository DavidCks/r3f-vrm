import React from "react";
import { Vector3 } from "three";
import { VRMManager } from "../src/utils/VRMManager";
interface VRMAvatarProps {
  vrmUrl: string;
  prefetchFiles?: string[];
  motionExpressionWorkerUrl?: string;
  initialPosition?: Vector3;
  onLoad?: (vrmManager: VRMManager) => void;
  onProgress?: (progress: number) => void;
}
export declare const VRMAvatar: React.FC<VRMAvatarProps>;
export {};
//# sourceMappingURL=VRMAvatar.d.ts.map
