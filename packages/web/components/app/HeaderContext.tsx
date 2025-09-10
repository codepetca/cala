'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
  headerContent: ReactNode;
  headerActions: ReactNode;
  setHeaderContent: (content: ReactNode) => void;
  setHeaderActions: (actions: ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<ReactNode>(null);
  const [headerActions, setHeaderActions] = useState<ReactNode>(null);

  return (
    <HeaderContext.Provider value={{
      headerContent,
      headerActions,
      setHeaderContent,
      setHeaderActions,
    }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}