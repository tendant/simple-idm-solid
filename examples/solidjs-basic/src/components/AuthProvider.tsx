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
      // Redirect to login on 401
      window.location.href = '/login';
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
      window.location.href = '/login';
    },
  });

  return (
    <AuthContext.Provider value={auth}>
      {props.children}
    </AuthContext.Provider>
  );
};
