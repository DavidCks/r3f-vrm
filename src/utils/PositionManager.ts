import { Vector3, Object3D } from "three";
import { VRM } from "@pixiv/three-vrm";

export class PositionManager {
  private _vrm: VRM;
  private _position: Vector3;

  constructor(vrm: VRM) {
    this._vrm = vrm;
    this._position = new Vector3();

    // Initialize the position with the current position of the VRM's scene
    this._vrm.scene.getWorldPosition(this._position);
  }

  // Getter for the VRM's position
  get position(): Vector3 {
    return this._position.clone(); // Return a clone to avoid external mutation
  }

  // Setter for the VRM's position
  set position(newPosition: Vector3) {
    this._position.copy(newPosition);
    this._updateVRMPosition();
  }

  // Method to update position with a new Vector3
  updatePosition(newPosition: Vector3) {
    this._position.copy(newPosition);
    this._updateVRMPosition();
  }

  // Method to move the VRM's position by a delta value
  move(delta: Vector3) {
    this._position.add(delta);
    this._updateVRMPosition();
  }

  // Private method to update the VRM's position
  private _updateVRMPosition() {
    this._vrm.scene.position.copy(this._position);
  }
}
