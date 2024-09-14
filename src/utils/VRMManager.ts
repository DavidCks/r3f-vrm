import { Camera } from "three";
import { VRM } from "@pixiv/three-vrm";
import { FocusManager } from "./FocusManager"; // Named import for FocusManager
import { ExpressionManager } from "./ExpressionManager";
import { PositionManager } from "./PositionManager";
import { MotionConversionWorkerClient } from "./MotionExpressionWorkerClient";

export class VRMManager {
  public vrm: VRM;
  public focusManager: FocusManager;
  public expressionManager: ExpressionManager;
  public positionManager: PositionManager;
  private _vrmUrl: string;

  constructor(
    camera: Camera,
    vrm: VRM,
    vrmUrl: string,
    motionConversionWorkerClient?: MotionConversionWorkerClient
  ) {
    this.vrm = vrm; // Public access to the VRM instance
    this._vrmUrl = vrmUrl; // Private access to the VRM URL
    this.focusManager = new FocusManager(camera, vrm); // Instantiate FocusManager
    this.expressionManager = new ExpressionManager(
      vrm,
      vrmUrl,
      motionConversionWorkerClient
    ); // Instantiate ExpressionManager
    this.positionManager = new PositionManager(vrm); // Instantiate PositionManager
  }

  // Update function to call the update functions of the various managers
  update(delta: number) {
    this.expressionManager.update(delta);
    this.focusManager.update(delta);
    this.vrm.update(delta);
    // You can add more update logic here if other components need updating
  }

  // Add other VRM-related methods here in the future
}
