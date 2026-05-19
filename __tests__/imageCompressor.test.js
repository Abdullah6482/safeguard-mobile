import { formatFileSize, estimateCompressedSize } from '../utils/imageCompressor';

describe('Image Compressor Utility', () => {
  test('formats bytes to readable strings', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(5242880)).toBe('5.0 MB');
  });

  test('calculates expected compression reductions', () => {
    const estimate = estimateCompressedSize(1000000, 0.7);
    expect(estimate).toBe(350000);
  });
});
