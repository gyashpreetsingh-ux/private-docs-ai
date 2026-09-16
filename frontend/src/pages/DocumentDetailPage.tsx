import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Layers,
  MessageSquare,
  Sparkles,
  BookOpen,
  Globe,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DocumentItem, DocumentChunkItem } from '../types';
import { api } from '../services/api';

interface DocumentDetailPageProps {
  document: DocumentItem;
  onBack: () => void;
  onStartChat: (doc: DocumentItem) => void;
  onSummarize: (doc: DocumentItem) => void;
  onTopics: (doc: DocumentItem) => void;
  onTranslate: (doc: DocumentItem) => void;
  onDelete: (docId: string) => void;
}

export const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({
  document: initialDoc,
  onBack,
  onStartChat,
  onSummarize,
  onTopics,
  onTranslate,
  onDelete,
}) => {
  const [doc, setDoc] = useState<DocumentItem>(initialDoc);
  const [chunks, setChunks] = useState<DocumentChunkItem[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = useState(true);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunkItem | null>(null);

  useEffect(() => {
    loadChunks();
  }, [doc.id]);

  const loadChunks = async () => {
    setIsLoadingChunks(true);
    try {
      const data = await api.getDocumentChunks(doc.id);
      setChunks(data);
      if (data.length > 0) setSelectedChunk(data[0]);
    } catch (err) {
      console.error('Failed to load chunks:', err);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const handleReprocess = async () => {
    try {
      await api.reprocessDocument(doc.id);
      const updated = await api.getDocument(doc.id);
      setDoc(updated);
      loadChunks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReprocess}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reprocess</span>
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-medium text-rose-300 flex items-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0 font-bold text-sm uppercase">
              {doc.file_type}
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-100">{doc.filename}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Uploaded {new Date(doc.upload_date).toLocaleString()} • Original:{' '}
                {doc.original_filename}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Status: {doc.status}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {doc.page_count} Pages
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  {doc.chunk_count} Vector Chunks
                </span>
                {doc.is_scanned && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>OCR Flagged</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick tool launch buttons */}
          <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
            <button
              onClick={() => onStartChat(doc)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-xs flex items-center space-x-2 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => onSummarize(doc)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Summary</span>
            </button>
            <button
              onClick={() => onTopics(doc)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Topics</span>
            </button>
            <button
              onClick={() => onTranslate(doc)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Translate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chunk Browser & Viewer */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span>Extracted Semantic Chunks & Page Mapping</span>
        </h2>

        {isLoadingChunks ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading vector chunks...</div>
        ) : chunks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            No chunks extracted yet. Trigger reprocessing if the document was uploaded recently.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chunks List */}
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {chunks.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedChunk(c)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedChunk?.id === c.id
                      ? 'bg-brand-500/10 border-brand-500/40 text-slate-100 font-medium'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">
                      Chunk #{c.chunk_index + 1}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-brand-400 border border-slate-700">
                      Page {c.page_number}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-400">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Chunk Detail Preview */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              {selectedChunk ? (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">
                        Chunk #{selectedChunk.chunk_index + 1} Inspector
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        Grounded to Page {selectedChunk.page_number}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {selectedChunk.text.length} characters
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed max-h-[380px] overflow-y-auto whitespace-pre-wrap">
                    {selectedChunk.text}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-400">
                  Select a chunk on the left to inspect its raw text.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
