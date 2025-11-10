import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, showNotification }: { children: ReactNode; showNotification: (message: string, type?: 'success' | 'error') => void }) {
  return (
    <AuthContext.Provider value={{ showNotification }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
