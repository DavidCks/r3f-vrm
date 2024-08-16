import React from "react";

export const FallbackSquare: React.FC = () => {
  return (
    <mesh>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="lightgray" />
    </mesh>
  );
};
