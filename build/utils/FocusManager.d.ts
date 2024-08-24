import { Camera, Vector3 } from "three";
import { VRM } from "@pixiv/three-vrm";
export declare class FocusManager {
    private _camera;
    private _vrm;
    private _isFocused;
    private _cameraOffset;
    private _lookAtOffset;
    private _focusIntensity;
    constructor(camera: Camera, vrm: VRM);
    get isFocused(): boolean;
    unfocus(): void;
    focus(focusProps?: {
        focusIntensity?: number;
        cameraOffset?: Vector3;
        lookAtOffset?: Vector3;
    }): void;
    update(delta: number): void;
}
//# sourceMappingURL=FocusManager.d.ts.map