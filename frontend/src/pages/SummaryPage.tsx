import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Download,
  FileText,
  Loader2,
  Copy,
  Check,
  Globe,
  Layers,
} from 'lucide-react';
import { DocumentItem, SummaryResponse } from '../types';
import { api } from '../services/api';

interface SummaryPageProps {
  documents: DocumentItem[];
  selectedDocument?: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
  onNavigateToTranslate: (text: string) => void;
}

export const SummaryPage: React.FC<SummaryPageProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
  onNavigateToTranslate,
}) => {
  const [summaryType, setSummaryType] = useState<string>('detailed');
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const readyDocs = documents.filter((d) => d.status === 'READY');
  const currentDoc = selectedDocument || readyDocs[0];

  const handleGenerate = async () => {
    if (!currentDoc) return;
    setIsGenerating(true);
    try {
      const res = await api.generateSummary(currentDoc.id, summaryType);
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'markdown' | 'txt') => {
    if (!summary) return;
    try {
      const blob = await api.exportSummary(
        summary.content,
        summary.document_name.replace(/\.[^/.]+$/, '') + `_${summary.summary_type}`,
        format
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${summary.document_name}_${summary.summary_type}.${format === 'markdown' ? 'md' : 'txt'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const summaryTabs = [
    { id: 'one_line', label: 'One-Line Thesis' },
    { id: 'short', label: 'Executive Summary' },
    { id: 'detailed', label: 'Comprehensive Summary' },
    { id: 'chapter_wise', label: 'Section-by-Section' },
    { id: 'takeaways', label: 'Key Takeaways' },
    { id: 'definitions', label: 'Important Definitions' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100">Document Summarizer</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate structured multi-level summaries grounded in your documents.
              </p>
            </div>
          </div>

          {/* Document Picker */}
          <div className="sm:w-72">
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Select Document
            </label>
            <select
              value={currentDoc?.id || ''}
              onChange={(e) => {
                const doc = documents.find((d) => d.id === e.target.value);
                if (doc) {
                  onSelectDocument(doc);
                  setSummary(null);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {readyDocs.length === 0 ? (
                <option value="">No ready documents available</option>
              ) : (
                readyDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename} ({d.page_count}p)
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Summary Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          {summaryTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setSummaryType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                summaryType === t.id
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}

          <button
            onClick={handleGenerate}
            disabled={!currentDoc || isGenerating}
            className="ml-auto px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Content Result */}
      {summary ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
                {summary.summary_type.replace('_', ' ')}
              </span>
              <h2 className="text-base font-bold text-slate-100">{summary.document_name}</h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy markdown"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onNavigateToTranslate(summary.content)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                title="Translate summary"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleExport('markdown')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center space-x-1 transition-colors"
                title="Export as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .MD</span>
              </button>
              <button
                onClick={() => handleExport('txt')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center space-x-1 transition-colors"
                title="Export as Plain Text"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .TXT</span>
              </button>
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed pt-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary.content}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
          <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No summary generated yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Choose a document and summary style above, then click "Generate Summary" to produce an
            anti-hallucinatory overview.
          </p>
        </div>
      )}
    </div>
  );
};
