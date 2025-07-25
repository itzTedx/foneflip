export async function getImageMetadata(file: File | Blob): Promise<{
  width: number;
  height: number;
  blurData: string;
}> {
  // Read file as data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Create an image to get dimensions
  const img = document.createElement("img");
  img.src = dataUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // Create a tiny blurred version (e.g., 8x8 px)
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const size = 8;
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);
  const blurData = canvas.toDataURL("image/webp");

  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    blurData,
  };
}
