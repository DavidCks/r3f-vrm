export async function abFetch(
  filePath: string,
  onProgress: (name: string, progress: number) => void = (_1, _2) => {}
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, true);
    xhr.responseType = "arraybuffer";
    xhr.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(`File Donwloader - ${filePath}`, e.loaded / e.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Failed to fetch ${filePath}`));
      }
    };
    xhr.onerror = () => {
      reject(new Error(`Failed to fetch ${filePath}`));
    };
    xhr.send();
  });
}
