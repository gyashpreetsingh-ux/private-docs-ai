import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink, Bookmark } from 'lucide-react';
import { SourceCitationItem } from '../types';

interface SourceCitationProps {
  source: SourceCitationItem;
  onViewDoc?: (docId: string) => void;
}

export const SourceCitation: React.FC<SourceCitationProps> = ({ source, onViewDoc }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl text-xs transition-all overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-2 flex items-center justify-between cursor-pointer select-none bg-slate-900/40 hover:bg-slate-800/50"
      >
        <div className="flex items-center space-x-2 truncate pr-2">
          <FileText className="w-3.5 h-3.5 text-brand-400 shrink-0" />
          <span className="font-medium text-slate-200 truncate">{source.filename}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-brand-400 shrink-0 border border-slate-700">
            Page {source.page_number}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0 text-slate-400">
          {source.relevance_score !== undefined && (
            <span className="text-[10px] text-slate-400 font-mono">
              {Math.round(source.relevance_score * 100)}% match
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-3.5 py-2.5 bg-slate-950/60 border-t border-slate-800/80 text-slate-300 font-mono text-[11px] leading-relaxed">
          <p className="italic text-slate-400 mb-1 flex items-center space-x-1">
            <Bookmark className="w-3 h-3 text-brand-400" />
            <span>Retrieved Excerpt:</span>
          </p>
          <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 whitespace-pre-wrap">
            {source.text_snippet}
          </div>
          {onViewDoc && (
            <div className="mt-2 text-right">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDoc(source.document_id);
                }}
                className="inline-flex items-center space-x-1 text-brand-400 hover:text-brand-300 font-sans font-medium"
              >
                <span>Inspect Document</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
