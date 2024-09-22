import { Camera } from "three";
import { VRM } from "@pixiv/three-vrm";
import { FocusManager } from "../../src/utils/FocusManager";
import { ExpressionManager } from "../../src/utils/ExpressionManager";
import { PositionManager } from "../../src/utils/PositionManager";
import { MotionConversionWorkerClient } from "../../src/utils/MotionExpressionWorkerClient";
export declare class VRMManager {
  vrm: VRM;
  focusManager: FocusManager;
  expressionManager: ExpressionManager;
  positionManager: PositionManager;
  private _vrmUrl;
  constructor(
    camera: Camera,
    vrm: VRM,
    vrmUrl: string,
    motionConversionWorkerClient?: MotionConversionWorkerClient
  );
  update(delta: number): void;
}
//# sourceMappingURL=VRMManager.d.ts.map
