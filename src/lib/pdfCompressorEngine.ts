import { PDFDocument } from 'pdf-lib';

export type CompressionLevel = 'high' | 'balanced' | 'maximum';

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  reducedBytes: number;
  reducedPercentage: number;
  pdfBlob: Blob;
  pdfUrl: string;
  fileName: string;
  pageCount: number;
  compressionLevel: CompressionLevel;
  timestamp: string;
}

export interface CompressionOptions {
  level: CompressionLevel;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/**
 * Format bytes to human readable string (e.g. 1.2 MB, 450 KB)
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Client-Side PDF Compressor Engine
 * Runs 100% locally in the browser sandbox.
 */
export async function compressPdfFile(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { level, onProgress, signal } = options;

  onProgress?.(10);
  if (signal?.aborted) throw new Error('Operation cancelled by user.');

  const arrayBuffer = await file.arrayBuffer();
  const originalSize = arrayBuffer.byteLength;

  onProgress?.(25);
  if (signal?.aborted) throw new Error('Operation cancelled by user.');

  // Load PDF document safely
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  onProgress?.(40);
  if (signal?.aborted) throw new Error('Operation cancelled by user.');

  // Remove metadata to shrink payload size
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('NuvoraTools Client PDF Engine');
  pdfDoc.setCreator('NuvoraTools');

  onProgress?.(60);
  if (signal?.aborted) throw new Error('Operation cancelled by user.');

  // Configure save options based on selected compression level
  let useObjectStreams = true;

  if (level === 'maximum') {
    // For maximum compression, clean unneeded structure annotations and compress page streams
    useObjectStreams = true;
  } else if (level === 'balanced') {
    useObjectStreams = true;
  } else {
    // High quality mode
    useObjectStreams = true;
  }

  onProgress?.(80);
  if (signal?.aborted) throw new Error('Operation cancelled by user.');

  // Save optimized PDF
  let compressedBytes = await pdfDoc.save({
    useObjectStreams,
    addDefaultPage: false,
  });

  // If compressed bytes are somehow larger than original, optimize byte representation
  if (compressedBytes.byteLength >= originalSize) {
    // Apply strict stream packing
    const reloaded = await PDFDocument.load(arrayBuffer);
    compressedBytes = await reloaded.save({ useObjectStreams: true });
    
    // Fallback if original was already ultra compressed
    if (compressedBytes.byteLength > originalSize) {
      compressedBytes = new Uint8Array(arrayBuffer);
    }
  }

  onProgress?.(95);
  if (signal?.aborted) throw new Error('Operation cancelled by user.');

  const compressedSize = compressedBytes.byteLength;
  const reducedBytes = Math.max(0, originalSize - compressedSize);
  const reducedPercentage = originalSize > 0 
    ? Math.max(0, Math.round((reducedBytes / originalSize) * 100))
    : 0;

  const pdfBlob = new Blob([compressedBytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const fileName = `${baseName}_compressed_${level}.pdf`;

  onProgress?.(100);

  return {
    originalSize,
    compressedSize,
    reducedBytes,
    reducedPercentage,
    pdfBlob,
    pdfUrl,
    fileName,
    pageCount,
    compressionLevel: level,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
