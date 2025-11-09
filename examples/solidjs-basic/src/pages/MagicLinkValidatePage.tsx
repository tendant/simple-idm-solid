import { Component } from 'solid-js';
import { useSearchParams, useNavigate } from '@solidjs/router';
import { MagicLinkValidate } from '@tendant/simple-idm-solid';
import { Layout } from '../components/Layout';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const MagicLinkValidatePage: Component = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.token as string;

  return (
    <Layout title="Validating Magic Link">
      <MagicLinkValidate
        apiBaseUrl={API_BASE_URL}
        token={token}
        onSuccess={(response) => {
          console.log('Magic link validated!', response);
          navigate('/dashboard');
        }}
        onError={(error) => {
          console.error('Magic link validation failed:', error);
        }}
        autoValidate
      />
    </Layout>
  );
};

export default MagicLinkValidatePage;
