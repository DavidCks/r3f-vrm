export function arrayBufferToString(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const string = String.fromCharCode(...uint8Array);
  return string;
}
