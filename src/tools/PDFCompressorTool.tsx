import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  ShieldCheck,
  History,
  FileCheck,
  Percent,
} from 'lucide-react';
import {
  compressPdfFile,
  CompressionLevel,
  CompressionResult,
  formatBytes,
} from '../lib/pdfCompressorEngine';
import { useTranslation } from '../i18n/i18nContext';

export default function PDFCompressorTool() {
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('balanced');
  const [isDragging, setIsDragging] = useState(false);

  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const [currentResult, setCurrentResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [sessionHistory, setSessionHistory] = useState<CompressionResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File handle & validation
  const handleFileSelect = useCallback((file: File | null) => {
    setError(null);
    setSuccessMsg(null);
    setCurrentResult(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError(t('pdf.selectPdfError', 'Por favor, selecione um arquivo PDF válido.'));
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
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
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  // Compression Action
  const handleCompress = useCallback(async () => {
    if (!selectedFile) {
      setError(t('pdf.selectPdfError', 'Selecione um arquivo PDF para comprimir.'));
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsProcessing(true);
    setProgress(5);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const result = await compressPdfFile(selectedFile, {
        level,
        onProgress: (p) => setProgress(p),
        signal: controller.signal,
      });

      setCurrentResult(result);
      setSessionHistory((prev) => [result, ...prev]);
      setSuccessMsg(t('pdf.successMsg', 'PDF comprimido com sucesso!'));
    } catch (err: any) {
      if (err?.message?.includes('cancelled')) {
        setError(t('pdf.cancelledMsg', 'Operação de compressão cancelada.'));
      } else {
        console.error('PDF compression error', err);
        setError(err?.message || 'Erro ao comprimir arquivo PDF.');
      }
    } finally {
      setIsProcessing(false);
      setAbortController(null);
    }
  }, [selectedFile, level, t]);

  // Cancel Action
  const handleCancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setIsProcessing(false);
      setAbortController(null);
    }
  }, [abortController]);

  // Clear Action
  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setCurrentResult(null);
    setError(null);
    setSuccessMsg(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Clear History
  const handleClearHistory = useCallback(() => {
    setSessionHistory([]);
  }, []);

  // Compression Level Profiles Metadata
  const levelProfiles = useMemo(
    () => [
      {
        id: 'high' as CompressionLevel,
        title: t('pdf.level.high', 'Alta Qualidade'),
        badge: 'Otimização Leve',
        desc: t('pdf.level.highDesc', 'Compressão mínima, preserva máxima qualidade de vetores e impressão.'),
        color: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      },
      {
        id: 'balanced' as CompressionLevel,
        title: t('pdf.level.balanced', 'Equilibrado'),
        badge: 'Recomendado',
        desc: t('pdf.level.balancedDesc', 'Recomendado para a maioria dos documentos. Ótima redução e texto nítido.'),
        color: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      },
      {
        id: 'maximum' as CompressionLevel,
        title: t('pdf.level.max', 'Máxima Compressão'),
        badge: 'Tamanho Mínimo',
        desc: t('pdf.level.maxDesc', 'Redução agressiva para limites rigorosos de e-mail e portais.'),
        color: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      },
    ],
    [t]
  );

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
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 sm:p-12 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/60 scale-[0.99]'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-950/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('pdf.uploadTitle', 'Arraste seu arquivo PDF aqui ou clique para selecionar')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('pdf.supportedFormat', 'Suporta arquivos PDF de qualquer tamanho • Processamento 100% no seu navegador')}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantia de Privacidade Total</span>
            </div>
          </div>
        ) : (
          /* File Preview Card */
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span>Documento PDF</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClear}
              disabled={isProcessing}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('pdf.clear', 'Limpar Arquivo')}</span>
            </button>
          </div>
        )}

        {/* Compression Level Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Nível de Compressão
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {levelProfiles.map((prof) => {
              const isActive = level === prof.id;
              return (
                <button
                  key={prof.id}
                  onClick={() => setLevel(prof.id)}
                  disabled={isProcessing}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/80 ring-2 ring-indigo-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {prof.title}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${prof.color}`}>
                        {prof.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed pt-1">
                      {prof.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Progress Bar */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {isProcessing ? (
            <div className="space-y-3 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>{t('pdf.compressing', 'Comprimindo PDF no seu navegador...')}</span>
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

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('pdf.cancel', 'Cancelar Operação')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={handleCompress}
                disabled={!selectedFile}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('pdf.compressBtn', 'Comprimir PDF Agora')}</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Execução Local Instantânea</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Comparison Card */}
      {currentResult && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Resultado da Compressão
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
              {currentResult.reducedPercentage}% menor
            </span>
          </div>

          {/* Comparison Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400">Tamanho Original</span>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200">
                {formatBytes(currentResult.originalSize)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 space-y-1">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Tamanho Comprimido
              </span>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                {formatBytes(currentResult.compressedSize)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 space-y-1">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Espaço Economizado
              </span>
              <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                {formatBytes(currentResult.reducedBytes)}
              </p>
            </div>
          </div>

          {/* Download Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">
              <span>Arquivo pronto: </span>
              <strong className="text-slate-900 dark:text-white font-mono">{currentResult.fileName}</strong>
            </div>

            <a
              href={currentResult.pdfUrl}
              download={currentResult.fileName}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF Comprimido</span>
            </a>
          </div>
        </div>
      )}

      {/* Session Compression History */}
      {sessionHistory.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t('pdf.historyTitle', 'Histórico de Compressão da Sessão')}
              </h3>
            </div>
            <button
              onClick={handleClearHistory}
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
                    {formatBytes(item.originalSize)} ➔{' '}
                    <span className="text-emerald-600 font-bold">{formatBytes(item.compressedSize)}</span> ({item.reducedPercentage}% menor)
                  </p>
                </div>

                <a
                  href={item.pdfUrl}
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
