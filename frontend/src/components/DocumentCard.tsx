import React from 'react';
import {
  FileText,
  MessageSquare,
  Sparkles,
  BookOpen,
  Globe,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentCardProps {
  doc: DocumentItem;
  onOpenDetails: (doc: DocumentItem) => void;
  onStartChat: (doc: DocumentItem) => void;
  onSummarize: (doc: DocumentItem) => void;
  onTopics: (doc: DocumentItem) => void;
  onTranslate: (doc: DocumentItem) => void;
  onDelete: (docId: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onOpenDetails,
  onStartChat,
  onSummarize,
  onTopics,
  onTranslate,
  onDelete,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusBadge = () => {
    switch (doc.status) {
      case 'READY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'UPLOADING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Uploading</span>
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'docx':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'md':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md">
      <div>
        {/* Header row with icon & status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border font-bold text-xs uppercase ${getTypeColor(doc.file_type)}`}>
              {doc.file_type}
            </div>
            <div>
              <h3
                onClick={() => onOpenDetails(doc)}
                className="text-sm font-semibold text-slate-100 hover:text-brand-400 transition-colors cursor-pointer line-clamp-1"
                title={doc.filename}
              >
                {doc.filename}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatBytes(doc.file_size)} • {new Date(doc.upload_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Scanned warning badge */}
        {doc.is_scanned && (
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Scanned PDF - OCR required</span>
          </div>
        )}

        {/* Metadata stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/40 rounded-xl px-3 py-2 border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block font-medium">Pages</span>
            <span className="text-sm font-semibold text-slate-200">{doc.page_count}</span>
          </div>
          <div className="bg-slate-950/40 rounded-xl px-3 py-2 border border-slate-800/50">
            <span className="text-[11px] text-slate-400 block font-medium">Chunks</span>
            <span className="text-sm font-semibold text-slate-200">{doc.chunk_count}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onStartChat(doc)}
            title="Chat with Document"
            className="p-2 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSummarize(doc)}
            title="Generate Summary"
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTopics(doc)}
            title="Important Topics"
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => onTranslate(doc)}
            title="Translate"
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onDelete(doc.id)}
          title="Delete Document"
          className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
