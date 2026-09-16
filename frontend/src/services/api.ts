import {
  DocumentItem,
  DocumentChunkItem,
  ConversationItem,
  ChatMessageItem,
  SummaryResponse,
  ImportantTopicItem,
  GeneratedQuestionItem,
  DashboardStats,
  ConfigSettings,
  SearchResponse,
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = res.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Health
  async checkHealth(): Promise<{ status: string; app_name: string }> {
    const res = await fetch('/health');
    return handleResponse(res);
  },

  // Documents
  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${BASE_URL}/documents`);
    return handleResponse(res);
  },

  async getDocument(id: string): Promise<DocumentItem> {
    const res = await fetch(`${BASE_URL}/documents/${id}`);
    return handleResponse(res);
  },

  async getDocumentChunks(id: string): Promise<DocumentChunkItem[]> {
    const res = await fetch(`${BASE_URL}/documents/${id}/chunks`);
    return handleResponse(res);
  },

  async uploadDocument(file: File): Promise<{ message: string; document: DocumentItem }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async reprocessDocument(id: string): Promise<{ message: string; document_id: string; status: string }> {
    const res = await fetch(`${BASE_URL}/documents/${id}/process`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async deleteDocument(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Conversations & Chat
  async getConversations(): Promise<ConversationItem[]> {
    const res = await fetch(`${BASE_URL}/chat/conversations`);
    return handleResponse(res);
  },

  async createConversation(title?: string, selectedDocIds?: string[]): Promise<ConversationItem> {
    const res = await fetch(`${BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, selected_doc_ids: selectedDocIds || [] }),
    });
    return handleResponse(res);
  },

  async getConversation(id: string): Promise<ConversationItem & { messages: ChatMessageItem[] }> {
    const res = await fetch(`${BASE_URL}/chat/conversations/${id}`);
    return handleResponse(res);
  },

  async updateConversation(id: string, title?: string, selectedDocIds?: string[]): Promise<ConversationItem> {
    const res = await fetch(`${BASE_URL}/chat/conversations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, selected_doc_ids: selectedDocIds }),
    });
    return handleResponse(res);
  },

  async deleteConversation(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/chat/conversations/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async sendMessage(params: {
    message: string;
    conversation_id?: string;
    document_ids?: string[];
  }): Promise<{
    conversation_id: string;
    user_message_id: string;
    assistant_message_id: string;
    answer: string;
    sources: any[];
  }> {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  // Summaries
  async generateSummary(documentId: string, summaryType: string = 'detailed'): Promise<SummaryResponse> {
    const res = await fetch(`${BASE_URL}/summaries/${documentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary_type: summaryType }),
    });
    return handleResponse(res);
  },

  async exportSummary(content: string, filename: string, format: 'markdown' | 'txt' = 'markdown'): Promise<Blob> {
    const res = await fetch(`${BASE_URL}/summaries/export/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, filename, format }),
    });
    if (!res.ok) throw new Error('Failed to export summary');
    return res.blob();
  },

  // Tools
  async extractTopics(documentId: string): Promise<{ document_id: string; document_name: string; topics: ImportantTopicItem[] }> {
    const res = await fetch(`${BASE_URL}/tools/topics/${documentId}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async generateQuestions(
    documentId: string,
    questionType: string = 'mcq',
    difficulty: string = 'Medium',
    count: number = 5
  ): Promise<{ document_id: string; document_name: string; questions: GeneratedQuestionItem[] }> {
    const res = await fetch(`${BASE_URL}/tools/questions/${documentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_type: questionType, difficulty, count }),
    });
    return handleResponse(res);
  },

  async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'English'): Promise<{
    original_text: string;
    translated_text: string;
    target_language: string;
    source_language: string;
  }> {
    const res = await fetch(`${BASE_URL}/tools/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_language: targetLanguage, source_language: sourceLanguage }),
    });
    return handleResponse(res);
  },

  // Search
  async search(query: string): Promise<SearchResponse> {
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    return handleResponse(res);
  },

  // Settings & Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/settings/stats`);
    return handleResponse(res);
  },

  async getConfig(): Promise<ConfigSettings> {
    const res = await fetch(`${BASE_URL}/settings/config`);
    return handleResponse(res);
  },

  async updateConfig(payload: Partial<ConfigSettings> & { openai_api_key?: string; gemini_api_key?: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/settings/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
};
