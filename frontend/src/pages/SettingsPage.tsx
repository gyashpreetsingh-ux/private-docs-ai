import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  Server,
  Database,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Cpu,
} from 'lucide-react';
import { ConfigSettings } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onShowToast }) => {
  const [config, setConfig] = useState<ConfigSettings | null>(null);
  const [activeProvider, setActiveProvider] = useState<string>('fallback');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [topK, setTopK] = useState(6);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.getConfig();
      setConfig(data);
      setActiveProvider(data.ai_provider);
      setOpenaiModel(data.openai_model);
      setGeminiModel(data.gemini_model);
      setOllamaUrl(data.ollama_base_url);
      setOllamaModel(data.ollama_model);
      setTopK(data.top_k_retrieval);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateConfig({
        ai_provider: activeProvider,
        openai_api_key: openaiKey || undefined,
        openai_model: openaiModel,
        gemini_api_key: geminiKey || undefined,
        gemini_model: geminiModel,
        ollama_base_url: ollamaUrl,
        ollama_model: ollamaModel,
        top_k_retrieval: topK,
      });
      onShowToast('Settings Saved', 'AI Provider configuration updated successfully.', 'success');
      loadConfig();
    } catch (err: any) {
      onShowToast('Save Failed', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Application Settings</h1>
          <p className="text-xs text-slate-400">
            Configure your AI LLM providers, local RAG parameters, and review privacy architecture.
          </p>
        </div>
      </div>

      {/* AI Provider Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-brand-400" />
          <span>Select AI Provider</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'fallback', label: 'Offline / Local', desc: 'Zero API keys required' },
            { id: 'openai', label: 'OpenAI', desc: 'GPT-4o / GPT-4o-mini' },
            { id: 'gemini', label: 'Google Gemini', desc: 'Gemini 1.5 Flash / Pro' },
            { id: 'ollama', label: 'Ollama (Local)', desc: 'Llama 3.2 on localhost' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveProvider(item.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                activeProvider === item.id
                  ? 'bg-brand-500/10 border-brand-500/50 text-slate-100'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <p className="text-xs font-bold">{item.label}</p>
              <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Provider Settings Form */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          {activeProvider === 'openai' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder={config?.openai_configured ? '•••••••••••••••• (Configured in .env)' : 'sk-...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Model</label>
                <input
                  type="text"
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {activeProvider === 'gemini' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder={config?.gemini_configured ? '•••••••••••••••• (Configured in .env)' : 'AIzaSy...'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Model</label>
                <input
                  type="text"
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {activeProvider === 'ollama' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Ollama Base URL
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Model Name</label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {activeProvider === 'fallback' && (
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 leading-relaxed">
              <p className="font-semibold text-slate-100 mb-1">Offline Local Fallback Active</p>
              Extracts grounded context directly from your documents and assembles page citations
              without needing any internet connection, API keys, or external LLMs.
            </div>
          )}
        </div>

        {/* Retrieval Parameters */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Top-K Retrieved Chunks per Query: {topK}
          </label>
          <input
            type="range"
            min={2}
            max={12}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>2 (Concise)</span>
            <span>6 (Balanced)</span>
            <span>12 (Comprehensive)</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {/* Privacy Architecture & Security Boundaries */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-200">Privacy & Data Boundary Transparency</h2>
            <p className="text-[11px] text-slate-400">How Private Docs AI stores and handles your data.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-200 block">Raw Uploaded Files</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Stored exclusively on your machine in <code className="text-brand-400 font-mono">data/uploads/</code>.
              Files are sanitized and never executed. Protected from git via <code className="text-slate-300 font-mono">.gitignore</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-200 block">Vector Embeddings</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Stored locally in a persistent ChromaDB database under <code className="text-brand-400 font-mono">data/chroma/</code>.
              No vector indexes are transmitted across the web in local mode.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-200 block">Relational Metadata</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Chunk mappings and conversation records reside locally in <code className="text-brand-400 font-mono">data/app.db</code> (SQLite).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-200 block">Cascading Deletion</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Deleting a document removes the file from disk, deletes all vector embeddings from Chroma, and purges all database rows.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Security Notice</strong>: No digital system is 100% private or impervious. When connecting to cloud AI providers (OpenAI or Gemini), retrieved excerpt chunks are transmitted over TLS to generate answers. Use the Local / Ollama provider for completely offline operation.
          </span>
        </div>
      </div>
    </div>
  );
};
