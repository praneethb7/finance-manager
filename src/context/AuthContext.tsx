import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_DB_KEY = 'users_db'; // stores { [email]: { id, name, email, passwordHash } }
const CURRENT_USER_KEY = 'current_user'; // stores the logged-in user's email

interface User {
  id: string;
  name: string;
  email: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, email: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Simple hash for local storage — not cryptographically secure, but sufficient for on-device demo auth
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

async function getUsersDB(): Promise<Record<string, StoredUser>> {
  const raw = await AsyncStorage.getItem(USERS_DB_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveUsersDB(db: Record<string, StoredUser>) {
  await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore session if user was previously logged in
  useEffect(() => {
    (async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(CURRENT_USER_KEY);
        if (savedEmail) {
          const db = await getUsersDB();
          const stored = db[savedEmail.toLowerCase()];
          if (stored) {
            setUser({ id: stored.id, name: stored.name, email: stored.email });
          }
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const db = await getUsersDB();
    const stored = db[normalizedEmail];

    if (!stored) {
      throw new Error('No account found with this email. Please sign up first.');
    }

    if (stored.passwordHash !== simpleHash(password)) {
      throw new Error('Incorrect password. Please try again.');
    }

    const userData: User = { id: stored.id, name: stored.name, email: stored.email };
    setUser(userData);
    await AsyncStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const db = await getUsersDB();

    if (db[normalizedEmail]) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newUser: StoredUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: simpleHash(password),
    };

    db[normalizedEmail] = newUser;
    await saveUsersDB(db);

    const userData: User = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userData);
    await AsyncStorage.setItem(CURRENT_USER_KEY, normalizedEmail);
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateProfile = async (name: string, email: string, password?: string) => {
    if (!user) return;
    const db = await getUsersDB();
    const oldEmail = user.email.toLowerCase();
    const newEmail = email.toLowerCase().trim();

    // If email changed, check new email isn't taken
    if (newEmail !== oldEmail && db[newEmail]) {
      throw new Error('That email is already in use by another account.');
    }

    const stored = db[oldEmail];
    if (!stored) return;

    stored.name = name.trim();
    stored.email = newEmail;
    if (password && password.length >= 6) {
      stored.passwordHash = simpleHash(password);
    }

    // If email changed, re-key
    if (newEmail !== oldEmail) {
      delete db[oldEmail];
    }
    db[newEmail] = stored;
    await saveUsersDB(db);

    const updated: User = { id: stored.id, name: stored.name, email: stored.email };
    setUser(updated);
    await AsyncStorage.setItem(CURRENT_USER_KEY, newEmail);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
