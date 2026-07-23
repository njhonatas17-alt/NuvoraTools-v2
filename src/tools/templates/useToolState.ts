import { useState, useCallback, useEffect } from 'react';
import { recordLocalToolUsage } from '../../lib/toolAnalytics';

export interface UseToolStateOptions<TInput = any, TOutput = any> {
  toolId?: string;
  initialInput?: TInput;
  initialOutput?: TOutput;
  onValidate?: (input: TInput) => string | null;
  onProcess?: (input: TInput) => Promise<TOutput> | TOutput;
}

export function useToolState<TInput = any, TOutput = any>(
  options: UseToolStateOptions<TInput, TOutput> = {}
) {
  const { toolId, initialInput, initialOutput, onValidate, onProcess } = options;

  const [input, setInput] = useState<TInput>(initialInput as TInput);
  const [output, setOutput] = useState<TOutput | null>(initialOutput ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMsg(null);
  }, []);

  // Copy to clipboard with 2s timeout feedback
  const copyToClipboard = useCallback(
    async (textToCopy?: string): Promise<boolean> => {
      const targetText =
        textToCopy !== undefined
          ? textToCopy
          : typeof output === 'string'
          ? output
          : JSON.stringify(output, null, 2);

      if (!targetText) return false;

      try {
        await navigator.clipboard.writeText(targetText);
        setCopied(true);
        setSuccessMsg('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
        setTimeout(() => setSuccessMsg(null), 3000);
        return true;
      } catch (err) {
        console.error('Copy failed', err);
        setError('Failed to copy to clipboard.');
        return false;
      }
    },
    [output]
  );

  // Download output as a file
  const downloadOutput = useCallback(
    (filename = 'output.txt', mimeType = 'text/plain') => {
      if (!output) return;
      const content = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg(`File downloaded as ${filename}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    [output]
  );

  // Execute processing action
  const executeAction = useCallback(
    async (customInput?: TInput) => {
      const activeInput = customInput !== undefined ? customInput : input;
      clearMessages();

      // Validation
      if (onValidate) {
        const validationError = onValidate(activeInput);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      if (!onProcess) return;

      setLoading(true);
      try {
        const result = await onProcess(activeInput);
        setOutput(result);
        if (toolId) {
          recordLocalToolUsage(toolId);
        }
      } catch (err: any) {
        console.error('Tool processing error', err);
        setError(err?.message || 'An unexpected error occurred during processing.');
      } finally {
        setLoading(false);
      }
    },
    [input, onValidate, onProcess, toolId, clearMessages]
  );

  // Reset tool state
  const reset = useCallback(() => {
    setInput(initialInput as TInput);
    setOutput(initialOutput ?? null);
    setLoading(false);
    setError(null);
    setSuccessMsg(null);
    setCopied(false);
  }, [initialInput, initialOutput]);

  // Keyboard shortcut listener (Cmd/Ctrl + Enter to execute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!loading && onProcess) {
          e.preventDefault();
          executeAction();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onProcess, executeAction]);

  return {
    input,
    setInput,
    output,
    setOutput,
    loading,
    setLoading,
    error,
    setError,
    successMsg,
    setSuccessMsg,
    copied,
    copyToClipboard,
    downloadOutput,
    executeAction,
    reset,
    clearMessages,
  };
}
