import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { PasswordlessRegistrationForm } from '@tendant/simple-idm-solid';
import { Layout } from '../components/Layout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const RegisterPage: Component = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Register (Passwordless)">
      <PasswordlessRegistrationForm
        apiBaseUrl={API_BASE_URL}
        onSuccess={(response) => {
          console.log('Registration successful!', response);
          // User will receive a magic link to complete registration
        }}
        onError={(error) => {
          console.error('Registration failed:', error);
        }}
        requireInvitationCode={false}
        showLoginLink
      />
      <div class="mt-4 text-center">
        <a
          href="/register-password"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          Prefer to register with a password?
        </a>
      </div>
    </Layout>
  );
};

export default RegisterPage;
