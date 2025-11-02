/**
 * Dev/Test Page for simple-idm-solid
 *
 * This page allows you to test all components visually against a real backend.
 *
 * Setup:
 * 1. Start quick IDM backend: cd ../simple-idm/cmd/quick && go run main.go
 * 2. Start this dev server: npm run dev
 * 3. Open http://localhost:5173
 * 4. Test each component
 */

import { render } from 'solid-js/web';
import { createSignal, Show, For, Component } from 'solid-js';
import { Router, Route, A, useNavigate, useSearchParams } from '@solidjs/router';

// Import all components
import { LoginForm } from './components/LoginForm';
import { MagicLinkForm } from './components/MagicLinkForm';
import { MagicLinkValidate } from './components/MagicLinkValidate';
import { PasswordlessRegistrationForm } from './components/RegistrationForm';
import { PasswordRegistrationForm } from './components/RegistrationForm';

// Import styles
import './styles/default.css';

// Backend URL (change if needed)
const API_BASE_URL = 'http://localhost:4000';

// Navigation menu
const NavMenu: Component = () => {
  const routes = [
    { path: '/', label: 'Home' },
    { path: '/login', label: 'Login' },
    { path: '/magic-link', label: 'Magic Link' },
    { path: '/magic-link-validate', label: 'Magic Link Validate' },
    { path: '/register-passwordless', label: 'Register (Passwordless)' },
    { path: '/register-password', label: 'Register (Password)' },
  ];

  return (
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex space-x-8">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">simple-idm-solid</h1>
              <span class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                DEV
              </span>
            </div>
            <div class="flex space-x-4 items-center">
              <For each={routes}>
                {(route) => (
                  <A
                    href={route.path}
                    class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                    activeClass="bg-gray-100 text-gray-900"
                  >
                    {route.label}
                  </A>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Home page
const HomePage: Component = () => {
  const [backendStatus, setBackendStatus] = createSignal<'checking' | 'online' | 'offline'>('checking');

  // Check backend status
  const checkBackend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/.well-known/openid-configuration`);
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      setBackendStatus('offline');
    }
  };

  checkBackend();

  return (
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          simple-idm-solid Dev Test Page
        </h1>
        <p class="text-lg text-gray-600 mb-6">
          Test all authentication components with a live backend
        </p>

        {/* Backend Status */}
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border">
          <span class="text-sm font-medium text-gray-700">Backend Status:</span>
          <Show
            when={backendStatus() === 'checking'}
            fallback={
              <span
                class={`text-sm font-semibold ${
                  backendStatus() === 'online' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {backendStatus() === 'online' ? '✓ Online' : '✗ Offline'}
              </span>
            }
          >
            <span class="text-sm text-gray-500">Checking...</span>
          </Show>
          <code class="text-xs text-gray-500 ml-2">{API_BASE_URL}</code>
        </div>
      </div>

      {/* Instructions */}
      <Show when={backendStatus() === 'offline'}>
        <div class="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 class="text-lg font-semibold text-yellow-900 mb-2">
            ⚠️ Backend Not Running
          </h3>
          <p class="text-yellow-800 mb-4">
            Start the quick IDM backend to test components:
          </p>
          <pre class="bg-yellow-100 p-4 rounded text-sm overflow-x-auto">
            <code>cd ../simple-idm/cmd/quick && go run main.go</code>
          </pre>
        </div>
      </Show>

      {/* Component List */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold mb-2">LoginForm</h3>
          <p class="text-gray-600 text-sm mb-4">
            Username/password authentication with HTTP-only cookie support
          </p>
          <A href="/login" class="text-blue-600 hover:text-blue-700 font-medium">
            Test Component →
          </A>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold mb-2">MagicLinkForm</h3>
          <p class="text-gray-600 text-sm mb-4">
            Request a magic link for passwordless authentication
          </p>
          <A href="/magic-link" class="text-blue-600 hover:text-blue-700 font-medium">
            Test Component →
          </A>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold mb-2">MagicLinkValidate</h3>
          <p class="text-gray-600 text-sm mb-4">
            Validate a magic link token from email
          </p>
          <A href="/magic-link-validate" class="text-blue-600 hover:text-blue-700 font-medium">
            Test Component →
          </A>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold mb-2">PasswordlessRegistrationForm</h3>
          <p class="text-gray-600 text-sm mb-4">
            Register without a password using magic link
          </p>
          <A href="/register-passwordless" class="text-blue-600 hover:text-blue-700 font-medium">
            Test Component →
          </A>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <h3 class="text-lg font-semibold mb-2">PasswordRegistrationForm</h3>
          <p class="text-gray-600 text-sm mb-4">
            Register with username and password
          </p>
          <A href="/register-password" class="text-blue-600 hover:text-blue-700 font-medium">
            Test Component →
          </A>
        </div>
      </div>

      {/* Tips */}
      <div class="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 class="text-lg font-semibold text-blue-900 mb-3">💡 Testing Tips</h3>
        <ul class="space-y-2 text-blue-800 text-sm">
          <li>• Open DevTools → Application → Cookies to verify HTTP-only cookies</li>
          <li>• Start Mailpit (docker/start-mailpit.sh) to test magic links</li>
          <li>• Check Network tab for API requests and responses</li>
          <li>• Test with valid admin credentials from backend console</li>
        </ul>
      </div>
    </div>
  );
};

// Login test page
const LoginTestPage: Component = () => {
  const navigate = useNavigate();
  const [response, setResponse] = createSignal<any>(null);

  return (
    <div>
      <LoginForm
        apiBaseUrl={API_BASE_URL}
        onSuccess={(res) => {
          console.log('Login success:', res);
          setResponse(res);
          alert('Login successful! Check console and cookies.');
        }}
        onError={(err) => {
          console.error('Login error:', err);
          alert('Login failed: ' + err);
        }}
        showMagicLinkOption
        showRegistrationLink
      />

      <Show when={response()}>
        <div class="max-w-md mx-auto mt-8 p-4 bg-gray-100 rounded">
          <h3 class="font-bold mb-2">Response:</h3>
          <pre class="text-xs overflow-auto">{JSON.stringify(response(), null, 2)}</pre>
        </div>
      </Show>
    </div>
  );
};

// Magic Link test page
const MagicLinkTestPage: Component = () => {
  return (
    <MagicLinkForm
      apiBaseUrl={API_BASE_URL}
      onSuccess={() => {
        alert('Magic link sent! Check Mailpit at http://localhost:8025');
      }}
      onError={(err) => {
        alert('Failed: ' + err);
      }}
      showPasswordLoginLink
    />
  );
};

// Magic Link Validate test page
const MagicLinkValidateTestPage: Component = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.token as string;

  return (
    <div>
      <Show when={!token}>
        <div class="max-w-md mx-auto mt-12 p-6 bg-yellow-50 border rounded">
          <h3 class="font-bold mb-2">No Token Provided</h3>
          <p class="text-sm mb-4">Add ?token=YOUR_TOKEN to the URL to test validation.</p>
          <p class="text-xs text-gray-600">
            Or request a magic link and click the link from the email.
          </p>
        </div>
      </Show>

      <Show when={token}>
        <MagicLinkValidate
          apiBaseUrl={API_BASE_URL}
          token={token}
          onSuccess={(res) => {
            console.log('Magic link validated:', res);
            alert('Successfully logged in! Check cookies.');
          }}
          onError={(err) => {
            console.error('Validation error:', err);
          }}
          autoValidate
        />
      </Show>
    </div>
  );
};

// Passwordless Registration test page
const PasswordlessRegisterTestPage: Component = () => {
  return (
    <PasswordlessRegistrationForm
      apiBaseUrl={API_BASE_URL}
      onSuccess={(res) => {
        console.log('Registration success:', res);
        alert('Account created! Check Mailpit for verification email.');
      }}
      onError={(err) => {
        console.error('Registration error:', err);
        alert('Registration failed: ' + err);
      }}
      requireInvitationCode={false}
      showLoginLink
    />
  );
};

// Password Registration test page
const PasswordRegisterTestPage: Component = () => {
  return (
    <PasswordRegistrationForm
      apiBaseUrl={API_BASE_URL}
      onSuccess={(res) => {
        console.log('Registration success:', res);
        alert('Account created! You can now log in.');
      }}
      onError={(err) => {
        console.error('Registration error:', err);
        alert('Registration failed: ' + err);
      }}
      requireInvitationCode={false}
      showLoginLink
    />
  );
};

// Main App
const App: Component = () => {
  return (
    <Router>
      <div class="min-h-screen bg-gray-50">
        <NavMenu />
        <div class="py-8">
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginTestPage} />
          <Route path="/magic-link" component={MagicLinkTestPage} />
          <Route path="/magic-link-validate" component={MagicLinkValidateTestPage} />
          <Route path="/register-passwordless" component={PasswordlessRegisterTestPage} />
          <Route path="/register-password" component={PasswordRegisterTestPage} />
        </div>
      </div>
    </Router>
  );
};

// Mount app
render(() => <App />, document.getElementById('root')!);
