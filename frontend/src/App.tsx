import React, { useState, useEffect } from 'react';
import { RootLayout } from './layouts/RootLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { ChatPage } from './pages/ChatPage';
import { SummaryPage } from './pages/SummaryPage';
import { ToolsPage } from './pages/ToolsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DocumentItem, ConversationItem, DashboardStats } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [translateInitialText, setTranslateInitialText] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
  const [providerName, setProviderName] = useState<string>('Local Fallback');
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Poll for document status changes if any doc is processing
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'PROCESSING' || d.status === 'UPLOADING');
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const docs = await api.getDocuments();
        setDocuments(docs);
        const stillProcessing = docs.some((d) => d.status === 'PROCESSING' || d.status === 'UPLOADING');
        if (!stillProcessing) {
          addToast('Processing Complete', 'All documents are chunked and ready for chat.', 'success');
          fetchStats();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [documents]);

  const fetchInitialData = async () => {
    setIsLoadingDocs(true);
    try {
      const [health, docs, convs, dashboardStats] = await Promise.all([
        api.checkHealth().catch(() => ({ status: 'error', app_name: 'Private Docs AI' })),
        api.getDocuments().catch(() => []),
        api.getConversations().catch(() => []),
        api.getDashboardStats().catch(() => null),
      ]);

      setIsBackendOnline(health.status === 'ok');
      setDocuments(docs);
      setConversations(convs);
      setStats(dashboardStats);
      if (dashboardStats) {
        setProviderName(dashboardStats.ai_provider);
      }
      if (docs.length > 0) {
        setSelectedDocument(docs[0]);
      }
    } catch (err) {
      console.error('Error initializing application:', err);
      setIsBackendOnline(false);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const fetchStats = async () => {
    try {
      const s = await api.getDashboardStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const refreshConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Actions
  const handleStartChatWithDoc = (doc: DocumentItem) => {
    setSelectedDocIds([doc.id]);
    setSelectedDocument(doc);
    setCurrentTab('chat');
    setActiveConversationId(undefined); // Start fresh chat with this document
  };

  const handleSummarizeDoc = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setCurrentTab('summaries');
  };

  const handleTopicsDoc = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setCurrentTab('topics');
  };

  const handleTranslateDoc = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setTranslateInitialText(`Document: ${doc.filename}\n\n[Content ready for translation...]`);
    setCurrentTab('translate');
  };

  const handleOpenDocDetails = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setCurrentTab('document-detail');
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
      if (selectedDocument?.id === docId) {
        setSelectedDocument(null);
      }
      addToast('Document Deleted', 'File, vector embeddings, and database records purged.', 'success');
      fetchStats();
    } catch (err: any) {
      addToast('Delete Failed', err.message, 'error');
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await api.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(undefined);
      }
      addToast('Chat Deleted', 'Conversation purged from local storage.', 'info');
      fetchStats();
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(undefined);
    setCurrentTab('chat');
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    setCurrentTab('chat');
  };

  return (
    <RootLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      documents={documents}
      selectedDocIds={selectedDocIds}
      onChangeSelectedDocs={setSelectedDocIds}
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelectConversation={handleSelectConversation}
      onNewChat={handleNewChat}
      onDeleteConversation={handleDeleteConversation}
      onOpenSearch={() => setCurrentTab('search')}
      providerName={providerName}
      isBackendOnline={isBackendOnline}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          stats={stats}
          documents={documents}
          conversations={conversations}
          onNavigate={setCurrentTab}
          onSelectDocument={handleOpenDocDetails}
          onSelectConversation={handleSelectConversation}
          onOpenUpload={() => setCurrentTab('documents')}
        />
      )}

      {currentTab === 'documents' && (
        <DocumentsPage
          documents={documents}
          isLoading={isLoadingDocs}
          onRefresh={refreshDocuments}
          onOpenDetails={handleOpenDocDetails}
          onStartChat={handleStartChatWithDoc}
          onSummarize={handleSummarizeDoc}
          onTopics={handleTopicsDoc}
          onTranslate={handleTranslateDoc}
          onDelete={handleDeleteDocument}
        />
      )}

      {currentTab === 'document-detail' && selectedDocument && (
        <DocumentDetailPage
          document={selectedDocument}
          onBack={() => setCurrentTab('documents')}
          onStartChat={handleStartChatWithDoc}
          onSummarize={handleSummarizeDoc}
          onTopics={handleTopicsDoc}
          onTranslate={handleTranslateDoc}
          onDelete={handleDeleteDocument}
        />
      )}

      {currentTab === 'chat' && (
        <ChatPage
          documents={documents}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          selectedDocIds={selectedDocIds}
          onViewDoc={(docId) => {
            const found = documents.find((d) => d.id === docId);
            if (found) handleOpenDocDetails(found);
          }}
        />
      )}

      {currentTab === 'summaries' && (
        <SummaryPage
          documents={documents}
          selectedDocument={selectedDocument}
          onSelectDocument={setSelectedDocument}
          onNavigateToTranslate={(text) => {
            setTranslateInitialText(text);
            setCurrentTab('translate');
          }}
        />
      )}

      {['topics', 'questions', 'translate', 'search'].includes(currentTab) && (
        <ToolsPage
          toolTab={currentTab as any}
          documents={documents}
          selectedDocument={selectedDocument}
          onSelectDocument={setSelectedDocument}
          initialTranslateText={translateInitialText}
          onViewDoc={(docId) => {
            const found = documents.find((d) => d.id === docId);
            if (found) handleOpenDocDetails(found);
          }}
        />
      )}

      {currentTab === 'settings' && (
        <SettingsPage onShowToast={addToast} />
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </RootLayout>
  );
};
