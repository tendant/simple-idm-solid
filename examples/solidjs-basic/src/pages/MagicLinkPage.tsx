import { Component } from 'solid-js';
import { MagicLinkForm } from '@tendant/simple-idm-solid';
import { Layout } from '../components/Layout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const MagicLinkPage: Component = () => {
  return (
    <Layout title="Magic Link Login">
      <MagicLinkForm
        apiBaseUrl={API_BASE_URL}
        onSuccess={() => {
          console.log('Magic link sent! Check your email.');
        }}
        onError={(error) => {
          console.error('Failed to send magic link:', error);
        }}
        showPasswordLoginLink
      />
    </Layout>
  );
};

export default MagicLinkPage;
