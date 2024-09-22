# r3f-vrm

This package provides a set of tools and components to easily integrate and interact with VRM avatars using `@react-three/fiber` and Three.js. It includes several managers for handling expressions, positions, and focus, as well as utilities for loading and managing VRM models and their animations.

It currently provides utilities for converting fbx, vrma, and bvh files to expressions.

## Table of Contents

- [r3f-vrm](#r3f-vrm)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Animations](#animations)
    - [Supported Animation Formats](#supported-animation-formats)
  - [Usage](#usage)
    - [VRMAvatar](#vrmavatar)
      - [Example](#example)
  - [Managers](#managers)
    - [VRMManager](#vrmmanager)
      - [Methods](#methods)
    - [FocusManager](#focusmanager)
      - [Methods](#methods-1)
    - [ExpressionManager](#expressionmanager)
      - [Methods](#methods-2)
      - [Animation Conversion Worker](#animation-conversion-worker)
      - [Prefetching Animations](#prefetching-animations)
    - [PositionManager](#positionmanager)
      - [Methods](#methods-3)
  - [Development](#development)
  - [License](#license)

## Installation

This package is hosted on npm:

```bash
npm install @DavidCks/r3f-vrm
```

## Animations

You can use FBX, BVH, and VRMA files for animations. The `MotionExpressionManager` will convert these files to expressions that can be applied to the VRM model.

### Supported Animation Formats

- FBX:
  - mixamo
  - mootion
- BVH:
  - MoMask
- VRMA:
  - all

## Usage

### VRMAvatar

`VRMAvatar` is a r3f component that loads a VRM model and triggers callbacks when the model is loaded and during the loading process. It integrates with the `VRMManager` to allow for controlling expressions and other interactions.

#### Example

```jsx
import React from "react";
import { VRMAvatar } from "r3f-vrm";
import { Vector3 } from "three";
import { useThree } from "@react-three/fiber";

const MyVRMAvatar: React.FC = () => {
  const managerRef = React.useRef<VRMManager>(null);
  const {scene, camera} = useThree();

  useFrame((_,delta) => {
    scene.update(delta);
  });

  return (
    <VRMAvatar
      scene={scene}
      camera={camera}
      vrmUrl="path_to_vrm.vrm"
      onLoad={
        (manager) => {
          managerRef.current = manager;
          manager.focusManager.focus();
        }
      }
    />
  );
};

export default MyVRMAvatar;
```

## Managers

### VRMManager

`VRMManager` is the central class that manages the VRM model, including its focus, expressions, and position. It integrates with the `VRM` object and the Three.js `Camera` and `Scene`, and provides methods to control the avatar.

#### Methods

- `update(delta: number)`: Updates the VRM model and its managers. Call this method each frame.
- `focusManager`: Handles camera focus on the avatar.
- `expressionManager`: Manages facial, mouth, and motion expressions.
- `positionManager`: Controls the position of the VRM model.

### FocusManager

The `FocusManager` controls the camera's focus on the VRM model's head with smooth transitions and offsets.

#### Methods

- `focus(focusProps)`: Focuses the camera on the VRM model with optional properties.
- `unfocus()`: Removes the focus from the VRM model.
- `update(delta: number)`: Updates the focus each frame. The VRMManager handles focus updates in its' update method.

### ExpressionManager

`ExpressionManager` handles the expressions of the VRM model, including face, mouth, and motion expressions. It delegates these responsibilities to specific sub-managers.

#### Methods

- `express(expressionInput)`: Applies expressions to the VRM model.
- `update(delta: number)`: Processes expressions each frame. The VRMManager handles expression updates in its' update method.

#### Animation Conversion Worker

The conversion of animation files (fbx, vrma, bvh) to expressions can be offloaded to a Web Worker. This worker is created and managed by the `MotionExpressionWorkerClient` class, which is used internally by the `MotionExpressionManager`.

This is useful for offloading the conversion process to a separate thread, preventing the main thread from being blocked during the conversion to avoid performance issues such as stuttering.

To use the worker, you need to copy the `motion-expression-worker.bundle.js` file from the build directory to your public directory and pass the url to the `VRMAvatar` components `motionExpressionWorkerUr` prop:

```tsx
<VRMAvatar
  ...
  motionExpressionWorkerUrl={"motion-expression-worker.bundle.js"}
  ...
/>
```

To copy it to the public directory, you should use your build tool (e.g., webpack, parcel, etc.) to copy the file to the public directory. For example, in webpack, you can use the `CopyWebpackPlugin`:

```js
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  ...
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "node_modules/@DavidCks/r3f-vrm/build/motion-expression-worker.bundle.js", to: "public" },
      ],
    }),
  ],
  ...
};
```

#### Prefetching Animations

The `VRMAvatar` has a `prefetchFiles` prop that will prefetch the animations in the background. You can use this if you know you'll need the animations later on and want to avoid loading times.

```tsx
<VRMAvatar
  ...
  prefetchFiles={["idle.fbx", "walk.bvh", "run.vrma", ...]}
  ...
/>
```

### PositionManager

`PositionManager` controls the position of the VRM model in the 3D space.

#### Methods

- `get position()`: Returns the current position of the VRM model.
- `set position(newPosition: Vector3)`: Sets a new position for the VRM model.
- `updatePosition(newPosition: Vector3)`: Updates the position.
- `move(delta: Vector3)`: Moves the VRM model by a delta value.

## Development

To modify or extend this package, fork or clone the repository and install dependencies:

```bash
git clone https://github.com/DavidCks/r3f-vrm.git
cd r3f-vrm
npm install
```

The src directory has an index.tsx file that acts as a testing playground. You can use storybook to test and develop through that component (or configure your own if necessary):

```bash
npm run dev
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

This package simplifies the integration of VRM avatars into React applications, providing powerful tools for interaction and animation within a 3D scene.
