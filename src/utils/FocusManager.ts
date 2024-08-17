import { Camera, Vector3, Box3 } from "three";
import { VRM, VRMHumanBoneName } from "@pixiv/three-vrm";

export class FocusManager {
  private _camera: Camera;
  private _vrm: VRM;
  private _isFocused: boolean = false;
  private _focusIntensity: number = 0.05; // Fixed focus intensity
  private _snapThreshold: number = 10; // Threshold for snapping to the target

  constructor(camera: Camera, vrm: VRM) {
    this._camera = camera;
    this._vrm = vrm;
  }

  get isFocused() {
    return this._isFocused;
  }

  unfocus() {
    this._isFocused = false;
  }

  focus() {
    const head = this._vrm.humanoid.getNormalizedBoneNode(
      VRMHumanBoneName.Head
    );

    if (head) {
      const headWorldPosition = new Vector3();
      head.getWorldPosition(headWorldPosition);

      const box = new Box3().setFromObject(this._vrm.scene);
      const size = box.getSize(new Vector3());
      const distanceInFront = size.z * 2.5;

      // Calculate head direction (normal)
      const headDirection = new Vector3();
      head.getWorldDirection(headDirection);
      headDirection.normalize();

      // Calculate the target position directly in front of the face
      const targetX = headWorldPosition.x - headDirection.x * distanceInFront;
      const targetY = headWorldPosition.y;
      const targetZ = headWorldPosition.z - headDirection.z * distanceInFront;

      const xDistance = Math.abs(targetX - this._camera.position.x);
      const yDistance = Math.abs(targetY - this._camera.position.y);
      const zDistance = Math.abs(targetZ - this._camera.position.z);

      const xMultiplier = Math.pow(xDistance, 2);
      const yMultiplier = Math.pow(yDistance, 2);
      const zMultiplier = Math.pow(zDistance, 2);

      const targetPosition = new Vector3(
        (targetX + this._camera.position.x * xMultiplier) / (xMultiplier + 1),
        (targetY + this._camera.position.y * yMultiplier) / (yMultiplier + 1),
        (targetZ + this._camera.position.z * zMultiplier) / (zMultiplier + 1)
      );

      // Interpolate the camera position for smooth transition
      this._camera.position.lerp(targetPosition, this._focusIntensity);

      // Make the camera look at the head
      this._camera.lookAt(headWorldPosition);
    }

    this._isFocused = true;
  }

  update(delta: number) {
    if (this._isFocused) {
      this.focus();
    }
  }
}
