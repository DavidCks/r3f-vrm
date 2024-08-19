import { Camera } from "three";
import { VRM } from "@pixiv/three-vrm";
import { FocusManager } from "./FocusManager"; // Named import for FocusManager
import { ExpressionManager } from "./ExpressionManager";
import { PositionManager } from "./PositionManager";

class VRMManager {
  public vrm: VRM;
  public focusManager: FocusManager;
  public expressionManager: ExpressionManager;
  public positionManager: PositionManager;

  constructor(camera: Camera, vrm: VRM) {
    this.vrm = vrm; // Public access to the VRM instance
    this.focusManager = new FocusManager(camera, vrm); // Instantiate FocusManager
    this.expressionManager = new ExpressionManager(vrm); // Instantiate ExpressionManager
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

export default VRMManager;
