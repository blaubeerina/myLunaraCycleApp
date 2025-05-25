'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>; // Mock login
  logout: () => Promise<void>;
  // signUp: (email?: string, password?: string) => Promise<void>; // Mock signup
  // signInWithGoogle: () => Promise<void>; // Mock Google sign-in
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth state on load
    const mockUser = localStorage.getItem('myLunaraCycle-user');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUserData = { id: '123', email: email || 'user@example.com', displayName: 'Lunar User' };
    setUser(mockUserData);
    localStorage.setItem('myLunaraCycle-user', JSON.stringify(mockUserData));
    setIsLoading(false);
    router.push('/dashboard');
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('myLunaraCycle-user');
    setIsLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
