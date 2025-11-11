import { Component, JSX, createContext, useContext } from 'solid-js';
import { SimpleIdmClient, useAuth, UseAuthReturn } from '@tendant/simple-idm-solid';

const AuthContext = createContext<UseAuthReturn>();

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  apiBaseUrl: string;
  children: JSX.Element;
}

export const AuthProvider: Component<AuthProviderProps> = (props) => {
  const client = new SimpleIdmClient({
    baseUrl: props.apiBaseUrl,
    onUnauthorized: () => {
      // Redirect to login on 401, but only if not already on a public page
      const publicPaths = ['/login', '/register', '/register-password', '/magic-link', '/magic-link/validate'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    },
  });

  const auth = useAuth({
    client,
    checkAuthOnMount: true,
    onLoginSuccess: (user) => {
      console.log('User logged in:', user);
    },
    onLogoutSuccess: () => {
      console.log('User logged out');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    },
  });

  return (
    <AuthContext.Provider value={auth}>
      {props.children}
    </AuthContext.Provider>
  );
};
