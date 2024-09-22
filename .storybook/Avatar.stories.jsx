import React from "react";
import { VRMTestComponent } from "../dist/index.esm.js";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

export default {
  component: VRMTestComponent,
  title: "Avatar",
};

export const Placeholder = () => (
  <Canvas
    camera={{ near: 0.01, far: 1000, position: [0, 1, 5] }} // Set the camera position
    style={{ height: "800px", width: "100%" }} // Set the height to 800px and width to 100%
  >
    <ambientLight intensity={0.5} />
    <directionalLight position={[0, 10, 5]} intensity={1} />
    <Grid
      args={[10, 10]} // Size of the grid
      rotation={[0, 0, 0]} // Rotate to lie on the XZ plane
      position={[0, 0, 0]} // Position the grid at the origin
    />
    <Character />
    <OrbitControls />
  </Canvas>
);

const Character = () => {
  const managerRef = React.useRef();
  const { camera, scene } = useThree();
  useFrame((_, delta) => {
    if (managerRef.current) {
      managerRef.current.update(delta);
    }
  });

  return (
    <VRMTestComponent
      onLoad={(manager) => (managerRef.current = manager)}
      camera={camera}
      scene={scene}
      vrmUrl="Yui.vrm"
    />
  );
};
