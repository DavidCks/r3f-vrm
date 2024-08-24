import * as THREE from "three";
import { GLTFExporterPlugin, GLTFWriter } from "three/examples/jsm/exporters/GLTFExporter.js";
export declare class VRMAnimationExporterPlugin implements GLTFExporterPlugin {
    readonly writer: GLTFWriter;
    readonly name = "VRMC_vrm_animation";
    constructor(writer: GLTFWriter);
    afterParse(input: THREE.Object3D | THREE.Object3D[]): void;
}
//# sourceMappingURL=vrmAnimationExporterPlugin.d.ts.map