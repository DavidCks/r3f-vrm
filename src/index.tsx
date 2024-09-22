import React from "react";
import { VRMAvatar, VRMAvatarProps } from "./VRMAvatar";
import { VRMManager } from "./utils/VRMManager";
import { Vector3 } from "three";
import * as THREE from "three";

const relaxedFbxs = ["Relaxed_intensity-2.fbx", "Relaxed_intensity-1.fbx"];
const boredFbxs = ["Bored_intensity-2.fbx"]; //"Relaxed_intensity-1.fbx"];
const peaceSignVrma = "PeaceSign.vrma";

export const VRMTestComponent: React.FC<VRMAvatarProps> = (props) => {
  const handleLoad = React.useCallback(
    (vrmManager: VRMManager) => {
      console.log("VRM model loaded and VRMManager initialized.");

      // You can now use vrmManager.focusManager to focus the camera
      vrmManager.focusManager.focus({
        focusIntensity: 0.05,
        cameraOffset: new Vector3(0, 0.2, -1),
        lookAtOffset: new Vector3(0, -0.2, 0),
      });

      // Utility function to repeat expressions
      const repeatExpressions = <T,>(expressions: T[], factor: number): T[] => {
        const repeatedExpressions: T[] = [];
        for (let i = 0; i < factor; i++) {
          repeatedExpressions.push(...expressions);
        }
        return repeatedExpressions;
      };

      // Original face expressions
      const faceExpressions = [
        { duration: 2000, angry: 1 },
        { duration: 2000, happy: 1 },
        { duration: 2000, neutral: 1 },
        { duration: 2000, relaxed: 1 },
        { duration: 2000, sad: 1 },
        { duration: 2000, surprised: 1 },
      ];

      // Original mouth expressions
      const mouthExpressions = [
        { duration: 1000, aa: 1 },
        { duration: 1000, ee: 1 },
        { duration: 1000, ih: 1 },
        { duration: 1000, oh: 1 },
        { duration: 1000, ou: 1 },
      ];

      const motionExpressionPromise =
        vrmManager.expressionManager.motion.fbx2motion(relaxedFbxs[0]);

      motionExpressionPromise.then((motionExpression) => {
        // Repeat expressions by a factor of 10
        const repeatedFaceExpressions = repeatExpressions(faceExpressions, 10);
        const repeatedMouthExpressions = repeatExpressions(
          mouthExpressions,
          10
        );
        motionExpression.duration = 10000;
        // Call the express function with all expressions
        vrmManager.expressionManager
          .express({
            faceExpressions: repeatedFaceExpressions,
            mouthExpressions: repeatedMouthExpressions,
            motionExpressions: [motionExpression], // Add any motion expressions if needed
          })
          .subscribe((progress) => {});
        props.onLoad && props.onLoad(vrmManager);
      });
    },
    [props.onLoad]
  );

  return (
    <VRMAvatar
      {...props}
      motionExpressionWorkerUrl={"motion-expression-worker.bundle.js"}
      onLoad={handleLoad}
    />
  );
};
