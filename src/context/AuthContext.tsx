import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('user').then((saved) => {
      if (saved) setUser(JSON.parse(saved));
      setIsLoading(false);
    });
  }, []);

  const signIn = async (email: string, _password: string) => {
    // No real auth — just check if user exists in storage
    const saved = await AsyncStorage.getItem('registered_user');
    if (saved) {
      const userData = JSON.parse(saved);
      if (userData.email === email) {
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return;
      }
    }
    // Auto-create for demo
    const newUser = { name: email.split('@')[0], email };
    setUser(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
  };

  const signUp = async (name: string, email: string, _password: string) => {
    const newUser = { name, email };
    setUser(newUser);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    await AsyncStorage.setItem('registered_user', JSON.stringify(newUser));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
