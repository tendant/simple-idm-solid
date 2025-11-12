/**
 * CustomForgotPassword - Example custom UI using useForgotPassword hook
 *
 * This demonstrates how to build a completely custom forgot password form
 * using the headless useForgotPassword hook.
 */

import { Component, Show } from 'solid-js';
import { useForgotPassword } from '@tendant/simple-idm-solid';

/**
 * Example 1: Basic Forgot Password Form (Email)
 */
export const BasicForgotPassword: Component = () => {
  const forgotPassword = useForgotPassword({
    client: 'http://localhost:4000',
    method: 'email',
    onSuccess: (response) => {
      console.log('Password reset email sent!', response);
    },
    onError: (error) => {
      console.error('Failed to send reset email:', error);
    },
  });

  return (
    <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-4">Forgot Password</h1>

      <Show when={forgotPassword.success()}>
        <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <p class="text-green-800 font-medium">{forgotPassword.success()}</p>
          <p class="text-green-600 text-sm mt-2">
            Check your email for a password reset link. The link will expire in 24 hours.
          </p>
        </div>
      </Show>

      <Show when={!forgotPassword.success()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            forgotPassword.submit();
          }}
          class="space-y-4"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={forgotPassword.identifier()}
              onInput={(e) => forgotPassword.setIdentifier(e.currentTarget.value)}
              placeholder="you@example.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={forgotPassword.isLoading()}
            />
          </div>

          <Show when={forgotPassword.error()}>
            <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {forgotPassword.error()}
            </div>
          </Show>

          <button
            type="submit"
            disabled={!forgotPassword.canSubmit() || forgotPassword.isLoading()}
            class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {forgotPassword.isLoading() ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </Show>

      <div class="mt-6 text-center">
        <a href="/login" class="text-sm text-blue-600 hover:text-blue-500">
          Back to Login
        </a>
      </div>
    </div>
  );
};

/**
 * Example 2: Forgot Password with Username
 */
export const ForgotPasswordUsername: Component = () => {
  const forgotPassword = useForgotPassword({
    client: 'http://localhost:4000',
    method: 'username',
  });

  return (
    <div class="max-w-md mx-auto p-6">
      <h1 class="text-2xl font-bold mb-4">Reset Password</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          forgotPassword.submit();
        }}
        class="space-y-4"
      >
        <div>
          <label class="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={forgotPassword.identifier()}
            onInput={(e) => forgotPassword.setIdentifier(e.currentTarget.value)}
            placeholder="your-username"
            class="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={!forgotPassword.canSubmit() || forgotPassword.isLoading()}
          class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {forgotPassword.isLoading() ? 'Sending...' : 'Send Reset Link'}
        </button>

        <Show when={forgotPassword.error()}>
          <p class="text-red-600 text-sm">{forgotPassword.error()}</p>
        </Show>

        <Show when={forgotPassword.success()}>
          <p class="text-green-600 text-sm">{forgotPassword.success()}</p>
        </Show>
      </form>
    </div>
  );
};

/**
 * Example 3: Forgot Password with Email or Username (Auto-detect)
 */
export const ForgotPasswordBoth: Component = () => {
  const forgotPassword = useForgotPassword({
    client: 'http://localhost:4000',
    method: 'both', // Auto-detects whether input is email or username
    onSuccess: (response) => {
      console.log('Reset email sent!', response);
    },
  });

  return (
    <div class="max-w-md mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-xl">
      <div class="bg-white p-6 rounded-lg">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        <p class="text-gray-600 text-sm mb-6">
          No worries! Enter your email or username below.
        </p>

        <Show
          when={!forgotPassword.success()}
          fallback={
            <div class="text-center py-8">
              <div class="inline-block p-3 bg-green-100 rounded-full mb-4">
                <svg
                  class="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Email Sent!</h2>
              <p class="text-gray-600">{forgotPassword.success()}</p>
              <a
                href="/login"
                class="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Return to Login
              </a>
            </div>
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              forgotPassword.submit();
            }}
            class="space-y-4"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email or Username
              </label>
              <input
                type="text"
                value={forgotPassword.identifier()}
                onInput={(e) => forgotPassword.setIdentifier(e.currentTarget.value)}
                placeholder="email@example.com or username"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={forgotPassword.isLoading()}
              />
              <p class="text-xs text-gray-500 mt-1">
                We'll automatically detect whether you entered an email or username
              </p>
            </div>

            <Show when={forgotPassword.error()}>
              <div class="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <svg
                  class="w-5 h-5 text-red-600 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p class="text-sm text-red-700">{forgotPassword.error()}</p>
              </div>
            </Show>

            <button
              type="submit"
              disabled={!forgotPassword.canSubmit() || forgotPassword.isLoading()}
              class="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {forgotPassword.isLoading() ? (
                <span class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Remember your password?{' '}
              <a href="/login" class="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </Show>
      </div>
    </div>
  );
};

/**
 * Example 4: Minimal Forgot Password (for embedding)
 */
export const MinimalForgotPassword: Component = () => {
  const fp = useForgotPassword({
    client: 'http://localhost:4000',
    method: 'email',
  });

  return (
    <div class="space-y-3">
      <input
        type="email"
        value={fp.identifier()}
        onInput={(e) => fp.setIdentifier(e.currentTarget.value)}
        placeholder="Enter your email"
        class="w-full px-3 py-2 border rounded"
      />
      <button
        onClick={() => fp.submit()}
        disabled={!fp.canSubmit()}
        class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send Reset Link
      </button>
      {fp.error() && <p class="text-red-600 text-sm">{fp.error()}</p>}
      {fp.success() && <p class="text-green-600 text-sm">{fp.success()}</p>}
    </div>
  );
};
