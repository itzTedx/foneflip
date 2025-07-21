export const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hasArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hasArray.map((b) => b.toString(16).padStart(2, "0")).join();
  return hashHex;
};
