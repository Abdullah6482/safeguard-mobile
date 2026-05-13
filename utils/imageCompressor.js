export const ImageConfig = {
  maxDimension: 1280,
  quality: 0.7,
  thumbnailSize: 200,
};

export function estimateCompressedSize(originalSizeBytes, quality = 0.7) {
  return Math.round(originalSizeBytes * quality * 0.5);
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
