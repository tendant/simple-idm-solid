import { Component, createSignal, onMount } from 'solid-js';
import { Router, Route, Navigate } from '@solidjs/router';
import { SimpleIdmClient, useAuth } from '@tendant/simple-idm-solid';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MagicLinkPage from './pages/MagicLinkPage';
import MagicLinkValidatePage from './pages/MagicLinkValidatePage';
import RegisterPage from './pages/RegisterPage';
import RegisterPasswordPage from './pages/RegisterPasswordPage';
import DashboardPage from './pages/DashboardPage';

// Configure the API client
// Change this to your simple-idm backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const App: Component = () => {
  return (
    <AuthProvider apiBaseUrl={API_BASE_URL}>
      <Router>
        <Route path="/" component={() => <Navigate href="/login" />} />
        <Route path="/login" component={LoginPage} />
        <Route path="/magic-link" component={MagicLinkPage} />
        <Route path="/magic-link/validate" component={MagicLinkValidatePage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/register-password" component={RegisterPasswordPage} />
        <Route path="/dashboard" component={() => (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )} />
      </Router>
    </AuthProvider>
  );
};

export default App;
