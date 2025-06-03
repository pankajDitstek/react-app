import React, { createContext, useContext, type ReactNode } from 'react';

type AuthContextType = {
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

const role =  localStorage.getItem('role')
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};