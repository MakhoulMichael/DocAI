import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Document {
  id: string;
  name: string;
  type: 'summary' | 'presentation';
  content: string;
  result?: string;
  createdAt: string;
  userId: string;
  originalFileName?: string;
  resultBlob?: string; // Base64 encoded blob for downloading
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'userId'>) => void;
  getDocumentsByType: (type: 'summary' | 'presentation') => Document[];
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Load user's documents from localStorage
      const storedDocs = localStorage.getItem(`documents_${user.id}`);
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      }
    } else {
      setDocuments([]);
    }
  }, [user]);

  const addDocument = (doc: Omit<Document, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;

    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userId: user.id,
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    localStorage.setItem(`documents_${user.id}`, JSON.stringify(updatedDocs));
  };

  const getDocumentsByType = (type: 'summary' | 'presentation') => {
    return documents.filter((doc) => doc.type === type);
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, getDocumentsByType }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}