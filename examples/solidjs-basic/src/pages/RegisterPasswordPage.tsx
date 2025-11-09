import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { PasswordRegistrationForm } from '@tendant/simple-idm-solid';
import { Layout } from '../components/Layout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const RegisterPasswordPage: Component = () => {
  const navigate = useNavigate();

  return (
    <Layout title="Register with Password">
      <PasswordRegistrationForm
        apiBaseUrl={API_BASE_URL}
        onSuccess={(response) => {
          console.log('Registration successful!', response);
          navigate('/login');
        }}
        onError={(error) => {
          console.error('Registration failed:', error);
        }}
        requireInvitationCode={false}
        showLoginLink
      />
      <div class="mt-4 text-center">
        <a
          href="/register"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          Prefer passwordless registration?
        </a>
      </div>
    </Layout>
  );
};

export default RegisterPasswordPage;
