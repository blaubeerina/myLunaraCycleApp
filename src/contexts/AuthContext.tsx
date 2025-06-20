
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from './AppContext'; // Import AppContext to load app data on login

interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>; 
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  // AppContext might not be available here if AuthContextProvider is wrapping AppProvider
  // const { loadAppData } = useAppContext(); // This will cause issues if AppProvider is child

  useEffect(() => {
    const mockUser = localStorage.getItem('myLunaraCycle-user');
    if (mockUser) {
      const parsedUser = JSON.parse(mockUser);
      setUser(parsedUser);
      // loadAppData is called in DashboardPage or AppLayout after user is confirmed
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('myLunaraCycle-user', JSON.stringify(userData));
    // loadAppData(userData.id); // Call this after user is set and AppContext is available
    router.push('/dashboard');
  };

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUserData: User = { 
      id: email || 'user@example.com', // Use email as ID for simplicity in mock
      email: email || 'user@example.com', 
      displayName: 'Lunar User',
      photoURL: `https://placehold.co/100x100.png?text=${(email || 'U')[0].toUpperCase()}`
    };
    await handleLoginSuccess(mockUserData);
    setIsLoading(false);
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockGoogleUserData: User = {
      id: 'google-user-123',
      email: 'googleuser@example.com',
      displayName: 'Google User',
      photoURL: 'https://placehold.co/100x100.png?text=G'
    };
    await handleLoginSuccess(mockGoogleUserData);
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('myLunaraCycle-user');
    // Also clear app-specific data for this user if desired
    // localStorage.removeItem(`myLunaraCycle_appData_${user?.id}`); // Be careful with user being null here
    setIsLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signInWithGoogle }}>
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
