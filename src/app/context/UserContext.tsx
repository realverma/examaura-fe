import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
  avatar: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (provider: 'google' | 'github') => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const MOCK_USER: User = {
  name: 'Neeraj',
  email: 'vneeraj926@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format'
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const login = (_provider: 'google' | 'github') => {
    setUser(MOCK_USER);
    localStorage.setItem('auth_user', JSON.stringify(MOCK_USER));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
