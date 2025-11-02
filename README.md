# simple-idm-solid

> SolidJS authentication components for [simple-idm](https://github.com/tendant/simple-idm)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

**simple-idm-solid** is an open-source SolidJS UI component library providing ready-to-use authentication UIs — login, registration, password reset, and MFA — designed for seamless integration with [simple-idm](https://github.com/tendant/simple-idm), a Go-based identity management and OIDC provider.

This project enables developers to easily embed identity workflows into any SolidJS, SolidStart, or Astro application without rebuilding authentication flows.

## Features

- 🔐 **Complete Auth Components**: Login, Magic Link, Registration (passwordless & password)
- 🎨 **Tailwind Styled**: Fully customizable with Tailwind CSS
- 📦 **Lightweight**: <50KB gzipped
- 🔒 **Secure**: Built for HTTP-only cookie authentication
- ♿ **Accessible**: WCAG AA compliant components
- 📘 **TypeScript**: Full type safety
- 🚀 **Zero Config**: Works with simple-idm out of the box

## Installation

```bash
npm install @tendant/simple-idm-solid
# or
pnpm add @tendant/simple-idm-solid
# or
yarn add @tendant/simple-idm-solid
```

## Quick Start

### 1. Import Styles

Import the default styles in your app entry point:

```tsx
// App.tsx or index.tsx
import '@tendant/simple-idm-solid/styles';
```

### 2. Use Components

```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

function LoginPage() {
  return (
    <LoginForm
      apiBaseUrl="http://localhost:4000"
      onSuccess={(response) => {
        console.log('Login successful!', response);
        window.location.href = '/dashboard';
      }}
      showMagicLinkOption
      showRegistrationLink
    />
  );
}
```

## Components

### LoginForm

Username/password login form with HTTP-only cookie authentication.

```tsx
import { LoginForm } from '@tendant/simple-idm-solid';

<LoginForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => {
    // Handle successful login
    window.location.href = '/dashboard';
  }}
  onError={(error) => {
    console.error('Login failed:', error);
  }}
  redirectUrl="/dashboard"
  showMagicLinkOption
  showRegistrationLink
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: (response: LoginResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `redirectUrl?: string`: Auto-redirect after login
- `showMagicLinkOption?: boolean`: Show magic link login option
- `showRegistrationLink?: boolean`: Show registration link

### MagicLinkForm

Request a magic link for passwordless authentication.

```tsx
import { MagicLinkForm } from '@tendant/simple-idm-solid';

<MagicLinkForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={() => {
    console.log('Magic link sent!');
  }}
  showPasswordLoginLink
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: () => void`: Success callback (link sent)
- `onError?: (error: string) => void`: Error callback
- `showPasswordLoginLink?: boolean`: Show back to password login link

### MagicLinkValidate

Validate a magic link token (from email).

```tsx
import { MagicLinkValidate } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';

function MagicLinkValidatePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.token as string;

  return (
    <MagicLinkValidate
      apiBaseUrl="http://localhost:4000"
      token={token}
      onSuccess={(response) => {
        console.log('Logged in!', response);
      }}
      redirectUrl="/dashboard"
      autoValidate // Automatically validate on mount
    />
  );
}
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `token` (required): Magic link token from URL
- `onSuccess?: (response: MagicLinkValidateResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `autoValidate?: boolean`: Auto-validate on mount (default: true)
- `redirectUrl?: string`: Auto-redirect after validation

### PasswordlessRegistrationForm

Register without a password (uses magic link).

```tsx
import { PasswordlessRegistrationForm } from '@tendant/simple-idm-solid';

<PasswordlessRegistrationForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => {
    console.log('Account created!', response);
  }}
  requireInvitationCode={false}
  showLoginLink
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: (response: SignupResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `requireInvitationCode?: boolean`: Require invitation code
- `showLoginLink?: boolean`: Show login link
- `redirectUrl?: string`: Auto-redirect after registration

### PasswordRegistrationForm

Register with username and password.

```tsx
import { PasswordRegistrationForm } from '@tendant/simple-idm-solid';

<PasswordRegistrationForm
  apiBaseUrl="http://localhost:4000"
  onSuccess={(response) => {
    console.log('Account created!', response);
    window.location.href = '/login';
  }}
  requireInvitationCode={false}
  showLoginLink
/>
```

**Props:**
- `apiBaseUrl` (required): Base URL of simple-idm backend
- `onSuccess?: (response: SignupResponse) => void`: Success callback
- `onError?: (error: string) => void`: Error callback
- `requireInvitationCode?: boolean`: Require invitation code
- `showLoginLink?: boolean`: Show login link
- `redirectUrl?: string`: Auto-redirect after registration

## API Client

Use the `SimpleIdmClient` directly for custom implementations:

```tsx
import { SimpleIdmClient } from '@tendant/simple-idm-solid';

const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  onUnauthorized: () => {
    // Handle 401 errors (e.g., redirect to login)
    window.location.href = '/login';
  },
});

// Login
const response = await client.login({
  username: 'user@example.com',
  password: 'password',
});

// Get current user
const user = await client.getCurrentUser();

// Logout
await client.logout();
```

## Hooks

### useAuth

Manage authentication state:

```tsx
import { useAuth, SimpleIdmClient } from '@tendant/simple-idm-solid';

function App() {
  const client = new SimpleIdmClient({ baseUrl: 'http://localhost:4000' });

  const auth = useAuth({
    client,
    checkAuthOnMount: true,
    onLoginSuccess: (user) => {
      console.log('Welcome!', user);
    },
  });

  return (
    <Show when={auth.isAuthenticated()} fallback={<LoginPage />}>
      <Dashboard user={auth.user()} onLogout={auth.logout} />
    </Show>
  );
}
```

### useForm

Form state management with validation:

```tsx
import { useForm, validators } from '@tendant/simple-idm-solid';

const form = useForm({
  initialValues: { username: '', password: '' },
  validate: {
    username: validators.required('Username is required'),
    password: [
      validators.required('Password is required'),
      validators.minLength(8),
    ],
  },
  onSubmit: async (values) => {
    await client.login(values);
  },
});
```

## Customization

### Tailwind Classes

All components accept a `class` prop for custom styling:

```tsx
<LoginForm
  apiBaseUrl="http://localhost:4000"
  class="my-custom-class"
/>
```

### CSS Variables

Override theme colors:

```css
:root {
  --idm-color-primary: #3B82F6;
  --idm-color-error: #EF4444;
  --idm-color-success: #10B981;
  --idm-radius: 0.5rem;
}
```

## Important: Cookie-Based Authentication

**simple-idm** uses **HTTP-only cookies** for JWT token storage (not localStorage).

This means:
- ✅ Tokens are automatically sent with requests
- ✅ More secure (XSS protection)
- ✅ No manual token management needed
- ❌ Requires CORS configuration for cross-origin requests

### CORS Configuration

If your frontend and backend are on different origins, ensure CORS allows credentials:

```go
// In simple-idm backend
r.Use(cors.Handler(cors.Options{
  AllowedOrigins:   []string{"http://localhost:3000"},
  AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
  AllowedHeaders:   []string{"Accept", "Content-Type"},
  AllowCredentials: true,  // CRITICAL for cookies
}))
```

## Requirements

- **Backend**: [simple-idm](https://github.com/tendant/simple-idm) running (default: http://localhost:4000)
- **SolidJS**: ^1.8.0
- **Tailwind CSS**: ^4.0.0 (with @tailwindcss/vite)

## Examples

See the [examples directory](./examples/) for:
- SolidStart full application
- SolidJS SPA

## Development

```bash
# Clone repository
git clone https://github.com/tendant/simple-idm-solid.git
cd simple-idm-solid

# Install dependencies
npm install

# Build library
npm run build

# Type check
npm run typecheck
```

## License

MIT © Lei Wang

## Links

- [simple-idm Backend](https://github.com/tendant/simple-idm)
- [Documentation](./IMPLEMENTATION_PLAN.md)
- [Issues](https://github.com/tendant/simple-idm-solid/issues)

---

**Built with [Claude Code](https://claude.ai/code) via [Happy](https://happy.engineering)**
