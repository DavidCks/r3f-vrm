import React from "react";
import { Canvas } from "@react-three/fiber";
import { VRMAvatar } from "./VRMAvatar";
import VRMManager from "./utils/VRMManager";
import { Grid, OrbitControls } from "@react-three/drei";

export const VRMComponent: React.FC = () => {
  const handleLoad = async (vrmManager: VRMManager) => {
    console.log("VRM model loaded and VRMManager initialized.");

    // You can now use vrmManager.focusManager to focus the camera
    vrmManager.focusManager.focus();

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

    const motionExpression =
      await vrmManager.expressionManager.motion.bvh2motion("Warmup.bvh");

    // Repeat expressions by a factor of 10
    const repeatedFaceExpressions = repeatExpressions(faceExpressions, 10);
    const repeatedMouthExpressions = repeatExpressions(mouthExpressions, 10);

    // Call the express function with all expressions
    vrmManager.expressionManager.express({
      faceExpressions: repeatedFaceExpressions,
      mouthExpressions: repeatedMouthExpressions,
      motionExpressions: [motionExpression], // Add any motion expressions if needed
    });

    // Extend this to add more functionality in the future
  };

  return (
    <Canvas
      camera={{ near: 0.01, far: 1000 }}
      style={{ height: "800px", width: "100%" }} // Set the height to 800px and width to 100%
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      {/* Use "Ruri.vrm" as the path to your VRM file */}
      <VRMAvatar vrmUrl="Ruri.vrm" onLoad={handleLoad} />
      <Grid
        args={[10, 10]} // Size of the grid
        rotation={[0, 0, 0]} // Rotate to lie on the XZ plane
        position={[0, 0, 0]} // Position the grid at the origin
      />
      <OrbitControls />
    </Canvas>
  );
};