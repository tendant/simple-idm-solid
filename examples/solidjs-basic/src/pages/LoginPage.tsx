import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { LoginForm } from '@tendant/simple-idm-solid';
import { Layout } from '../components/Layout';
import { useAuthContext } from '../components/AuthProvider';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const LoginPage: Component = () => {
  const navigate = useNavigate();
  const auth = useAuthContext();

  return (
    <Layout title="Login">
      <LoginForm
        apiBaseUrl={API_BASE_URL}
        onSuccess={async (response) => {
          console.log('Login successful!', response);
          // Refresh auth state to update the context
          await auth.refreshUser();
          navigate('/dashboard');
        }}
        onError={(error) => {
          console.error('Login failed:', error);
        }}
        showMagicLinkOption
        showRegistrationLink
      />
    </Layout>
  );
};

export default LoginPage;
