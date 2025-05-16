import { useState, useEffect } from 'react';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Check for token in localStorage on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthState({
        token,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    setAuthState({
      token,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      token: null,
      isAuthenticated: false,
    });
  };

  return {
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
  };
} 