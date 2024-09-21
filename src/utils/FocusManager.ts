import { Camera, Vector3, Box3 } from "three";
import { VRM, VRMHumanBoneName } from "@pixiv/three-vrm";

export class FocusManager {
  private _camera: Camera;
  private _vrm: VRM;
  private _isFocused: boolean = false;
  private _cameraOffset: Vector3 = new Vector3(0, 0, 0); // Offset from the head
  private _lookAtOffset: Vector3 = new Vector3(0, 0, 0); // Offset from the head
  private _currentLookAtPosition = new Vector3();
  private _focusIntensity: number = 0.01; // Fixed focus intensity
  private _focusCallback?: (isAtTarget: boolean) => void;
  private _unfocusResolve?: () => void;
  private _shouldUnfocus: boolean = false;

  constructor(camera: Camera, vrm: VRM) {
    this._camera = camera;
    this._vrm = vrm;
  }

  get isFocused() {
    return this._isFocused;
  }

  unfocus() {
    this._focusCallback = undefined;
    this._shouldUnfocus = true;
    if (this._unfocusResolve) {
      this._unfocusResolve();
    }
    return new Promise((resolve) => {
      this._unfocusResolve = () => {
        this._isFocused = false;
        resolve(void 0);
      };
      this.update(0);
    });
  }

  focus(
    focusProps: {
      focusIntensity?: number;
      cameraOffset?: Vector3;
      lookAtOffset?: Vector3;
    } = {
      focusIntensity: this._focusIntensity ?? 0.01,
      cameraOffset: this._cameraOffset ?? new Vector3(0, 0, 0),
      lookAtOffset: this._lookAtOffset ?? new Vector3(0, 0, 0),
    },
    callback?: (isAtTarget: boolean) => void
  ) {
    this._focusCallback = callback;
    const { focusIntensity, cameraOffset, lookAtOffset } = focusProps;
    this._focusIntensity = focusIntensity ?? 0.01;
    this._cameraOffset = cameraOffset ?? new Vector3(0, 0, 0);
    this._lookAtOffset = lookAtOffset ?? new Vector3(0, 0, 0);
    this._isFocused = true;
  }

  update(delta: number) {
    if (!this._isFocused) {
      return;
    } else if (this._shouldUnfocus) {
      this._unfocusResolve && this._unfocusResolve();
      this._shouldUnfocus = false;
      this._unfocusResolve = undefined;
      const direction = new Vector3();
      this._camera.lookAt(this._camera.getWorldDirection(direction));
      return;
    }

    const head = this._vrm.humanoid.getNormalizedBoneNode(
      VRMHumanBoneName.Head
    );

    if (!head) {
      return;
    }
    const headWorldPosition = new Vector3();
    head.getWorldPosition(headWorldPosition);

    // Calculate head direction (normal)
    const headDirection = new Vector3();
    head.getWorldDirection(headDirection);
    headDirection.normalize();

    const box = new Box3().setFromObject(this._vrm.scene);
    const size = box.getSize(new Vector3());
    const distanceInFront = size.z * 2.5;

    const yFactor = 1 - Math.abs(headDirection.y) * 0.5; // Reduces zoom-in effect when looking down

    // Calculate the target position directly in front of the face
    const rawTargetX = headWorldPosition.x - headDirection.x * distanceInFront;
    const rawTargetY = headWorldPosition.y;
    const rawTargetZ =
      headWorldPosition.z - (headDirection.z * distanceInFront) / yFactor;

    const targetX = rawTargetX + this._cameraOffset.x;
    const targetY = rawTargetY + this._cameraOffset.y;
    const targetZ = rawTargetZ + this._cameraOffset.z;

    const xDistance = Math.abs(targetX - this._camera.position.x);
    const yDistance = Math.abs(targetY - this._camera.position.y);
    const zDistance = Math.abs(targetZ - this._camera.position.z);
    const distance = Math.sqrt(
      xDistance * xDistance + yDistance * yDistance + zDistance * zDistance
    );

    const xMultiplier = Math.pow(xDistance, 2);
    const yMultiplier = Math.pow(yDistance, 4);
    const zMultiplier = Math.pow(zDistance, 2);

    const targetPosition = new Vector3(
      (targetX + this._camera.position.x * xMultiplier) / (xMultiplier + 1),
      (targetY + this._camera.position.y * yMultiplier) / (yMultiplier + 1),
      (targetZ + this._camera.position.z * zMultiplier) / (zMultiplier + 1)
    );

    // Calculate the total distance from the camera to the target position
    const distanceToTarget = Math.sqrt(
      xDistance * xDistance + yDistance * yDistance + zDistance * zDistance
    );

    const focusIntensity =
      this._focusIntensity * Math.pow(distanceToTarget + 1, 3);

    // Interpolate the camera position for smooth transition
    this._camera.position.lerp(
      targetPosition,
      focusIntensity > 1 ? 0.99 : focusIntensity
    );

    this._vrm.lookAt?.lookAt(this._camera.position);

    const lookAtPosition = new Vector3();
    head.getWorldPosition(lookAtPosition);

    const currentLookAtPosition = new Vector3();
    lookAtPosition.add(this._lookAtOffset);

    if (this._currentLookAtPosition.lengthSq() === 0) {
      this._currentLookAtPosition.copy(lookAtPosition);
    }

    const lookAtXDistance = Math.abs(
      lookAtPosition.x - this._currentLookAtPosition.x
    );
    const lookAtYDistance = Math.abs(
      lookAtPosition.y - this._currentLookAtPosition.y
    );
    const lookAtZDistance = Math.abs(
      lookAtPosition.z - this._currentLookAtPosition.z
    );

    const lookAtXMultiplier = Math.pow(lookAtXDistance, 2);
    const lookAtYMultiplier = Math.pow(lookAtYDistance, 4);
    const lookAtZMultiplier = Math.pow(lookAtZDistance, 2);

    const targetLookAtPosition = new Vector3(
      (lookAtPosition.x + this._currentLookAtPosition.x * lookAtXMultiplier) /
        (lookAtXMultiplier + 1),
      (lookAtPosition.y + this._currentLookAtPosition.y * lookAtYMultiplier) /
        (lookAtYMultiplier + 1),
      (lookAtPosition.z + this._currentLookAtPosition.z * lookAtZMultiplier) /
        (lookAtZMultiplier + 1)
    );

    // Interpolate the lookAt position for smooth transition
    this._currentLookAtPosition.lerp(
      targetLookAtPosition,
      focusIntensity > 1 ? 0.99 : focusIntensity
    );

    // Update the camera to look at the interpolated position
    this._camera.lookAt(this._currentLookAtPosition);

    this._focusCallback && this._focusCallback(distance < 0.01);
  }
}
