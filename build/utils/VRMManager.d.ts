import { Camera } from "three";
import { VRM } from "@pixiv/three-vrm";
import { FocusManager } from "./FocusManager";
import { ExpressionManager } from "./ExpressionManager";
import { PositionManager } from "./PositionManager";
import { MotionConversionWorkerClient } from "./MotionExpressionWorkerClient";
export declare class VRMManager {
    vrm: VRM;
    focusManager: FocusManager;
    expressionManager: ExpressionManager;
    positionManager: PositionManager;
    private _vrmUrl;
    constructor(camera: Camera, vrm: VRM, vrmUrl: string, motionConversionWorkerClient?: MotionConversionWorkerClient);
    update(delta: number): void;
}
//# sourceMappingURL=VRMManager.d.ts.map