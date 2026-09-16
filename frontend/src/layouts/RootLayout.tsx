import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DocumentItem, ConversationItem } from '../types';

interface RootLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  documents: DocumentItem[];
  selectedDocIds: string[];
  onChangeSelectedDocs: (ids: string[]) => void;
  conversations: ConversationItem[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenSearch: () => void;
  providerName: string;
  isBackendOnline: boolean;
  children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({
  currentTab,
  onSelectTab,
  documents,
  selectedDocIds,
  onChangeSelectedDocs,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onOpenSearch,
  providerName,
  isBackendOnline,
  children,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={onSelectConversation}
        onNewChat={onNewChat}
        onDeleteConversation={onDeleteConversation}
        totalDocsCount={documents.length}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          documents={documents}
          selectedDocIds={selectedDocIds}
          onChangeSelectedDocs={onChangeSelectedDocs}
          onOpenSearch={onOpenSearch}
          providerName={providerName}
          isBackendOnline={isBackendOnline}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
