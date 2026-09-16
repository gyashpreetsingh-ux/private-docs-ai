import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  HelpCircle,
  Globe,
  Search,
  Loader2,
  CheckCircle2,
  Bookmark,
  FileText,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  DocumentItem,
  ImportantTopicItem,
  GeneratedQuestionItem,
  SearchResultItem,
} from '../types';
import { api } from '../services/api';

interface ToolsPageProps {
  toolTab: 'topics' | 'questions' | 'translate' | 'search';
  documents: DocumentItem[];
  selectedDocument?: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
  initialTranslateText?: string;
  onViewDoc?: (docId: string) => void;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({
  toolTab: activeTool,
  documents,
  selectedDocument,
  onSelectDocument,
  initialTranslateText = '',
  onViewDoc,
}) => {
  const readyDocs = documents.filter((d) => d.status === 'READY');
  const currentDoc = selectedDocument || readyDocs[0];

  // Topics state
  const [topics, setTopics] = useState<ImportantTopicItem[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<GeneratedQuestionItem[]>([]);
  const [questionType, setQuestionType] = useState<string>('mcq');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  // Translation state
  const [translateInput, setTranslateInput] = useState(initialTranslateText);
  const [translatedOutput, setTranslatedOutput] = useState('');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [isTranslating, setIsTranslating] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialTranslateText) {
      setTranslateInput(initialTranslateText);
    }
  }, [initialTranslateText]);

  // Load topics
  const handleExtractTopics = async () => {
    if (!currentDoc) return;
    setIsLoadingTopics(true);
    try {
      const res = await api.extractTopics(currentDoc.id);
      setTopics(res.topics);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  // Generate Questions
  const handleGenerateQuestions = async () => {
    if (!currentDoc) return;
    setIsLoadingQuestions(true);
    setRevealedAnswers({});
    try {
      const res = await api.generateQuestions(
        currentDoc.id,
        questionType,
        difficulty,
        questionCount
      );
      setQuestions(res.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Translate
  const handleTranslate = async () => {
    if (!translateInput.trim()) return;
    setIsTranslating(true);
    try {
      const res = await api.translateText(translateInput, targetLang);
      setTranslatedOutput(res.translated_text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await api.search(searchQuery);
      setSearchResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* ================= IMPORTANT TOPICS ================= */}
      {activeTool === 'topics' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100">Important Topics</h1>
                <p className="text-xs text-slate-400">
                  Concept breakdown, importance ratings, and real source pages.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={currentDoc?.id || ''}
                onChange={(e) => {
                  const d = documents.find((doc) => doc.id === e.target.value);
                  if (d) {
                    onSelectDocument(d);
                    setTopics([]);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {readyDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExtractTopics}
                disabled={!currentDoc || isLoadingTopics}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                {isLoadingTopics ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
                <span>Analyze Topics</span>
              </button>
            </div>
          </div>

          {topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold text-slate-100">{t.topic}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getImportanceBadge(
                        t.importance
                      )}`}
                    >
                      {t.importance} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.why_it_matters}</p>
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-brand-400 font-medium">
                      {t.relevant_pages || 'Page 1'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
              <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No topics extracted yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select a document and click "Analyze Topics" to discover core ideas and their pages.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= QUESTION GENERATOR ================= */}
      {activeTool === 'questions' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-100">Study Question Generator</h1>
                  <p className="text-xs text-slate-400">
                    Generate MCQs, viva queries, and flashcards verified against document text.
                  </p>
                </div>
              </div>

              <select
                value={currentDoc?.id || ''}
                onChange={(e) => {
                  const d = documents.find((doc) => doc.id === e.target.value);
                  if (d) {
                    onSelectDocument(d);
                    setQuestions([]);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {readyDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename}
                  </option>
                ))}
              </select>
            </div>

            {/* Config row */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="short_answer">Short Answer</option>
                <option value="long_answer">In-depth Essay</option>
                <option value="interview">Interview Questions</option>
                <option value="viva">Viva Voce</option>
                <option value="flashcard">Flashcards</option>
              </select>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>

              <button
                onClick={handleGenerateQuestions}
                disabled={!currentDoc || isLoadingQuestions}
                className="ml-auto px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                {isLoadingQuestions ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5" />
                )}
                <span>Generate Questions</span>
              </button>
            </div>
          </div>

          {/* Render Questions List */}
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      Q{idx + 1}. [{q.question_type.toUpperCase()}]
                    </span>
                    {q.source_page && (
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        {q.source_page}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-100">{q.question}</p>

                  {/* MCQ Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Answer reveal toggle */}
                  <div className="pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() =>
                        setRevealedAnswers((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                      className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      <span>{revealedAnswers[idx] ? 'Hide Answer' : 'Reveal Answer'}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          revealedAnswers[idx] ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {revealedAnswers[idx] && (
                      <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-mono">
                        {q.answer}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
              <HelpCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No questions generated yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Configure your preferred study format above and generate instant test questions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= TRANSLATION ================= */}
      {activeTool === 'translate' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100">Multi-Language Translation</h1>
                <p className="text-xs text-slate-400">
                  Accurate document translation into Hindi, Punjabi, English, and more.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Source Content</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {translateInput.length} chars
                  </span>
                </div>
                <textarea
                  value={translateInput}
                  onChange={(e) => setTranslateInput(e.target.value)}
                  placeholder="Paste document excerpts, summaries, or questions here..."
                  rows={8}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
                />
              </div>

              {/* Output Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-semibold text-slate-300">Target Language:</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-400 font-semibold"
                    >
                      <option value="Hindi">Hindi (हिन्दी)</option>
                      <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish (Español)</option>
                      <option value="French">French (Français)</option>
                    </select>
                  </div>
                  {translatedOutput && (
                    <button
                      onClick={() => navigator.clipboard.writeText(translatedOutput)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copy translated text"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="w-full h-48 md:h-[224px] p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 overflow-y-auto leading-relaxed whitespace-pre-wrap font-sans">
                  {translatedOutput || (
                    <span className="text-slate-400 italic">
                      Translated output will appear here...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleTranslate}
                disabled={!translateInput.trim() || isTranslating}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-colors shadow-sm"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Translate to {targetLang}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CORPUS SEARCH ================= */}
      {activeTool === 'search' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100">Corpus & Semantic Search</h1>
                <p className="text-xs text-slate-400">
                  Search across file names, exact substrings, and ChromaDB vector embeddings.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter a keyword or natural language query (e.g., 'database normalization')..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-2 transition-colors shadow-sm"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
              </button>
            </form>
          </div>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Search results for "{searchQuery}"</span>
                <span>{searchResults.length} matches</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-xs text-slate-400">
                  No matching document sections found.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-3.5 h-3.5 text-brand-400" />
                          <span className="text-xs font-semibold text-slate-200">
                            {item.filename}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                            Page {item.page_number}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {item.match_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                        {item.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
