import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

import api from '../api/axiosConfig';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
}

interface JwtPayload {
  userId?: string;
  fullName?: string;
  name?: string;
  sub?: string;
  role?: string;
  avatarUrl?: string;
  exp?: number;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  loginWithToken: (
    token: string,
    refreshToken: string,
    userData?: LoginResponse
  ) => void;

  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(
  undefined
);

// Decode JWT payload
function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) return null;

    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    const decoded = decodeURIComponent(
      window
        .atob(padded)
        .split('')
        .map(
          (char) =>
            '%' +
            char.charCodeAt(0).toString(16).padStart(2, '0')
        )
        .join('')
    );

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Logout
  const logout = useCallback(() => {
    setUser(null);

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }, []);

  // Restore user session on application startup
  useEffect(() => {
    const controller = new AbortController();

    const initializeUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          return;
        }

        const payload = decodeToken(token);

        if (
          !payload ||
          !payload.userId
        ) {
          logout();
          return;
        }

        const response = await api.get(
          `/users/${encodeURIComponent(payload.userId)}`,
          {
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        const userData = response.data;

        setUser({
          id: userData.id,
          name: userData.fullName,
          email: userData.email,
          role: userData.userRole,
          avatar: userData.avatarUrl || DEFAULT_AVATAR,
        });
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error('User initialization failed:', error);

        // Only clear credentials for authentication failures.
        // Preserve them during network/server failures.
        const status = (
          error as {
            response?: { status?: number };
          }
        ).response?.status;

        if (status === 401 || status === 403) {
          logout();
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    initializeUser();

    return () => {
      controller.abort();
    };
  }, [logout]);

  
useEffect(() => {
  const handleSessionExpired = () => {
    logout();
    setIsLoading(false);
  };

  window.addEventListener(
    'auth:session-expired',
    handleSessionExpired
  );

  return () => {
    window.removeEventListener(
      'auth:session-expired',
      handleSessionExpired
    );
  };
}, [logout]);


  // Login / OAuth2
  const loginWithToken = useCallback(
    (
      token: string,
      refreshToken: string,
      userData?: LoginResponse
    ) => {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      if (userData) {
        setUser({
          id: userData.userId,
          name: userData.fullName,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatarUrl || DEFAULT_AVATAR,
        });
      } else {
        const payload = decodeToken(token);

        if (
          !payload ||
          !payload.userId
        ) {
          logout();
          setIsLoading(false);
          return;
        }

        setUser({
          id: payload.userId,
          name:
            payload.fullName ||
            payload.name ||
            payload.sub ||
            'OAuth User',
          email: payload.sub || '',
          role: payload.role || 'VIEWER',
          avatar: payload.avatarUrl || DEFAULT_AVATAR,
        });
      }

      setIsLoading(false);
    },
    [logout]
  );

  const contextValue = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      isLoading,
      loginWithToken,
      logout,
    }),
    [user, isLoading, loginWithToken, logout]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      'useUser must be used within a UserProvider'
    );
  }

  return context;
}