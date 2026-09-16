export interface DocumentItem {
  id: string;
  filename: string;
  original_filename: string;
  file_type: 'pdf' | 'docx' | 'txt' | 'md' | string;
  file_size: number;
  upload_date: string;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  page_count: number;
  chunk_count: number;
  error_message?: string | null;
  is_scanned: boolean;
}

export interface DocumentChunkItem {
  id: string;
  chunk_index: number;
  page_number: number;
  text: string;
}

export interface SourceCitationItem {
  document_id: string;
  filename: string;
  page_number: number;
  chunk_index: number;
  text_snippet: string;
  relevance_score?: number;
}

export interface ChatMessageItem {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceCitationItem[];
  created_at: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  selected_doc_ids?: string[];
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface SummaryResponse {
  document_id: string;
  document_name: string;
  summary_type: string;
  content: string;
  created_at: string;
}

export interface ImportantTopicItem {
  id?: string;
  topic: string;
  importance: 'High' | 'Medium' | 'Low';
  why_it_matters: string;
  relevant_pages?: string;
}

export interface GeneratedQuestionItem {
  id?: string;
  question_type: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  answer: string;
  options?: string[];
  source_page?: string;
}

export interface DashboardStats {
  total_documents: number;
  ready_documents: number;
  total_conversations: number;
  total_chunks: number;
  ai_provider: string;
  embedding_provider: string;
}

export interface ConfigSettings {
  app_name: string;
  app_env: string;
  ai_provider: string;
  embedding_provider: string;
  openai_configured: boolean;
  openai_model: string;
  gemini_configured: boolean;
  gemini_model: string;
  ollama_base_url: string;
  ollama_model: string;
  chunk_size_tokens: number;
  chunk_overlap_tokens: number;
  top_k_retrieval: number;
  max_file_size_mb: number;
}

export interface SearchResultItem {
  document_id: string;
  filename: string;
  page_number: number;
  chunk_index: number;
  snippet: string;
  score?: number;
  match_type: 'semantic' | 'metadata' | 'exact';
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResultItem[];
}
