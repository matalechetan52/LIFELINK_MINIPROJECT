import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lifelink_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('lifelink_token'));
  const [isLoading, setIsLoading] = useState(true);

  const getDashboardPathForRole = useCallback((role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'OWNER':
        return '/provider/dashboard';
      case 'USER':
      default:
        return '/customer/dashboard';
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_user');
    setToken(null);
    setUser(null);
  }, []);

  // Sync / verify current user from server on boot
  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('lifelink_token');
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (isMounted && response.success && response.data) {
          setUser(response.data);
          localStorage.setItem('lifelink_user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.warn('Initial session validation failed or token expired', err?.message);
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    verifyAuth();

    // Listen to custom expired token event from axios client
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('lifelink_auth_expired', handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('lifelink_auth_expired', handleAuthExpired);
    };
  }, [logout]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authApi.login({ email, password });
      if (result.success && result.data) {
        const { token: receivedToken, user: receivedUser } = result.data;
        localStorage.setItem('lifelink_token', receivedToken);
        localStorage.setItem('lifelink_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      return { success: false, message: result.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await authApi.register(userData);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('lifelink_user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
    return null;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    getDashboardPathForRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
