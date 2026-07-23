import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  ShieldCheck,
  History,
  FileCheck,
  Share2,
  Layers,
  Plus,
} from 'lucide-react';
import {
  mergePdfFiles,
  getPdfPageCount,
  PDFFileItem,
  MergeResult,
} from '../lib/pdfMergerEngine';
import { formatBytes } from '../lib/pdfCompressorEngine';
import { useTranslation } from '../i18n/i18nContext';

export default function PDFMergerTool() {
  const { t } = useTranslation();

  const [filesList, setFilesList] = useState<PDFFileItem[]>([]);
  const [outputName, setOutputName] = useState<string>('documento_combinado');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [currentResult, setCurrentResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [sessionHistory, setSessionHistory] = useState<MergeResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Files
  const handleAddFiles = useCallback(async (newFiles: FileList | File[]) => {
    setError(null);
    setSuccessMsg(null);

    const validPdfs: File[] = [];
    let invalidCount = 0;

    Array.from(newFiles).forEach((f) => {
      if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        validPdfs.push(f);
      } else {
        invalidCount++;
      }
    });

    if (invalidCount > 0) {
      setError(t('pdf.merge.invalidPdfs', `${invalidCount} arquivo(s) ignorado(s) pois não são PDFs válidos.`));
    }

    if (validPdfs.length === 0) return;

    // Create item placeholders
    const newItems: PDFFileItem[] = validPdfs.map((f, idx) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${idx}`,
      file: f,
      name: f.name,
      size: f.size,
      status: 'pending',
    }));

    setFilesList((prev) => [...prev, ...newItems]);

    // Load page counts asynchronously
    for (const item of newItems) {
      const pageCount = await getPdfPageCount(item.file);
      setFilesList((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, pageCount, status: 'ready' } : p))
      );
    }
  }, [t]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleAddFiles(e.dataTransfer.files);
      }
    },
    [handleAddFiles]
  );

  // Item List Reordering
  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setFilesList((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setFilesList((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setFilesList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setFilesList([]);
    setCurrentResult(null);
    setError(null);
    setSuccessMsg(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Merge Action
  const handleMerge = useCallback(async () => {
    if (filesList.length < 2) {
      setError(t('pdf.merge.minFilesError', 'Adicione pelo menos 2 arquivos PDF para combinar.'));
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsProcessing(true);
    setProgress(5);

    try {
      const result = await mergePdfFiles(
        filesList,
        (p) => setProgress(p),
        outputName.trim() || 'documento_combinado'
      );

      setCurrentResult(result);
      setSessionHistory((prev) => [result, ...prev]);
      setSuccessMsg(t('pdf.merge.successMsg', 'PDFs combinados com sucesso!'));
    } catch (err: any) {
      console.error('PDF merger error', err);
      setError(err?.message || 'Erro ao combinar arquivos PDF.');
    } finally {
      setIsProcessing(false);
    }
  }, [filesList, outputName, t]);

  // Share action if supported
  const handleShare = useCallback(async () => {
    if (!currentResult || !navigator.share) return;
    try {
      const file = new File([currentResult.mergedBlob], currentResult.fileName, {
        type: 'application/pdf',
      });
      await navigator.share({
        title: currentResult.fileName,
        text: 'PDF combinado com NuvoraTools',
        files: [file],
      });
    } catch (err) {
      // Ignore abort errors
    }
  }, [currentResult]);

  // Total calculated statistics for current selection
  const totalSelectedStats = useMemo(() => {
    const totalBytes = filesList.reduce((acc, curr) => acc + curr.size, 0);
    const totalPages = filesList.reduce((acc, curr) => acc + (curr.pageCount || 0), 0);
    return {
      totalBytes,
      totalPages,
    };
  }, [filesList]);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Alert Messages */}
      <div aria-live="polite" className="space-y-2">
        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Main Workspace Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        
        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/60 scale-[0.99]'
              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-950/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleAddFiles(e.target.files);
              }
            }}
          />

          <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs">
            <Layers className="w-7 h-7" />
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('pdf.merge.uploadTitle', 'Arraste múltiplos arquivos PDF aqui ou clique para selecionar')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('pdf.merge.supportedFormat', 'Selecione múltiplos PDFs • Processamento 100% no seu navegador')}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Processamento Local e Privado</span>
          </div>
        </div>

        {/* Selected PDF List Controls */}
        {filesList.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Arquivos Selecionados ({filesList.length})
                </span>
                <span className="text-xs text-slate-400">
                  • {formatBytes(totalSelectedStats.totalBytes)}
                  {totalSelectedStats.totalPages > 0 && ` (${totalSelectedStats.totalPages} pág)`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('pdf.merge.addMore', 'Adicionar Mais')}</span>
                </button>

                <button
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('pdf.merge.clearAll', 'Limpar Lista')}</span>
                </button>
              </div>
            </div>

            {/* Reorderable File Rows */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filesList.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                        {item.name}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {formatBytes(item.size)}
                        {item.pageCount !== undefined && ` • ${item.pageCount} págs`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0 || isProcessing}
                      title="Mover para cima"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === filesList.length - 1 || isProcessing}
                      title="Mover para baixo"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isProcessing}
                      title="Remover arquivo"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 disabled:opacity-30 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Output Name */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('pdf.merge.outputNameLabel', 'Nome do Arquivo Combinado')}
              </label>
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  placeholder="documento_combinado"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs font-mono text-slate-400 shrink-0">.pdf</span>
              </div>
            </div>
          </div>
        )}

        {/* Merge Button & Progress */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {isProcessing ? (
            <div className="space-y-3 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>{t('pdf.merge.merging', 'Combinando PDFs no seu navegador...')}</span>
                </span>
                <span>{progress}%</span>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-indigo-200/60 dark:bg-indigo-900/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handleMerge}
                disabled={filesList.length < 2}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Layers className="w-4 h-4" />
                <span>{t('pdf.merge.mergeBtn', 'Juntar e Combinar PDFs')}</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Execução 100% no Navegador</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Merged Result Card */}
      {currentResult && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                PDF Combinado com Sucesso
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
              {currentResult.fileCount} arquivos unificados
            </span>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400">Tamanho Total Final</span>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200">
                {formatBytes(currentResult.totalSize)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 space-y-1">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Total de Páginas
              </span>
              <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                {currentResult.totalPages} páginas
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 space-y-1">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Arquivos Combinados
              </span>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                {currentResult.fileCount} documentos
              </p>
            </div>
          </div>

          {/* Download & Share Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">
              <span>Arquivo final: </span>
              <strong className="text-slate-900 dark:text-white font-mono">{currentResult.fileName}</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleShare}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>
              )}

              <a
                href={currentResult.mergedUrl}
                download={currentResult.fileName}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PDF Combinado</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Session Merged History */}
      {sessionHistory.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('pdf.merge.historyTitle', 'Histórico de PDFs Combinados na Sessão')}
              </h3>
            </div>
            <button
              onClick={() => setSessionHistory([])}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {t('pdf.clearHistory', 'Limpar Histórico')}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sessionHistory.map((item, idx) => (
              <div
                key={idx}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm">
                    {item.fileName}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {item.fileCount} arquivos • {item.totalPages} páginas •{' '}
                    <span className="text-emerald-600 font-bold">{formatBytes(item.totalSize)}</span>
                  </p>
                </div>

                <a
                  href={item.mergedUrl}
                  download={item.fileName}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
