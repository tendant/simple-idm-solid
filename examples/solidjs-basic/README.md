# Simple IDM Solid - Basic Example

This is a complete example application demonstrating how to use `@tendant/simple-idm-solid` in a SolidJS application with routing and authentication.

## Features Demonstrated

This example showcases:

- ✅ **LoginForm** - Username/password authentication with HTTP-only cookies
- ✅ **MagicLinkForm** - Passwordless login via email magic links
- ✅ **MagicLinkValidate** - Validating magic link tokens from emails
- ✅ **PasswordlessRegistrationForm** - User registration without passwords
- ✅ **PasswordRegistrationForm** - Traditional registration with passwords
- ✅ **useAuth Hook** - Managing authentication state throughout the app
- ✅ **Protected Routes** - Securing pages that require authentication
- ✅ **API Client** - Direct usage of SimpleIdmClient for custom logic
- ✅ **SolidJS Router** - Integration with @solidjs/router

## Prerequisites

Before running this example, you need:

1. **Node.js** (v18 or higher)
2. **simple-idm backend** running (see [simple-idm repository](https://github.com/tendant/simple-idm))

### Setting up simple-idm backend

```bash
# Clone and run simple-idm (Go backend)
git clone https://github.com/tendant/simple-idm.git
cd simple-idm

# Follow the setup instructions in the simple-idm README
# By default, it runs on http://localhost:4000
```

Make sure your simple-idm backend has CORS configured properly:

```go
// In simple-idm backend
r.Use(cors.Handler(cors.Options{
  AllowedOrigins:   []string{"http://localhost:3000"},
  AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
  AllowedHeaders:   []string{"Accept", "Content-Type"},
  AllowCredentials: true,  // CRITICAL for HTTP-only cookies
}))
```

## Installation

```bash
# Navigate to this example directory
cd examples/solidjs-basic

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

## Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` to point to your simple-idm backend:

```env
VITE_API_URL=http://localhost:4000
```

## Running the Example

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── AuthProvider.tsx      # Auth context provider using useAuth hook
│   ├── ProtectedRoute.tsx    # HOC for protected routes
│   └── Layout.tsx             # Simple layout wrapper
├── pages/
│   ├── LoginPage.tsx          # Login with username/password
│   ├── MagicLinkPage.tsx      # Request magic link
│   ├── MagicLinkValidatePage.tsx  # Validate magic link token
│   ├── RegisterPage.tsx       # Passwordless registration
│   ├── RegisterPasswordPage.tsx   # Password registration
│   └── DashboardPage.tsx      # Protected dashboard page
├── App.tsx                    # Main app with routing
├── index.tsx                  # Entry point
└── styles.css                 # Global styles with theme customization
```

## Key Implementation Details

### 1. Authentication Context (AuthProvider.tsx)

The `AuthProvider` component wraps the entire app and provides authentication state using the `useAuth` hook:

```tsx
const client = new SimpleIdmClient({
  baseUrl: props.apiBaseUrl,
  onUnauthorized: () => {
    window.location.href = '/login';
  },
});

const auth = useAuth({
  client,
  checkAuthOnMount: true,
  onLoginSuccess: (user) => console.log('Logged in:', user),
  onLogoutSuccess: () => window.location.href = '/login',
});
```

### 2. Protected Routes (ProtectedRoute.tsx)

The `ProtectedRoute` component ensures only authenticated users can access certain pages:

```tsx
export const ProtectedRoute: Component<ProtectedRouteProps> = (props) => {
  const auth = useAuthContext();

  return (
    <Show when={!auth.loading()} fallback={<LoadingSpinner />}>
      <Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
        {props.children}
      </Show>
    </Show>
  );
};
```

### 3. Using Components

Each page demonstrates a different component:

**Login Page:**
```tsx
<LoginForm
  apiBaseUrl={API_BASE_URL}
  onSuccess={(response) => navigate('/dashboard')}
  showMagicLinkOption
  showRegistrationLink
/>
```

**Magic Link Page:**
```tsx
<MagicLinkForm
  apiBaseUrl={API_BASE_URL}
  onSuccess={() => console.log('Check your email!')}
  showPasswordLoginLink
/>
```

**Registration Pages:**
```tsx
// Passwordless
<PasswordlessRegistrationForm
  apiBaseUrl={API_BASE_URL}
  onSuccess={(response) => console.log('Account created!')}
  requireInvitationCode={false}
  showLoginLink
/>

// With Password
<PasswordRegistrationForm
  apiBaseUrl={API_BASE_URL}
  onSuccess={(response) => navigate('/login')}
  requireInvitationCode={false}
  showLoginLink
/>
```

## Testing the Authentication Flow

### Username/Password Flow

1. Navigate to http://localhost:3000/login
2. Enter credentials (or register first at /register-password)
3. Click "Login"
4. You'll be redirected to /dashboard
5. Click "Logout" to end the session

### Magic Link Flow

1. Navigate to http://localhost:3000/magic-link
2. Enter your email address
3. Click "Send Magic Link"
4. Check your email for the magic link
5. Click the link (which goes to /magic-link/validate?token=...)
6. You'll be automatically logged in and redirected to /dashboard

### Protected Routes

1. Try accessing http://localhost:3000/dashboard without logging in
2. You'll be automatically redirected to /login
3. After logging in, you can access /dashboard

## Customization

### Styling

The example includes custom theme variables in `src/styles.css`:

```css
:root {
  --idm-color-primary: #3B82F6;
  --idm-color-error: #EF4444;
  --idm-color-success: #10B981;
  --idm-radius: 0.5rem;
}
```

All components accept a `class` prop for custom Tailwind CSS classes:

```tsx
<LoginForm
  apiBaseUrl={API_BASE_URL}
  class="shadow-2xl"
  onSuccess={handleSuccess}
/>
```

### Custom Authentication Logic

You can use the `SimpleIdmClient` directly for custom implementations:

```tsx
import { SimpleIdmClient } from '@tendant/simple-idm-solid';

const client = new SimpleIdmClient({ baseUrl: 'http://localhost:4000' });

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

## Important Notes

### HTTP-Only Cookies

**simple-idm** uses HTTP-only cookies for JWT tokens (not localStorage):

- ✅ Tokens are automatically sent with requests
- ✅ More secure (XSS protection)
- ✅ No manual token management
- ❌ Requires proper CORS configuration

### CORS Configuration

Make sure your simple-idm backend allows credentials:

```go
AllowCredentials: true  // CRITICAL for cookies to work
```

### Development vs Production

For production deployments:

1. Use HTTPS for both frontend and backend
2. Update `VITE_API_URL` to your production backend URL
3. Configure CORS to allow your production domain
4. Set secure cookie flags in simple-idm backend

## Troubleshooting

### Login not working?

1. Check that simple-idm backend is running on the correct port
2. Verify CORS is configured with `AllowCredentials: true`
3. Check browser console for network errors
4. Ensure you're using the correct credentials

### Cookies not being sent?

1. Make sure frontend and backend are on the same domain OR
2. CORS is properly configured with credentials enabled
3. For cross-origin: Both must use HTTPS (except localhost)

### Protected routes not working?

1. Check that `checkAuthOnMount: true` in `useAuth` config
2. Verify the auth token cookie is being set (check browser DevTools)
3. Ensure `onUnauthorized` callback is configured

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Learn More

- [simple-idm-solid Documentation](../../README.md)
- [simple-idm Backend](https://github.com/tendant/simple-idm)
- [SolidJS Documentation](https://www.solidjs.com/)
- [SolidJS Router](https://github.com/solidjs/solid-router)

## License

MIT
