import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthApi, UserProfile, RegisterPayload, LoginPayload } from '../api/authApi';
import { TokenStorage } from '../../../shared/storage/secureStore';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from SecureStore on startup
  useEffect(() => {
    async function initSession() {
      try {
        const storedUser = await TokenStorage.getUserData<UserProfile>();
        const accessToken = await TokenStorage.getAccessToken();

        if (accessToken && storedUser) {
          setUser(storedUser);
          // Try to sync fresh profile from API in background
          try {
            const freshProfile = await AuthApi.getProfile();
            setUser(freshProfile);
            await TokenStorage.saveUserData(freshProfile);
          } catch {
            // Offline or token expired; attempt refresh if available
            const refreshToken = await TokenStorage.getRefreshToken();
            if (refreshToken) {
              try {
                const refreshed = await AuthApi.refreshToken(refreshToken);
                await TokenStorage.saveTokens(
                  refreshed.tokens.accessToken,
                  refreshed.tokens.refreshToken
                );
                const fresh = await AuthApi.getProfile();
                setUser(fresh);
                await TokenStorage.saveUserData(fresh);
              } catch {
                // If refresh fails, keep cached user or clear
              }
            }
          }
        }
      } catch {
        // Handle init failure gracefully
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, tokens } = await AuthApi.login(payload);
      await TokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
      await TokenStorage.saveUserData(loggedInUser);
      setUser(loggedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const { user: registeredUser, tokens } = await AuthApi.register(payload);
      await TokenStorage.saveTokens(tokens.accessToken, tokens.refreshToken);
      await TokenStorage.saveUserData(registeredUser);
      setUser(registeredUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const updated = await AuthApi.updateProfile(updates);
      await TokenStorage.saveUserData(updated);
      setUser(updated);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
