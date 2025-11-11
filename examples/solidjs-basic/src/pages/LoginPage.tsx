import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { LoginForm } from '@tendant/simple-idm-solid';
import { Layout } from '../components/Layout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const LoginPage: Component = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Login">
      <LoginForm
        apiBaseUrl={API_BASE_URL}
        onSuccess={(response) => {
          console.log('Login successful!', response);
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
