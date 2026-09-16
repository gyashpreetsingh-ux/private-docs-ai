import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  RotateCcw,
  Trash2,
  MessageSquare,
  FileCheck2,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';
import { DocumentItem, ConversationItem, ChatMessageItem } from '../types';
import { ChatMessage } from '../components/ChatMessage';
import { api } from '../services/api';

interface ChatPageProps {
  documents: DocumentItem[];
  conversations: ConversationItem[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  selectedDocIds: string[];
  onViewDoc?: (docId: string) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  documents,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  selectedDocIds,
  onViewDoc,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Searching your documents...');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversationId) {
      loadConversationMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationMessages = async (convId: string) => {
    try {
      const conv = await api.getConversation(convId);
      setMessages(conv.messages || []);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');
    setIsLoading(true);
    setLoadingStatus('Searching your documents in ChromaDB...');

    // Optimistically add user message
    const tempUserMsg: ChatMessageItem = {
      id: 'temp-' + Date.now(),
      conversation_id: activeConversationId || '',
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    setTimeout(() => {
      setLoadingStatus('Synthesizing grounded answer with citations...');
    }, 1200);

    try {
      const resp = await api.sendMessage({
        message: query,
        conversation_id: activeConversationId,
        document_ids: selectedDocIds.length > 0 ? selectedDocIds : undefined,
      });

      // Update active conversation if this was the first message
      if (!activeConversationId && resp.conversation_id) {
        onSelectConversation(resp.conversation_id);
      }

      // Add assistant message
      const assistantMsg: ChatMessageItem = {
        id: resp.assistant_message_id,
        conversation_id: resp.conversation_id,
        role: 'assistant',
        content: resp.answer,
        sources: resp.sources,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessageItem = {
        id: 'err-' + Date.now(),
        conversation_id: activeConversationId || '',
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to generate answer. Please try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setLoadingStatus('Searching your documents...');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const starterPrompts = [
    'What are the main topics discussed in this document?',
    'Give me a simple explanation of the core concepts.',
    'Extract key definitions and terminology.',
    'Explain this like I am a beginner.',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/10">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">
                Ask anything about your private documents
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Answers are strictly grounded in your uploaded documents. Page numbers and
                excerpts will be cited for every fact.
              </p>
            </div>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 text-left">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-brand-500/30 hover:bg-slate-900 text-xs text-slate-300 transition-all text-left flex items-start space-x-2.5 group"
                >
                  <HelpCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/20">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                onRegenerate={() => {
                  const lastUserMsg = [...messages].reverse().find((x) => x.role === 'user');
                  if (lastUserMsg) handleSendMessage(lastUserMsg.content);
                }}
                onViewDoc={onViewDoc}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="py-6 px-4 md:px-6 bg-slate-900/30 border-y border-slate-800/40">
                <div className="max-w-4xl mx-auto flex space-x-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 pt-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                    <span>{loadingStatus}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Tray */}
      <div className="border-t border-slate-800/80 bg-slate-950/80 p-4 md:p-6 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-brand-500/60 transition-all shadow-lg">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your documents (e.g., 'What are the ACID properties in Chapter 3?')..."
              rows={2}
              className="w-full bg-transparent px-4 py-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-slate-800/40">
              <span className="text-[11px] text-slate-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Shift+Enter</kbd> for newline
              </span>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:hover:bg-brand-500 text-slate-950 font-bold transition-all shadow-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
