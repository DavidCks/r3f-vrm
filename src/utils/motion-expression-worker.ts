import { MotionExpression } from "./MotionExpressionManager";
import { VRM } from "@pixiv/three-vrm";
import { BVHConverter } from "./converters/BVHConverter";
import { FBXConverter } from "./converters/FBXConverter";
import { VRMAConverter } from "./converters/VRMAConverter";
import { AnimationClip } from "three";
import { loadVrm } from "./common/loadVrm";

type MotionExpressionWorkerResponseData =
  | {
      kind: "progress";
      data: {
        name: string;
        progress: number;
      };
    }
  | {
      kind: "output";
      data: {
        clip: any; //json
      };
    };

export type MotionExpressionWorkerResponse = {
  uid: string;
  filePath: string;
  response: MotionExpressionWorkerResponseData;
};

async function workerVrma2motion(
  filePath: string,
  uid: string,
  arrayBuffer: ArrayBuffer,
  vrm: VRM
): Promise<MotionExpression> {
  const converter = new VRMAConverter(vrm);
  const motion = await converter.vrma2motion(
    uid,
    generateProgressCallback(uid),
    arrayBuffer
  );
  return motion;
}

async function workerFbx2motion(
  filePath: string,
  uid: string,
  arrayBuffer: ArrayBuffer,
  vrm: VRM
): Promise<MotionExpression> {
  const converter = new FBXConverter(vrm);
  const motion = await converter.fbx2motion(
    uid,
    generateProgressCallback(uid),
    arrayBuffer
  );
  return motion;
}

async function workerBvh2vrmaBlob(
  filePath: string,
  uid: string,
  arrayBuffer: ArrayBuffer,
  vrm: VRM
): Promise<MotionExpression> {
  const converter = new BVHConverter(vrm);
  const motion = await converter.bvh2motion(
    uid,
    generateProgressCallback(uid),
    arrayBuffer
  );
  return motion;
}

function generateProgressCallback(uid: string) {
  return (name: string, progress: number) =>
    postMessage({
      uid: uid,
      response: {
        kind: "progress",
        data: { name, progress },
      },
    } as MotionExpressionWorkerResponse);
}

export type ConversionWorkerFunctionNames = keyof typeof functionMap;

const functionMap = {
  CWvrma2motion: workerVrma2motion,
  CWfbx2motion: workerFbx2motion,
  CWbvh2motion: workerBvh2vrmaBlob,
} as const;

export type MotionExpressionWorkerMessage = {
  func: ConversionWorkerFunctionNames;
  uid: string;
  filePath: string;
  arrayBuffer: ArrayBuffer;
  vrmArrayBuffer: ArrayBuffer;
};

// add event listener
self.addEventListener("message", async (e) => {
  const data = e.data as MotionExpressionWorkerMessage;
  // const vrmBlob = new Blob([data.vrmArrayBuffer]);
  // const vrmArrayBufferBlobUrl = URL.createObjectURL(vrmBlob);
  const vrm = await loadVrm("vrmArrayBufferBlobUrl", data.vrmArrayBuffer);
  const func = functionMap[data.func];
  if (func) {
    const result = await func(data.filePath, data.uid, data.arrayBuffer, vrm);
    postMessage({
      uid: data.uid,
      filePath: data.filePath,
      response: {
        kind: "output",
        data: { clip: AnimationClip.toJSON(result.clip) },
      },
    } as MotionExpressionWorkerResponse);
  }
});
