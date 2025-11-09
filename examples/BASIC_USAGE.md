# Basic Usage Examples

Quick reference examples for common use cases.

## Simple Login Form

```tsx
import { LoginForm } from '@tendant/simple-idm-solid';
import '@tendant/simple-idm-solid/styles';

function App() {
  return (
    <LoginForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response) => {
        console.log('Logged in!', response);
        window.location.href = '/dashboard';
      }}
      onError={(error) => {
        console.error('Login failed:', error);
      }}
      showMagicLinkOption
      showRegistrationLink
    />
  );
}
```

## Magic Link Authentication

```tsx
import { MagicLinkForm, MagicLinkValidate } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';

// Request magic link
function MagicLinkPage() {
  return (
    <MagicLinkForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={() => alert('Check your email!')}
    />
  );
}

// Validate magic link token
function ValidatePage() {
  const [params] = useSearchParams();

  return (
    <MagicLinkValidate
      apiBaseUrl="http://localhost:4000"
      token={params.token}
      onSuccess={(response) => {
        console.log('Logged in via magic link!', response);
        window.location.href = '/dashboard';
      }}
      autoValidate
    />
  );
}
```

## User Registration

```tsx
import {
  PasswordlessRegistrationForm,
  PasswordRegistrationForm
} from '@tendant/simple-idm-solid';

// Passwordless (magic link)
function RegisterPasswordless() {
  return (
    <PasswordlessRegistrationForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response) => {
        console.log('Account created!', response);
        alert('Check your email to complete registration');
      }}
      requireInvitationCode={false}
    />
  );
}

// With password
function RegisterWithPassword() {
  return (
    <PasswordRegistrationForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response) => {
        console.log('Account created!', response);
        window.location.href = '/login';
      }}
      requireInvitationCode={false}
    />
  );
}
```

## Using the Auth Hook

```tsx
import { SimpleIdmClient, useAuth } from '@tendant/simple-idm-solid';
import { Show } from 'solid-js';

function App() {
  const client = new SimpleIdmClient({
    baseUrl: 'http://localhost:4000',
    onUnauthorized: () => window.location.href = '/login'
  });

  const auth = useAuth({
    client,
    checkAuthOnMount: true,
    onLoginSuccess: (user) => console.log('Welcome!', user),
    onLogoutSuccess: () => window.location.href = '/login',
  });

  return (
    <Show
      when={auth.isAuthenticated()}
      fallback={<LoginPage />}
    >
      <Dashboard
        user={auth.user()}
        onLogout={() => auth.logout()}
      />
    </Show>
  );
}
```

## Protected Routes

```tsx
import { Component, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';

function ProtectedRoute(props) {
  const auth = useAuthContext();

  return (
    <Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  );
}

// Usage
<Route path="/dashboard" component={() => (
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
)} />
```

## Direct API Client Usage

```tsx
import { SimpleIdmClient } from '@tendant/simple-idm-solid';

const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  onUnauthorized: () => {
    console.log('Session expired');
    window.location.href = '/login';
  },
});

// Login
async function login(username: string, password: string) {
  try {
    const response = await client.login({ username, password });
    console.log('Logged in:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const user = await client.getCurrentUser();
    console.log('Current user:', user);
    return user;
  } catch (error) {
    console.error('Not authenticated');
    return null;
  }
}

// Logout
async function logout() {
  await client.logout();
  window.location.href = '/login';
}

// Request magic link
async function requestMagicLink(email: string) {
  const response = await client.requestMagicLink({
    email,
    redirect_url: 'http://localhost:3000/magic-link/validate'
  });
  console.log('Magic link sent');
}

// Validate magic link
async function validateMagicLink(token: string) {
  const response = await client.validateMagicLink(token);
  console.log('Logged in via magic link:', response);
  return response;
}

// Register with password
async function register(username: string, email: string, password: string) {
  const response = await client.signupWithPassword({
    username,
    email,
    password,
  });
  console.log('Registered:', response);
  return response;
}

// Register passwordless
async function registerPasswordless(email: string) {
  const response = await client.signupPasswordless({
    email,
    redirect_url: 'http://localhost:3000/magic-link/validate'
  });
  console.log('Registration link sent');
  return response;
}
```

## Custom Form with useForm Hook

```tsx
import { useForm, validators } from '@tendant/simple-idm-solid';

function CustomLoginForm() {
  const client = new SimpleIdmClient({ baseUrl: 'http://localhost:4000' });

  const form = useForm({
    initialValues: {
      username: '',
      password: ''
    },
    validate: {
      username: validators.required('Username is required'),
      password: [
        validators.required('Password is required'),
        validators.minLength(8, 'Password must be at least 8 characters'),
      ],
    },
    onSubmit: async (values) => {
      const response = await client.login(values);
      console.log('Success!', response);
      window.location.href = '/dashboard';
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input
          name="username"
          value={form.values.username}
          onInput={(e) => form.setFieldValue('username', e.currentTarget.value)}
          onBlur={() => form.setFieldTouched('username', true)}
        />
        {form.errors.username && form.touched.username && (
          <div class="error">{form.errors.username}</div>
        )}
      </div>

      <div>
        <input
          type="password"
          name="password"
          value={form.values.password}
          onInput={(e) => form.setFieldValue('password', e.currentTarget.value)}
          onBlur={() => form.setFieldTouched('password', true)}
        />
        {form.errors.password && form.touched.password && (
          <div class="error">{form.errors.password}</div>
        )}
      </div>

      <button type="submit" disabled={form.isSubmitting()}>
        {form.isSubmitting() ? 'Logging in...' : 'Login'}
      </button>

      {form.submitError() && (
        <div class="error">{form.submitError()}</div>
      )}
    </form>
  );
}
```

## Customizing Styles

```tsx
// Option 1: CSS Variables
// In your global CSS:
:root {
  --idm-color-primary: #8B5CF6;
  --idm-color-error: #DC2626;
  --idm-color-success: #059669;
  --idm-radius: 0.75rem;
}

// Option 2: Tailwind Classes
<LoginForm
  apiBaseUrl="http://localhost:4000"
  class="shadow-2xl border-2 border-purple-500"
  onSuccess={handleSuccess}
/>

// Option 3: Use primitives to build custom UI
import { Input, Button, Card } from '@tendant/simple-idm-solid';

function CustomForm() {
  return (
    <Card>
      <Input
        label="Email"
        type="email"
        class="my-custom-input"
      />
      <Button
        variant="primary"
        class="w-full"
      >
        Submit
      </Button>
    </Card>
  );
}
```

## Complete App Template

```tsx
import { render } from 'solid-js/web';
import { Router, Route, Navigate } from '@solidjs/router';
import {
  LoginForm,
  SimpleIdmClient,
  useAuth
} from '@tendant/simple-idm-solid';
import '@tendant/simple-idm-solid/styles';
import { createContext, useContext, Show } from 'solid-js';

// Auth Context
const AuthContext = createContext();
const useAuthContext = () => useContext(AuthContext);

function AuthProvider(props) {
  const client = new SimpleIdmClient({
    baseUrl: 'http://localhost:4000',
    onUnauthorized: () => window.location.href = '/login',
  });

  const auth = useAuth({
    client,
    checkAuthOnMount: true,
  });

  return (
    <AuthContext.Provider value={auth}>
      {props.children}
    </AuthContext.Provider>
  );
}

// Protected Route
function ProtectedRoute(props) {
  const auth = useAuthContext();

  return (
    <Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
      {props.children}
    </Show>
  );
}

// Pages
function LoginPage() {
  return (
    <div class="min-h-screen flex items-center justify-center">
      <LoginForm
        apiBaseUrl="http://localhost:4000"
        onSuccess={() => window.location.href = '/dashboard'}
        showMagicLinkOption
        showRegistrationLink
      />
    </div>
  );
}

function Dashboard() {
  const auth = useAuthContext();

  return (
    <div>
      <h1>Welcome, {auth.user()?.email}!</h1>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
}

// App
function App() {
  return (
    <AuthProvider>
      <Router>
        <Route path="/" component={() => <Navigate href="/login" />} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )} />
      </Router>
    </AuthProvider>
  );
}

render(() => <App />, document.getElementById('root'));
```
