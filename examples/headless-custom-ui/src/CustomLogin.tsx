import { Component, Show } from 'solid-js';
import { useLogin } from '@tendant/simple-idm-solid';

/**
 * Custom login component using headless useLogin hook
 * with completely custom Tailwind CSS styling
 */
export const CustomLogin: Component = () => {
  const login = useLogin({
    client: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    onSuccess: (response) => {
      console.log('Login successful!', response);
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    login.submit();
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p class="text-gray-600">Sign in to continue to your account</p>
        </div>

        {/* Error Alert */}
        <Show when={login.error()}>
          <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm">{login.error()}</p>
              </div>
            </div>
          </div>
        </Show>

        {/* Success Alert */}
        <Show when={login.success()}>
          <div class="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm">{login.success()}</p>
              </div>
            </div>
          </div>
        </Show>

        {/* Login Form */}
        <form onSubmit={handleSubmit} class="space-y-6">
          {/* Username Field */}
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              value={login.username()}
              onInput={(e) => login.setUsername(e.currentTarget.value)}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              placeholder="Enter your username"
              autocomplete="username"
            />
          </div>

          {/* Password Field */}
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={login.password()}
              onInput={(e) => login.setPassword(e.currentTarget.value)}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!login.canSubmit() || login.isLoading()}
            class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Show
              when={!login.isLoading()}
              fallback={
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              }
            >
              Sign In
            </Show>
          </button>
        </form>

        {/* Links */}
        <div class="mt-6 text-center space-y-2">
          <a href="/magic-link" class="text-sm text-purple-600 hover:text-purple-700 block">
            Login with magic link instead
          </a>
          <p class="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" class="text-purple-600 hover:text-purple-700 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
