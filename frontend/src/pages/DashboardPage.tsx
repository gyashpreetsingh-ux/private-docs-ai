import React from 'react';
import {
  FileText,
  MessageSquare,
  Sparkles,
  BookOpen,
  Globe,
  Upload,
  ArrowRight,
  ShieldAlert,
  HardDrive,
  Cpu,
  Clock,
} from 'lucide-react';
import { DashboardStats, DocumentItem, ConversationItem } from '../types';

interface DashboardPageProps {
  stats: DashboardStats | null;
  documents: DocumentItem[];
  conversations: ConversationItem[];
  onNavigate: (tab: string) => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onSelectConversation: (id: string) => void;
  onOpenUpload: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  documents,
  conversations,
  onNavigate,
  onSelectDocument,
  onSelectConversation,
  onOpenUpload,
}) => {
  const recentDocs = documents.slice(0, 4);
  const recentChats = conversations.slice(0, 4);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 border border-slate-800 p-8">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <span>Production-Style Privacy-First Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
            Chat with your private documents.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Upload PDFs, DOCX, and text notes. Everything is chunked, indexed locally into
            ChromaDB, and synthesized with verifiable page citations.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Documents</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{stats?.total_documents ?? 0}</p>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {stats?.ready_documents ?? 0} ready for chat
          </span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Conversations</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{stats?.total_conversations ?? 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Multi-turn sessions</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Vector Chunks</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{stats?.total_chunks ?? 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">In local ChromaDB</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Provider</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-100 mt-2 uppercase truncate">
            {stats?.ai_provider ?? 'local'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {stats?.embedding_provider ?? 'local'} embeddings
          </span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            onClick={onOpenUpload}
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-brand-500/40 hover:bg-slate-900 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Upload Document</span>
            <span className="text-xs text-slate-400 mt-0.5">Add PDF, DOCX, or TXT</span>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Start Chat</span>
            <span className="text-xs text-slate-400 mt-0.5">Ask questions with citations</span>
          </button>

          <button
            onClick={() => onNavigate('summaries')}
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Summarize Document</span>
            <span className="text-xs text-slate-400 mt-0.5">Key points & definitions</span>
          </button>

          <button
            onClick={() => onNavigate('topics')}
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Find Important Topics</span>
            <span className="text-xs text-slate-400 mt-0.5">Concept breakdown by page</span>
          </button>

          <button
            onClick={() => onNavigate('translate')}
            className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Translate Document</span>
            <span className="text-xs text-slate-400 mt-0.5">Hindi, Punjabi, English</span>
          </button>
        </div>
      </div>

      {/* Split Recent Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Recent Documents</h3>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No documents uploaded yet.</p>
              <button
                onClick={onOpenUpload}
                className="mt-3 text-xs text-brand-400 hover:text-brand-300 font-semibold"
              >
                Upload your first document
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3 truncate pr-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold uppercase text-slate-300">
                      {doc.file_type}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium text-slate-200 truncate">{doc.filename}</p>
                      <p className="text-[11px] text-slate-400">
                        {doc.page_count} pages • {doc.chunk_count} chunks
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      doc.status === 'READY'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Chats */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Recent Chats</h3>
            <button
              onClick={() => onNavigate('chat')}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>Open Chat</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentChats.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No active conversations yet.</p>
              <button
                onClick={() => onNavigate('chat')}
                className="mt-3 text-xs text-brand-400 hover:text-brand-300 font-semibold"
              >
                Start a new conversation
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectConversation(c.id)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3 truncate pr-2">
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-slate-200 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(c.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {c.message_count || 0} messages
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
