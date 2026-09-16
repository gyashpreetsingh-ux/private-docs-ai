import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  User,
  Bot,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { ChatMessageItem } from '../types';
import { SourceCitation } from './SourceCitation';

interface ChatMessageProps {
  message: ChatMessageItem;
  onRegenerate?: () => void;
  onViewDoc?: (docId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onViewDoc,
}) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`py-6 px-4 md:px-6 transition-colors ${
        isAssistant ? 'bg-slate-900/40 border-y border-slate-800/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto flex space-x-4">
        {/* Avatar */}
        <div className="shrink-0">
          {isAssistant ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <Bot className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isAssistant ? 'Private Docs AI' : 'You'}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Copy message"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {isAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Regenerate answer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  return !inline ? (
                    <div className="relative my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                      <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>code block</span>
                      </div>
                      <pre className="p-3.5 overflow-x-auto text-slate-200">
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-slate-800/80 text-brand-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="my-3 overflow-x-auto rounded-xl border border-slate-800">
                      <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return <th className="bg-slate-900/80 px-3 py-2 font-semibold text-slate-200">{children}</th>;
                },
                td({ children }) {
                  return <td className="px-3 py-2 border-t border-slate-800/60 text-slate-300">{children}</td>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Grounded Source References */}
          {isAssistant && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-2.5">
                <FileCheck2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Grounded Sources ({message.sources.length}):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {message.sources.map((src, idx) => (
                  <SourceCitation key={idx} source={src} onViewDoc={onViewDoc} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
