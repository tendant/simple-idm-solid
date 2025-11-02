# simple-idm-solid Implementation Plan

## Overview

Build a reusable SolidJS component library that provides authentication UI components designed to integrate seamlessly with the `simple-idm/cmd/quick` backend (Quick IDM Service).

**Key Integration Point**: Quick IDM uses **HTTP-only cookies** for JWT token storage (not localStorage). This means:
- Access tokens and refresh tokens are automatically sent via cookies
- No client-side token storage required
- CSRF protection should be considered
- Components don't need to manage tokens directly

## Project Goals

- **Lightweight**: <50KB gzipped
- **Type-safe**: Full TypeScript support
- **Accessible**: WCAG AA compliant
- **Customizable**: Multiple theming options
- **Zero-config**: Works with quick IDM out of the box
- **Framework agnostic**: Usable in SolidStart, SolidJS, Astro

## Quick IDM Backend Integration

### Authentication Endpoints

**Public endpoints** (no authentication required):
- `POST /api/idm/auth/login` - Password login
- `POST /api/idm/auth/magic-link/email` - Request magic link
- `GET /api/idm/auth/magic-link/validate?token=<token>` - Validate magic link
- `POST /api/idm/auth/token/refresh` - Refresh access token
- `POST /api/idm/auth/logout` - Logout

**Signup endpoints** (public):
- `POST /api/idm/signup/passwordless` - Passwordless registration
- `POST /api/idm/signup/register` - Password registration

**Protected endpoints** (require JWT in HTTP-only cookie):
- `GET /me` - Get current user information

### Token Flow

1. **Login Success**: Server sets HTTP-only cookies (`access_token`, `refresh_token`)
2. **Subsequent Requests**: Browser automatically includes cookies
3. **Token Refresh**: Client calls refresh endpoint when access token expires
4. **Logout**: Server clears cookies

### Configuration from quick IDM

```env
BASE_URL=http://localhost:4000          # Backend API base
FRONTEND_URL=http://localhost:3000      # Frontend app URL
JWT_ISSUER=http://localhost:4000
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=24h
TEMP_TOKEN_EXPIRY=10m
COOKIE_SECURE=false                     # Set true for HTTPS
COOKIE_HTTP_ONLY=true                   # Always true
REGISTRATION_ENABLED=true
REGISTRATION_DEFAULT_ROLE=user
MAGIC_LINK_EXPIRATION=1h
```

## Implementation Plan

### Phase 1: Project Foundation

#### Task 1: Set up project structure
```
simple-idm-solid/
├── src/
│   ├── components/       # Auth components
│   ├── primitives/       # UI primitives
│   ├── api/             # API client
│   ├── hooks/           # Reusable hooks
│   ├── utils/           # Utilities
│   ├── types/           # TypeScript types
│   ├── styles/          # Default styles
│   └── index.ts         # Main export
├── examples/
│   ├── solidstart/      # SolidStart example
│   └── solidjs/         # SolidJS SPA example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── README.md
└── IMPLEMENTATION_PLAN.md (this file)
```

#### Task 2: Create package.json
```json
{
  "name": "@tendant/simple-idm-solid",
  "version": "0.1.0",
  "description": "SolidJS authentication components for simple-idm",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "solid": "./dist/index.jsx",
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/styles/default.css"
  },
  "files": ["dist"],
  "scripts": {
    "dev": "vite",
    "build": "vite build && tsc --emitDeclarationOnly",
    "preview": "vite preview"
  },
  "peerDependencies": {
    "solid-js": "^1.8.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vite-plugin-solid": "^2.11.0"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "keywords": [
    "solidjs",
    "authentication",
    "login",
    "idm",
    "oidc",
    "oauth2",
    "components"
  ],
  "license": "MIT"
}
```

#### Task 3: TypeScript configuration
- Strict mode enabled
- ESM module resolution
- JSX preserve for SolidJS
- Declaration files generation

#### Task 4: Vite build configuration
- Library mode
- Multiple entry points
- CSS extraction
- Tree-shaking enabled
- Source maps

### Phase 2: API Client Layer

#### Task 5: Create API types

**File**: `src/types/api.ts`

```typescript
// Login
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: 'success' | '2fa_required' | 'multiple_users';
  user_uuid?: string;
  username?: string;
  access_token?: string;  // Note: Also set in HTTP-only cookie
  refresh_token?: string; // Note: Also set in HTTP-only cookie
  temp_token?: string;    // For 2FA flow continuation
  message?: string;
}

// Magic Link
export interface MagicLinkRequest {
  username: string;  // Can be username or email
}

export interface MagicLinkResponse {
  message: string;
}

export interface MagicLinkValidateResponse {
  status: 'success';
  user_uuid: string;
  username: string;
  access_token: string;
  refresh_token: string;
}

// Signup
export interface PasswordlessSignupRequest {
  email: string;
  username?: string;
  fullname?: string;
  invitation_code?: string;
}

export interface PasswordSignupRequest {
  username: string;
  email: string;
  password: string;
  fullname?: string;
  invitation_code?: string;
}

export interface SignupResponse {
  user_id: string;
  message: string;
}

// User
export interface UserInfo {
  user_uuid: string;
  username: string;
  email?: string;
  fullname?: string;
  roles?: string[];
}

// Token
export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
}

// Error
export interface ApiError {
  message: string;
  status?: number;
}
```

#### Task 6: Implement API client

**File**: `src/api/client.ts`

**Key Points**:
- **No manual token management** - tokens in HTTP-only cookies
- `credentials: 'include'` for cookie support
- Error handling with proper types
- Configurable base URL

```typescript
export interface ApiClientConfig {
  baseUrl: string;
  fetch?: typeof fetch;
  onUnauthorized?: () => void;
  onError?: (error: ApiError) => void;
}

export class SimpleIdmClient {
  private baseUrl: string;
  private fetchFn: typeof fetch;
  private onUnauthorized?: () => void;
  private onError?: (error: ApiError) => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchFn = config.fetch || fetch;
    this.onUnauthorized = config.onUnauthorized;
    this.onError = config.onError;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse>
  async requestMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse>
  async validateMagicLink(token: string): Promise<MagicLinkValidateResponse>
  async refreshToken(): Promise<TokenRefreshResponse>
  async logout(): Promise<void>

  // Registration
  async signupPasswordless(data: PasswordlessSignupRequest): Promise<SignupResponse>
  async signupWithPassword(data: PasswordSignupRequest): Promise<SignupResponse>

  // User
  async getCurrentUser(): Promise<UserInfo>

  // Private helper
  private async request(endpoint: string, options?: RequestInit): Promise<Response> {
    // Always include credentials for cookies
    const response = await this.fetchFn(`${this.baseUrl}${endpoint}`, {
      ...options,
      credentials: 'include',  // CRITICAL: Include HTTP-only cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (response.status === 401) {
      this.onUnauthorized?.();
    }

    return response;
  }
}
```

### Phase 3: Primitive Components

#### Task 7: Build UI primitives

**Components to build**:

1. **Input** (`src/primitives/Input/Input.tsx`)
   - Text, password, email variants
   - Error state styling
   - Accessibility (labels, aria-invalid)
   - Tailwind customization

2. **Button** (`src/primitives/Button/Button.tsx`)
   - Primary, secondary variants
   - Loading state with spinner
   - Disabled state
   - Full-width option

3. **Alert** (`src/primitives/Alert/Alert.tsx`)
   - Success, error, warning, info variants
   - Dismissible option
   - Icon support

4. **Card** (`src/primitives/Card/Card.tsx`)
   - Container for forms
   - Header, body, footer sections

5. **Label** (`src/primitives/Label/Label.tsx`)
   - Accessible form labels
   - Required indicator

**Design Principles**:
- Minimal default styling
- Tailwind-first (use `cn()` utility from clsx + tailwind-merge)
- Fully accessible (ARIA attributes)
- TypeScript prop types

### Phase 4: Hooks

#### Task 8: Create useForm hook

**File**: `src/hooks/useForm.ts`

```typescript
export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const [values, setValues] = createStore(options.initialValues);
  const [errors, setErrors] = createStore<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = createStore<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  // Methods: handleChange, handleBlur, handleSubmit, reset, setFieldValue
}
```

#### Task 9: Create useAuth hook

**File**: `src/hooks/useAuth.ts`

**Important**: Since tokens are in HTTP-only cookies, this hook focuses on:
- User state (not tokens)
- Login/logout actions
- Loading states
- Error handling

```typescript
export interface UseAuthOptions {
  client: SimpleIdmClient;
  onLoginSuccess?: (user: UserInfo) => void;
  onLogoutSuccess?: () => void;
}

export function useAuth(options: UseAuthOptions) {
  const [user, setUser] = createSignal<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Check auth status on mount (call /me endpoint)
  onMount(async () => {
    try {
      const userInfo = await options.client.getCurrentUser();
      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (err) {
      // Not authenticated - this is OK
      setIsAuthenticated(false);
    }
  });

  const login = async (credentials: LoginRequest) => { /* ... */ };
  const logout = async () => { /* ... */ };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
```

### Phase 5: Authentication Components

#### Task 10: LoginForm component

**File**: `src/components/LoginForm/LoginForm.tsx`

**Props**:
```typescript
export interface LoginFormProps {
  apiBaseUrl: string;
  onSuccess?: (response: LoginResponse) => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
  showMagicLinkOption?: boolean;
  className?: string;
  theme?: ThemeConfig;
}
```

**Features**:
- Username and password inputs
- Form validation
- Loading state during submission
- Error display (from API)
- Success handling
- Optional link to magic link login
- Responsive design

**Implementation Notes**:
- Use useForm hook for state management
- Use SimpleIdmClient for API calls
- Tokens automatically stored in cookies by browser
- On success, can redirect or call callback

#### Task 11: MagicLinkForm component

**File**: `src/components/MagicLinkForm/MagicLinkForm.tsx`

**Props**:
```typescript
export interface MagicLinkFormProps {
  apiBaseUrl: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  theme?: ThemeConfig;
}
```

**Features**:
- Single input for username/email
- Request magic link button
- Success message with instructions
- Resend option with cooldown timer
- Error display

#### Task 12: MagicLinkValidate component

**File**: `src/components/MagicLinkValidate/MagicLinkValidate.tsx`

**Props**:
```typescript
export interface MagicLinkValidateProps {
  apiBaseUrl: string;
  token: string;  // From URL parameter
  onSuccess?: (response: MagicLinkValidateResponse) => void;
  onError?: (error: string) => void;
  autoValidate?: boolean;  // Default: true
  redirectUrl?: string;
  className?: string;
}
```

**Features**:
- Auto-validate on mount (if autoValidate=true)
- Loading spinner during validation
- Success message with redirect
- Error display for invalid/expired tokens
- Retry option

#### Task 13: RegistrationForm (Passwordless)

**File**: `src/components/RegistrationForm/PasswordlessRegistrationForm.tsx`

**Props**:
```typescript
export interface PasswordlessRegistrationFormProps {
  apiBaseUrl: string;
  onSuccess?: (response: SignupResponse) => void;
  onError?: (error: string) => void;
  requireInvitationCode?: boolean;
  showLoginLink?: boolean;
  className?: string;
  theme?: ThemeConfig;
}
```

**Features**:
- Email input (required)
- Username input (optional)
- Full name input (optional)
- Invitation code input (conditional)
- Email validation
- Success message
- Link to login page

#### Task 14: RegistrationForm (Password)

**File**: `src/components/RegistrationForm/PasswordRegistrationForm.tsx`

**Additional Features** (vs passwordless):
- Password input with strength indicator
- Confirm password input
- Password policy display
- Real-time validation

### Phase 6: Styling & Theming

#### Task 15: Default Tailwind styling

**File**: `src/styles/default.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Component-specific base styles */
@layer components {
  .idm-form-container {
    @apply min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8;
  }

  .idm-form-card {
    @apply bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10;
  }

  .idm-input {
    @apply appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }

  .idm-input-error {
    @apply border-red-500 focus:ring-red-500 focus:border-red-500;
  }

  .idm-button-primary {
    @apply w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .idm-alert-error {
    @apply rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800;
  }

  .idm-alert-success {
    @apply rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800;
  }
}
```

#### Task 16: Theme system

**File**: `src/types/theme.ts`

```typescript
export interface ThemeConfig {
  colors?: {
    primary?: string;
    error?: string;
    success?: string;
    warning?: string;
  };
  radius?: 'square' | 'rounded' | 'pill';
  spacing?: 'compact' | 'comfortable' | 'spacious';
}
```

**CSS Variables approach**:
```css
:root {
  --idm-color-primary: #3B82F6;
  --idm-color-error: #EF4444;
  --idm-color-success: #10B981;
  --idm-radius: 0.5rem;
  --idm-spacing: 1rem;
}
```

### Phase 7: Package Exports

#### Task 17: Main library exports

**File**: `src/index.ts`

```typescript
// Components
export { LoginForm } from './components/LoginForm';
export type { LoginFormProps } from './components/LoginForm';

export { MagicLinkForm } from './components/MagicLinkForm';
export type { MagicLinkFormProps } from './components/MagicLinkForm';

export { MagicLinkValidate } from './components/MagicLinkValidate';
export type { MagicLinkValidateProps } from './components/MagicLinkValidate';

export { PasswordlessRegistrationForm } from './components/RegistrationForm/PasswordlessRegistrationForm';
export type { PasswordlessRegistrationFormProps } from './components/RegistrationForm/PasswordlessRegistrationForm';

export { PasswordRegistrationForm } from './components/RegistrationForm/PasswordRegistrationForm';
export type { PasswordRegistrationFormProps } from './components/RegistrationForm/PasswordRegistrationForm';

// Primitives (optional export for customization)
export { Input } from './primitives/Input';
export { Button } from './primitives/Button';
export { Alert } from './primitives/Alert';
export { Card } from './primitives/Card';
export { Label } from './primitives/Label';

// API Client
export { SimpleIdmClient } from './api/client';
export type { ApiClientConfig } from './api/client';

// Hooks
export { useAuth } from './hooks/useAuth';
export type { UseAuthOptions } from './hooks/useAuth';

export { useForm } from './hooks/useForm';
export type { UseFormOptions } from './hooks/useForm';

// Types
export * from './types/api';
export * from './types/theme';
```

### Phase 8: Documentation

#### Task 18: README.md

**File**: `README.md`

Contents:
- Quick start guide
- Installation instructions
- Basic usage examples
- Component API reference
- Customization guide
- Integration with quick IDM
- Important: JWT cookie authentication note
- Examples for SolidStart and SolidJS

### Phase 9: Examples

#### Task 19: SolidStart example

**File**: `examples/solidstart/`

Create a complete SolidStart application demonstrating:
- Login page with LoginForm
- Magic link login page
- Registration page
- Protected routes
- User dashboard showing current user (from /me endpoint)
- Logout functionality

**Key files**:
- `src/routes/login.tsx` - Login page
- `src/routes/register.tsx` - Registration page
- `src/routes/magic-link.tsx` - Magic link request
- `src/routes/magic-link/validate.tsx` - Magic link validation
- `src/routes/dashboard.tsx` - Protected page
- `src/lib/auth.ts` - Auth setup with SimpleIdmClient

**Environment setup**:
```env
VITE_IDM_BASE_URL=http://localhost:4000
```

### Phase 10: Testing

#### Task 20: Integration testing

**Test scenarios**:
1. Login with valid credentials
2. Login with invalid credentials
3. Request magic link
4. Validate magic link (valid token)
5. Validate magic link (expired token)
6. Passwordless registration
7. Password registration
8. Token refresh flow
9. Logout
10. Protected route access (with/without auth)

**Testing approach**:
- Start quick IDM backend
- Run example app
- Manual testing of all flows
- Verify cookies are set correctly
- Verify token refresh works
- Verify logout clears cookies

## Critical Implementation Notes

### 1. Cookie-based Authentication

**CRITICAL**: Quick IDM uses HTTP-only cookies for JWT storage.

**Implications**:
- ✅ No manual token storage in components
- ✅ Tokens automatically included in requests (via `credentials: 'include'`)
- ✅ More secure (XSS protection)
- ❌ Requires CORS configuration (same-origin or proper CORS headers)
- ❌ Cannot read tokens in JavaScript (by design)

**API Client Configuration**:
```typescript
const client = new SimpleIdmClient({
  baseUrl: 'http://localhost:4000',
  // Will use fetch with credentials: 'include'
});
```

**Important for CORS**:
When frontend and backend are on different origins:
```go
// In quick IDM, may need to add CORS middleware
r.Use(cors.Handler(cors.Options{
  AllowedOrigins:   []string{"http://localhost:3000"},
  AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
  AllowedHeaders:   []string{"Accept", "Content-Type"},
  AllowCredentials: true,  // CRITICAL for cookies
}))
```

### 2. Token Refresh

Components don't need to handle refresh directly:
- Browser includes refresh token in cookie
- Call `/api/idm/auth/token/refresh` when access token expires
- Server issues new tokens and sets cookies
- Optional: Implement automatic retry on 401

### 3. Authentication State

Since tokens are opaque (HTTP-only cookies):
- Check auth status by calling `GET /me`
- On success → user is authenticated
- On 401 → user is not authenticated
- Store user info in component state (not tokens)

### 4. Logout Flow

```typescript
const logout = async () => {
  await client.logout();  // Server clears cookies
  setUser(null);
  setIsAuthenticated(false);
  navigate('/login');
};
```

### 5. Development Setup

For local development with quick IDM:
1. Start quick IDM: `cd simple-idm/cmd/quick && go run main.go`
2. Backend runs on `http://localhost:4000`
3. Frontend runs on `http://localhost:3000` (or configured port)
4. Ensure CORS allows credentials

## Success Criteria

- ✅ All components integrate with quick IDM endpoints
- ✅ HTTP-only cookie authentication works correctly
- ✅ Token refresh flow implemented
- ✅ Full TypeScript coverage
- ✅ Accessible components (WCAG AA)
- ✅ Package size <50KB gzipped
- ✅ Working SolidStart example
- ✅ Comprehensive documentation
- ✅ MIT licensed

## Future Enhancements (Post-MVP)

- Password reset flow components
- 2FA challenge component (if quick IDM adds support)
- Email verification component
- User profile component
- Social login buttons (if quick IDM adds providers)
- i18n support
- Dark mode theming
- Component storybook
- Unit tests with Vitest
- E2E tests with Playwright

## Timeline

- **Week 1**: Phase 1-2 (Foundation + API)
- **Week 2**: Phase 3-4 (Primitives + Hooks)
- **Week 3**: Phase 5 (Auth Components)
- **Week 4**: Phase 6-7 (Styling + Exports)
- **Week 5**: Phase 8-10 (Docs + Examples + Testing)

**Total**: ~5 weeks to MVP

---

**Document Version**: 1.0
**Last Updated**: 2025-11-02
**Author**: Claude Code via Happy
