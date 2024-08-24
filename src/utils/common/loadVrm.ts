// Import necessary classes and types
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";

// Define the loadVrm function
export function loadVrm(vrmUrl: string, buffer: ArrayBuffer): Promise<VRM> {
  return new Promise(async (resolve, reject) => {
    const loader = new GLTFLoader();

    // Register the VRMLoaderPlugin with the GLTFLoader
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const gltf: GLTF | void = await loader
      .parseAsync(buffer, vrmUrl)
      .catch((error) => {
        reject(new Error("Failed to parse VRM model."));
        return error;
      });
    if (!gltf) {
      return;
    }
    // Once loaded, retrieve the VRM model from gltf.userData
    const vrm = gltf.userData.vrm as VRM;
    if (vrm) {
      resolve(vrm);
    } else {
      reject(new Error("Failed to load VRM model."));
    }
  });
}
