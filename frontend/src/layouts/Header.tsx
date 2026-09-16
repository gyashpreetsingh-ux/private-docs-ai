import React from 'react';
import { Shield, Sparkles, Activity, Search } from 'lucide-react';
import { MultiDocSelector } from '../components/MultiDocSelector';
import { DocumentItem } from '../types';

interface HeaderProps {
  currentTab: string;
  documents: DocumentItem[];
  selectedDocIds: string[];
  onChangeSelectedDocs: (ids: string[]) => void;
  onOpenSearch?: () => void;
  providerName?: string;
  isBackendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  documents,
  selectedDocIds,
  onChangeSelectedDocs,
  onOpenSearch,
  providerName = 'Local Fallback',
  isBackendOnline,
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'documents':
        return 'Document Management';
      case 'chat':
        return 'Private Document Chat';
      case 'summaries':
        return 'Document Summarizer';
      case 'topics':
        return 'Important Topics Extraction';
      case 'questions':
        return 'Study Questions & Flashcards';
      case 'translate':
        return 'Multi-Language Translation';
      case 'search':
        return 'Corpus & Semantic Search';
      case 'settings':
        return 'Configuration & Security';
      default:
        return 'Private Docs AI';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-10">
      <div className="flex items-center space-x-4">
        <h2 className="text-sm font-semibold text-slate-100">{getTabTitle()}</h2>
        {currentTab === 'chat' && (
          <MultiDocSelector
            documents={documents}
            selectedDocIds={selectedDocIds}
            onChangeSelected={onChangeSelectedDocs}
          />
        )}
      </div>

      <div className="flex items-center space-x-3">
        {onOpenSearch && currentTab !== 'search' && (
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search docs...</span>
          </button>
        )}

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="text-slate-300 font-medium capitalize">
            {providerName}
          </span>
        </div>
      </div>
    </header>
  );
};
