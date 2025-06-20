
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useAppContext } from './AppContext'; // Import AppContext to load app data on login

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

const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  displayName: 'Demo User',
  photoURL: `https://placehold.co/100x100.png?text=D`
};

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USER); // Default to Demo User
  const [isLoading, setIsLoading] = useState(false); // Assume loaded for demo
  const router = useRouter();

  useEffect(() => {
    // In Demo Mode, we bypass localStorage check and immediately set the demo user.
    setUser(DEMO_USER);
    setIsLoading(false);
    // Optionally, you could check if a real user was previously logged in and clear that
    // localStorage.removeItem('myLunaraCycle-user'); 
  }, []);

  const handleLoginSuccess = async (userData: User) => {
    setUser(userData);
    // localStorage.setItem('myLunaraCycle-user', JSON.stringify(userData)); // No localStorage for demo user
    router.push('/dashboard');
  };

  const login = async (email?: string, password?: string) => {
    setIsLoading(true);
    console.log("DEMO MODE: Login attempt with", email);
    // Simulate a very short delay
    await new Promise(resolve => setTimeout(resolve, 100));
    await handleLoginSuccess(DEMO_USER); // Always log in as demo user
    setIsLoading(false);
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    console.log("DEMO MODE: Google Sign-In attempt");
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockGoogleDemoUser: User = {
      id: 'google-demo-456',
      email: 'googledemo@example.com',
      displayName: 'Google Demo User',
      photoURL: 'https://placehold.co/100x100.png?text=G'
    };
    await handleLoginSuccess(mockGoogleDemoUser); // Log in as Google demo user
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    console.log("DEMO MODE: Logout attempt");
    await new Promise(resolve => setTimeout(resolve, 100));
    setUser(null); // Effectively logs out the demo user for the session
    // localStorage.removeItem('myLunaraCycle-user');
    setIsLoading(false);
    router.push('/login'); // Redirect to login, where they'd "log in" as demo user again
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
