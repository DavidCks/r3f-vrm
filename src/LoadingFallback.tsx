import React, { useEffect, useRef } from "react";
import { Vector3, Color, MeshStandardMaterial } from "three";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

export interface LoadingFallbackProps {
  position?: Vector3;
  progress?: number;
  onInit?: (update: () => void) => void;
}

export const DefaultLoadingFallback: React.FC<LoadingFallbackProps> = ({
  position,
  progress,
  onInit: onLoad,
}) => {
  const ballRef = useRef<Mesh>(null);
  const swirlRef = useRef<Mesh>(null);

  useEffect(() => {
    const update = () => {
      if (ballRef.current) {
        ballRef.current.rotation.y += 0.04;
        ballRef.current.rotation.x += 0.02;
      }
      if (swirlRef.current) {
        swirlRef.current.rotation.x += 0.04 + (progress ?? 0) / 1000;
        swirlRef.current.rotation.y += 0.04 + (progress ?? 0) / 1000;
        swirlRef.current.rotation.z += 0.02 + (progress ?? 0) / 1000;
      }
      if (ballRef.current) {
        // Ensure the material is of type MeshStandardMaterial
        const material = ballRef.current.material as MeshStandardMaterial;
        // Map progress (1-100) to a color gradient from red to green
        // const color = new Color().setHSL(progress / 100, 1, 0.5);
        // material.color.set(color);
      }
    };
    if (onLoad) {
      onLoad(update);
    }
  }, [onLoad]);

  return (
    <group position={position}>
      <mesh ref={ballRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color={"#000080"} />
      </mesh>
      <mesh ref={swirlRef} position={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 16, 100]} />
        <meshStandardMaterial color={"#ffffff"} />
      </mesh>
    </group>
  );
};
