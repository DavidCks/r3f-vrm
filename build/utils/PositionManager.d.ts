import { Vector3 } from "three";
import { VRM } from "@pixiv/three-vrm";
export declare class PositionManager {
    private _vrm;
    private _position;
    constructor(vrm: VRM);
    get position(): Vector3;
    set position(newPosition: Vector3);
    updatePosition(newPosition: Vector3): void;
    move(delta: Vector3): void;
    private _updateVRMPosition;
}
//# sourceMappingURL=PositionManager.d.ts.map