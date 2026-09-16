import React, { useState } from 'react';
import { Search, RefreshCw, Layers, FileText, Filter } from 'lucide-react';
import { DocumentItem } from '../types';
import { Dropzone } from '../components/Dropzone';
import { DocumentCard } from '../components/DocumentCard';
import { CardSkeleton } from '../components/LoadingSkeleton';

interface DocumentsPageProps {
  documents: DocumentItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenDetails: (doc: DocumentItem) => void;
  onStartChat: (doc: DocumentItem) => void;
  onSummarize: (doc: DocumentItem) => void;
  onTopics: (doc: DocumentItem) => void;
  onTranslate: (doc: DocumentItem) => void;
  onDelete: (docId: string) => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  documents,
  isLoading,
  onRefresh,
  onOpenDetails,
  onStartChat,
  onSummarize,
  onTopics,
  onTranslate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDocs = documents.filter((doc) => {
    const matchesQuery = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || doc.file_type.toLowerCase() === filterType.toLowerCase();
    return matchesQuery && matchesType;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Upload Dropzone Section */}
      <section>
        <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
          <span>Upload New Documents</span>
        </h2>
        <Dropzone onUploadSuccess={onRefresh} />
      </section>

      {/* Document Library Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>Document Library</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-mono text-slate-300">
                {documents.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Processed into local semantic chunks and stored privately.
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Search filter */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Type selector */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
              <option value="md">Markdown</option>
            </select>

            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No documents found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Upload PDF, DOCX, or text files using the dropzone above to begin.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onOpenDetails={onOpenDetails}
                onStartChat={onStartChat}
                onSummarize={onSummarize}
                onTopics={onTopics}
                onTranslate={onTranslate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
