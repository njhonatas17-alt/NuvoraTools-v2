import { PDFDocument } from 'pdf-lib';
import { formatBytes } from './pdfCompressorEngine';

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  status: 'pending' | 'loading' | 'ready' | 'error';
  errorMsg?: string;
}

export interface MergeResult {
  mergedBlob: Blob;
  mergedUrl: string;
  totalPages: number;
  totalSize: number;
  fileName: string;
  fileCount: number;
  timestamp: string;
}

/**
 * Load page count metadata for a single PDF file
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (err) {
    console.error('Failed to read PDF page count', err);
    return 0;
  }
}

/**
 * Client-Side PDF Merger Engine
 * Merges multiple PDF files in browser memory using pdf-lib.
 */
export async function mergePdfFiles(
  items: PDFFileItem[],
  onProgress?: (progress: number) => void,
  outputFileName = 'documento_combinado.pdf'
): Promise<MergeResult> {
  if (items.length === 0) {
    throw new Error('Sem arquivos PDF para combinar.');
  }

  onProgress?.(10);

  const mergedPdf = await PDFDocument.create();
  let totalPages = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const arrayBuffer = await item.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageIndices = pdfDoc.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
      
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      totalPages += pageIndices.length;
    } catch (err: any) {
      throw new Error(`Falha ao ler o arquivo ${item.name}: ${err?.message || 'Arquivo corrompido'}`);
    }

    const currentProgress = Math.round(10 + ((i + 1) / items.length) * 75);
    onProgress?.(currentProgress);
  }

  onProgress?.(90);

  // Set standard PDF document metadata
  mergedPdf.setProducer('NuvoraTools Client PDF Engine');
  mergedPdf.setCreator('NuvoraTools');

  const mergedPdfBytes = await mergedPdf.save({ useObjectStreams: true });
  const mergedBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const mergedUrl = URL.createObjectURL(mergedBlob);

  onProgress?.(100);

  return {
    mergedBlob,
    mergedUrl,
    totalPages,
    totalSize: mergedPdfBytes.byteLength,
    fileName: outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`,
    fileCount: items.length,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
