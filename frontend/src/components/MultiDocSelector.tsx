import React, { useState } from 'react';
import { Layers, Check, ChevronDown, CheckSquare, Square, X } from 'lucide-react';
import { DocumentItem } from '../types';

interface MultiDocSelectorProps {
  documents: DocumentItem[];
  selectedDocIds: string[];
  onChangeSelected: (docIds: string[]) => void;
}

export const MultiDocSelector: React.FC<MultiDocSelectorProps> = ({
  documents,
  selectedDocIds,
  onChangeSelected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const readyDocs = documents.filter((d) => d.status === 'READY');

  const isAllSelected = selectedDocIds.length === 0 || selectedDocIds.length === readyDocs.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all (or select none)
      onChangeSelected([]);
    } else {
      onChangeSelected(readyDocs.map((d) => d.id));
    }
  };

  const toggleDoc = (id: string) => {
    if (selectedDocIds.includes(id)) {
      onChangeSelected(selectedDocIds.filter((item) => item !== id));
    } else {
      onChangeSelected([...selectedDocIds, id]);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 transition-colors shadow-sm"
      >
        <Layers className="w-3.5 h-3.5 text-brand-400" />
        <span>
          {selectedDocIds.length === 0
            ? `All Documents (${readyDocs.length})`
            : `${selectedDocIds.length} of ${readyDocs.length} Selected`}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="origin-top-left absolute left-0 mt-2 w-72 rounded-2xl shadow-2xl bg-slate-900 border border-slate-700/90 divide-y divide-slate-800 focus:outline-none z-50 overflow-hidden">
            <div className="p-3 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Target Documents</span>
              <button
                onClick={toggleSelectAll}
                className="text-[11px] font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                {isAllSelected ? 'Clear All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {readyDocs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No documents ready yet. Upload and process documents first.
                </div>
              ) : (
                readyDocs.map((doc) => {
                  const isChecked =
                    selectedDocIds.length === 0 || selectedDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer select-none transition-colors ${
                        isChecked
                          ? 'bg-brand-500/10 text-slate-100 font-medium'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-brand-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className="truncate">{doc.filename}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-2.5 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{readyDocs.length} total documents</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-300 hover:text-white font-medium px-2 py-0.5 rounded-lg hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
