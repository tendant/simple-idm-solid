/**
 * Custom Email Verification Example
 *
 * Demonstrates how to use the useEmailVerification headless hook to build
 * a completely custom email verification UI.
 */

import { useEmailVerification } from '@tendant/simple-idm-solid';
import { useSearchParams } from '@solidjs/router';
import { Show, onMount } from 'solid-js';
import './custom-email-verification.css';

/**
 * Email Verification Page
 * Automatically verifies email when token is present in URL
 */
export function EmailVerificationPage() {
  const [params] = useSearchParams<{ token?: string }>();

  const emailVerify = useEmailVerification({
    client: 'http://localhost:4000',
    initialToken: params.token,
    autoVerify: !!params.token,
    onSuccess: (response, operation) => {
      console.log(`Email ${operation} successful!`, response);
    },
    onError: (error, operation) => {
      console.error(`Email ${operation} failed:`, error);
    },
  });

  return (
    <div class="email-verification-page">
      <div class="card">
        <div class="card-header">
          <h2>Email Verification</h2>
        </div>

        <div class="card-body">
          {/* Loading State */}
          <Show when={emailVerify.isLoading()}>
            <div class="loading-state">
              <div class="spinner" />
              <p>Verifying your email address...</p>
            </div>
          </Show>

          {/* Success State */}
          <Show when={emailVerify.success()}>
            <div class="success-state">
              <div class="icon success">✓</div>
              <h3>Email Verified!</h3>
              <p>{emailVerify.success()}</p>
              <p class="meta">
                Verified at: {new Date(emailVerify.verifyResponse()?.verified_at || '').toLocaleString()}
              </p>
              <a href="/login" class="btn btn-primary">
                Continue to Login
              </a>
            </div>
          </Show>

          {/* Error State */}
          <Show when={emailVerify.error()}>
            <div class="error-state">
              <div class="icon error">✗</div>
              <h3>Verification Failed</h3>
              <p>{emailVerify.error()}</p>

              <div class="actions">
                <button
                  class="btn btn-primary"
                  onClick={() => emailVerify.resend()}
                  disabled={emailVerify.isLoading()}
                >
                  {emailVerify.isLoading() ? 'Sending...' : 'Resend Verification Email'}
                </button>
                <a href="/login" class="btn btn-link">
                  Back to Login
                </a>
              </div>
            </div>
          </Show>

          {/* Manual Verification (no token in URL) */}
          <Show when={!params.token && !emailVerify.isLoading() && !emailVerify.success()}>
            <div class="manual-verification">
              <p>Enter your verification token:</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  emailVerify.verify();
                }}
              >
                <div class="form-group">
                  <input
                    type="text"
                    value={emailVerify.token()}
                    onInput={(e) => emailVerify.setToken(e.currentTarget.value)}
                    placeholder="Paste your verification token here"
                    class="input"
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={!emailVerify.canVerify()}
                >
                  Verify Email
                </button>
              </form>

              <div class="help-text">
                <p>Didn't receive the email?</p>
                <button
                  class="btn btn-link"
                  onClick={() => emailVerify.resend()}
                >
                  Resend verification email
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

/**
 * Email Verification Status Component
 * Shows current verification status (requires authentication)
 */
export function EmailVerificationStatus() {
  const emailVerify = useEmailVerification({
    client: 'http://localhost:4000',
    autoLoadStatus: true,
  });

  return (
    <div class="email-verification-status">
      {/* Loading */}
      <Show when={emailVerify.isLoading() && !emailVerify.status()}>
        <div class="loading">Loading verification status...</div>
      </Show>

      {/* Verified */}
      <Show when={emailVerify.isVerified()}>
        <div class="status verified">
          <span class="icon">✓</span>
          <div class="content">
            <strong>Email Verified</strong>
            <Show when={emailVerify.verifiedAt()}>
              <p class="meta">
                Verified on: {new Date(emailVerify.verifiedAt()!).toLocaleDateString()}
              </p>
            </Show>
          </div>
        </div>
      </Show>

      {/* Not Verified */}
      <Show when={emailVerify.status() && !emailVerify.isVerified()}>
        <div class="status unverified">
          <span class="icon">⚠</span>
          <div class="content">
            <strong>Email Not Verified</strong>
            <p>Please verify your email address to access all features.</p>
            <button
              class="btn btn-primary btn-sm"
              onClick={() => emailVerify.resend()}
              disabled={emailVerify.isLoading()}
            >
              {emailVerify.isLoading() ? 'Sending...' : 'Send Verification Email'}
            </button>
          </div>
        </div>

        <Show when={emailVerify.success()}>
          <div class="alert success">
            {emailVerify.success()}
          </div>
        </Show>

        <Show when={emailVerify.error()}>
          <div class="alert error">
            {emailVerify.error()}
          </div>
        </Show>
      </Show>
    </div>
  );
}
