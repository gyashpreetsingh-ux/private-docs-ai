import React from 'react';
import {
  ShieldCheck,
  PlusCircle,
  MessageSquare,
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  Globe,
  Settings,
  Trash2,
  Lock,
  LayoutDashboard,
  Search,
} from 'lucide-react';
import { ConversationItem } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  conversations: ConversationItem[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  totalDocsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  totalDocsCount,
}) => {
  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight flex items-center space-x-1.5">
              <span>PRIVATE DOCS AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate">Chat with private docs</p>
          </div>
        </div>

        {/* New Chat Primary Button */}
        <button
          onClick={onNewChat}
          className="mt-4 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-slate-950 font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all duration-200 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation and Content Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Navigation Core */}
        <div className="space-y-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'dashboard'
                ? 'bg-slate-800 text-brand-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('documents')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'documents'
                ? 'bg-slate-800 text-brand-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 shrink-0" />
              <span>All Documents</span>
            </div>
            {totalDocsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-mono">
                {totalDocsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('search')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              currentTab === 'search'
                ? 'bg-slate-800 text-brand-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Search Corpus</span>
          </button>
        </div>

        {/* Chats History */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Recent Chats
          </div>
          <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1">
            {conversations.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400 italic">No past conversations</p>
            ) : (
              conversations.map((c) => {
                const isActive = currentTab === 'chat' && activeConversationId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-brand-500/10 text-brand-300 font-medium'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{c.title || 'Untitled Chat'}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Document Tools */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Document Tools
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('summaries')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'summaries'
                  ? 'bg-slate-800 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>Summarize</span>
            </button>

            <button
              onClick={() => onSelectTab('topics')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'topics'
                  ? 'bg-slate-800 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Important Topics</span>
            </button>

            <button
              onClick={() => onSelectTab('questions')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'questions'
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Generate Questions</span>
            </button>

            <button
              onClick={() => onSelectTab('translate')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                currentTab === 'translate'
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>Translate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Privacy & Settings */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/50 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span className="truncate">Local Storage & Privacy Safe</span>
        </div>

        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentTab === 'settings'
              ? 'bg-slate-800 text-slate-100 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
