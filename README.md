# r3f-vrm

This package provides a set of tools and components to easily integrate and interact with VRM avatars using `@react-three/fiber` and Three.js. It includes several managers for handling expressions, positions, and focus, as well as utilities for loading and managing VRM models and their animations.

## Table of Contents

- [r3f-vrm](#r3f-vrm)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
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
    - [PositionManager](#positionmanager)
      - [Methods](#methods-3)
  - [Development](#development)
  - [License](#license)

## Installation

This package is hosted on npm:

```bash
npm install @DavidCks/r3f-vrm
```

## Usage

### VRMAvatar

`VRMAvatar` is a r3f component that loads a VRM model and triggers callbacks when the model is loaded or during the loading process. It integrates with the `VRMManager` to allow for controlling expressions and other interactions.

#### Example

```tsx
import React from "react";
import { VRMAvatar } from "r3f-vrm";
import { Vector3 } from "three";

const MyVRMAvatar: React.FC = () => {
  return (
    <VRMAvatar vrmUrl="path_to_vrm.vrm" initialPosition={new Vector3(0, 1, 0)} />
  );
};

export default MyVRMAvatar;
```

## Managers

### VRMManager

`VRMManager` is the central class that manages the VRM model, including its focus, expressions, and position. It is initialized with a `VRM` object and a Three.js `Camera`, and provides methods to control these aspects of the avatar.

#### Methods

- `update(delta: number)`: Updates the VRM model and its managers.
- `focusManager`: Handles camera focus on the avatar.
- `expressionManager`: Manages facial, mouth, and motion expressions.
- `positionManager`: Controls the position of the VRM model.

### FocusManager

The `FocusManager` controls the camera's focus on the VRM model's head, providing smooth transitions and offsets.

#### Methods

- `focus(focusProps)`: Focuses the camera on the VRM model with optional properties.
- `unfocus()`: Removes the focus from the VRM model.
- `update(delta: number)`: Updates the focus each frame.

### ExpressionManager

`ExpressionManager` handles the expressions of the VRM model, including face, mouth, and motion expressions. It delegates these responsibilities to specific sub-managers.

#### Methods

- `express(expressionInput)`: Applies expressions to the VRM model.
- `update(delta: number)`: Processes expressions over time.

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

You can use storybook to test and develop components:

```bash
npm run dev
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

This package simplifies the integration of VRM avatars into React applications, providing powerful tools for interaction and animation within a 3D scene.
