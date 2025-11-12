/**
 * CustomResetPassword - Example custom UI using useResetPassword hook
 *
 * This demonstrates how to build a completely custom password reset form
 * using the headless useResetPassword hook with password strength validation.
 */

import { Component, Show, createMemo } from 'solid-js';
import { useResetPassword } from '@tendant/simple-idm-solid';

// Mock URL parameter extraction (in real app, use @solidjs/router)
const getTokenFromUrl = (): string | undefined => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || undefined;
  }
  return undefined;
};

/**
 * Example 1: Basic Reset Password Form
 */
export const BasicResetPassword: Component = () => {
  const resetPassword = useResetPassword({
    client: 'http://localhost:4000',
    initialToken: getTokenFromUrl(),
    autoLoadPolicy: true,
    onSuccess: (response) => {
      console.log('Password reset successfully!', response);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    },
    onError: (error) => {
      console.error('Password reset failed:', error);
    },
  });

  return (
    <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-4">Reset Your Password</h1>

      <Show when={resetPassword.success()}>
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 class="text-xl font-semibold mb-2">Password Reset!</h2>
          <p class="text-gray-600 mb-4">{resetPassword.success()}</p>
          <p class="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </Show>

      <Show when={!resetPassword.success()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resetPassword.submit();
          }}
          class="space-y-4"
        >
          {/* Token Input (if not in URL) */}
          <Show when={!getTokenFromUrl()}>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
              <input
                type="text"
                value={resetPassword.token()}
                onInput={(e) => resetPassword.setToken(e.currentTarget.value)}
                placeholder="Paste token from email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </Show>

          {/* New Password */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={resetPassword.newPassword()}
              onInput={(e) => resetPassword.setNewPassword(e.currentTarget.value)}
              placeholder="Enter new password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={resetPassword.isLoading()}
            />

            {/* Password Strength Indicator */}
            <Show when={resetPassword.newPassword().length > 0}>
              <div class="mt-2">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-600">Strength:</span>
                  <span class={resetPassword.passwordStrength().color}>
                    {resetPassword.passwordStrength().label}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class={`h-2 rounded-full transition-all duration-300 ${
                      resetPassword.passwordStrength().level === 'strong'
                        ? 'bg-green-600'
                        : resetPassword.passwordStrength().level === 'good'
                          ? 'bg-blue-600'
                          : resetPassword.passwordStrength().level === 'fair'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                    }`}
                    style={{ width: `${resetPassword.passwordStrength().percentage}%` }}
                  />
                </div>
              </div>
            </Show>
          </div>

          {/* Confirm Password */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={resetPassword.confirmPassword()}
              onInput={(e) => resetPassword.setConfirmPassword(e.currentTarget.value)}
              placeholder="Confirm new password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={resetPassword.isLoading()}
            />

            <Show when={resetPassword.confirmPassword().length > 0}>
              <p
                class={`text-xs mt-1 ${resetPassword.passwordsMatch() ? 'text-green-600' : 'text-red-600'}`}
              >
                {resetPassword.passwordsMatch() ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            </Show>
          </div>

          {/* Error Message */}
          <Show when={resetPassword.error()}>
            <div class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {resetPassword.error()}
            </div>
          </Show>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!resetPassword.canSubmit() || resetPassword.isLoading()}
            class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetPassword.isLoading() ? 'Resetting Password...' : 'Reset Password'}
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
 * Example 2: Advanced Reset Password with Policy Display
 */
export const AdvancedResetPassword: Component = () => {
  const resetPassword = useResetPassword({
    client: 'http://localhost:4000',
    initialToken: getTokenFromUrl(),
    autoLoadPolicy: true,
  });

  // Check individual policy requirements
  const policyChecks = createMemo(() => {
    const pwd = resetPassword.newPassword();
    const policy = resetPassword.policy();

    if (!policy || !pwd) return null;

    return {
      length: {
        met: pwd.length >= policy.min_length,
        label: `At least ${policy.min_length} characters`,
      },
      uppercase: {
        met: !policy.require_uppercase || /[A-Z]/.test(pwd),
        label: 'One uppercase letter',
        required: policy.require_uppercase,
      },
      lowercase: {
        met: !policy.require_lowercase || /[a-z]/.test(pwd),
        label: 'One lowercase letter',
        required: policy.require_lowercase,
      },
      digit: {
        met: !policy.require_digit || /\d/.test(pwd),
        label: 'One number',
        required: policy.require_digit,
      },
      special: {
        met: !policy.require_special_char || /[^A-Za-z0-9]/.test(pwd),
        label: 'One special character',
        required: policy.require_special_char,
      },
    };
  });

  return (
    <div class="max-w-2xl mx-auto p-6">
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
          <h1 class="text-3xl font-bold">Reset Your Password</h1>
          <p class="text-blue-100 mt-2">Create a strong, secure password</p>
        </div>

        <div class="p-6">
          <Show
            when={!resetPassword.success()}
            fallback={
              <div class="text-center py-12">
                <div class="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <svg
                    class="w-12 h-12 text-green-600"
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
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
                <p class="text-gray-600 mb-6">{resetPassword.success()}</p>
                <a
                  href="/login"
                  class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue to Login
                </a>
              </div>
            }
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                resetPassword.submit();
              }}
              class="space-y-6"
            >
              {/* Token (if needed) */}
              <Show when={!getTokenFromUrl()}>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={resetPassword.token()}
                    onInput={(e) => resetPassword.setToken(e.currentTarget.value)}
                    placeholder="Paste token from your email"
                    class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </Show>

              <div class="grid md:grid-cols-2 gap-6">
                {/* New Password Column */}
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={resetPassword.newPassword()}
                      onInput={(e) => resetPassword.setNewPassword(e.currentTarget.value)}
                      placeholder="Enter new password"
                      class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Password Strength */}
                  <Show when={resetPassword.newPassword().length > 0}>
                    <div class="p-4 bg-gray-50 rounded-lg">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700">Password Strength</span>
                        <span
                          class={`text-sm font-bold ${resetPassword.passwordStrength().color}`}
                        >
                          {resetPassword.passwordStrength().label}
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-3">
                        <div
                          class={`h-3 rounded-full transition-all duration-300 ${
                            resetPassword.passwordStrength().level === 'strong'
                              ? 'bg-green-500'
                              : resetPassword.passwordStrength().level === 'good'
                                ? 'bg-blue-500'
                                : resetPassword.passwordStrength().level === 'fair'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                          }`}
                          style={{ width: `${resetPassword.passwordStrength().percentage}%` }}
                        />
                      </div>
                    </div>
                  </Show>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={resetPassword.confirmPassword()}
                      onInput={(e) => resetPassword.setConfirmPassword(e.currentTarget.value)}
                      placeholder="Confirm new password"
                      class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    <Show when={resetPassword.confirmPassword().length > 0}>
                      <p
                        class={`text-sm mt-2 font-medium ${
                          resetPassword.passwordsMatch() ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {resetPassword.passwordsMatch()
                          ? '✓ Passwords match'
                          : '✗ Passwords do not match'}
                      </p>
                    </Show>
                  </div>
                </div>

                {/* Policy Requirements Column */}
                <div>
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">Password Requirements</h3>
                  <Show when={policyChecks()}>
                    <ul class="space-y-2">
                      {Object.entries(policyChecks()!).map(([key, check]) => (
                        <Show when={check.required !== false}>
                          <li class="flex items-start">
                            <span
                              class={`inline-block w-5 h-5 rounded-full mr-2 flex-shrink-0 ${
                                check.met ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <Show when={check.met}>
                                <svg
                                  class="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="3"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </Show>
                            </span>
                            <span
                              class={`text-sm ${check.met ? 'text-gray-900 font-medium' : 'text-gray-600'}`}
                            >
                              {check.label}
                            </span>
                          </li>
                        </Show>
                      ))}
                    </ul>
                  </Show>

                  <Show when={!resetPassword.policy()}>
                    <p class="text-sm text-gray-500 italic">Loading policy...</p>
                  </Show>
                </div>
              </div>

              {/* Error */}
              <Show when={resetPassword.error()}>
                <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p class="text-red-700 font-medium">{resetPassword.error()}</p>
                </div>
              </Show>

              {/* Submit */}
              <button
                type="submit"
                disabled={!resetPassword.canSubmit() || resetPassword.isLoading()}
                class="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {resetPassword.isLoading() ? (
                  <span class="flex items-center justify-center">
                    <svg
                      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </Show>

          <div class="mt-6 text-center">
            <a href="/login" class="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 3: Minimal Reset Password (for embedding)
 */
export const MinimalResetPassword: Component = () => {
  const rp = useResetPassword({
    client: 'http://localhost:4000',
    initialToken: getTokenFromUrl(),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        rp.submit();
      }}
      class="space-y-3"
    >
      <input
        type="password"
        value={rp.newPassword()}
        onInput={(e) => rp.setNewPassword(e.currentTarget.value)}
        placeholder="New password"
        class="w-full px-3 py-2 border rounded"
      />
      <input
        type="password"
        value={rp.confirmPassword()}
        onInput={(e) => rp.setConfirmPassword(e.currentTarget.value)}
        placeholder="Confirm password"
        class="w-full px-3 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={!rp.canSubmit()}
        class="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Reset
      </button>
      {rp.error() && <p class="text-red-600 text-sm">{rp.error()}</p>}
      {rp.success() && <p class="text-green-600 text-sm">{rp.success()}</p>}
    </form>
  );
};
