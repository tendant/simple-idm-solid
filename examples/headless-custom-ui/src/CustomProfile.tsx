/**
 * Custom Profile Management Example
 *
 * Demonstrates how to use the useProfile headless hook to build
 * a completely custom profile management UI.
 */

import { useProfile } from '@tendant/simple-idm-solid';
import { Show, createSignal } from 'solid-js';
import './custom-profile.css';

export function CustomProfile() {
  const profile = useProfile({
    client: 'http://localhost:4000',
    onSuccess: (response, operation) => {
      console.log(`${operation} updated successfully!`, response);
    },
    onError: (error, operation) => {
      console.error(`${operation} update failed:`, error);
    },
  });

  const [activeTab, setActiveTab] = createSignal<'username' | 'phone' | 'password'>('username');

  return (
    <div class="custom-profile">
      <div class="profile-header">
        <h2>Profile Settings</h2>
        <p>Manage your account settings and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div class="tabs">
        <button
          class={activeTab() === 'username' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('username')}
        >
          Username
        </button>
        <button
          class={activeTab() === 'phone' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('phone')}
        >
          Phone
        </button>
        <button
          class={activeTab() === 'password' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
      </div>

      {/* Global Messages */}
      <Show when={profile.success()}>
        <div class="alert success">
          <span class="icon">✓</span>
          {profile.success()}
          <button class="close" onClick={() => profile.clearSuccess()}>×</button>
        </div>
      </Show>

      <Show when={profile.error()}>
        <div class="alert error">
          <span class="icon">✗</span>
          {profile.error()}
          <button class="close" onClick={() => profile.clearError()}>×</button>
        </div>
      </Show>

      {/* Username Tab */}
      <Show when={activeTab() === 'username'}>
        <form
          class="profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            profile.updateUsername();
          }}
        >
          <div class="form-group">
            <label for="new-username">New Username</label>
            <input
              id="new-username"
              type="text"
              value={profile.username()}
              onInput={(e) => profile.setUsername(e.currentTarget.value)}
              placeholder="Enter new username"
              class="input"
            />
          </div>

          <div class="form-group">
            <label for="username-password">Current Password</label>
            <input
              id="username-password"
              type="password"
              value={profile.usernameCurrentPassword()}
              onInput={(e) => profile.setUsernameCurrentPassword(e.currentTarget.value)}
              placeholder="Verify with current password"
              class="input"
            />
            <p class="help-text">Required for verification</p>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            disabled={!profile.canSubmitUsername() || profile.isLoading()}
          >
            {profile.isLoading() && profile.currentOperation() === 'username' ? (
              <span class="loading">Updating...</span>
            ) : (
              'Update Username'
            )}
          </button>
        </form>
      </Show>

      {/* Phone Tab */}
      <Show when={activeTab() === 'phone'}>
        <form
          class="profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            profile.updatePhone();
          }}
        >
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={profile.phone()}
              onInput={(e) => profile.setPhone(e.currentTarget.value)}
              placeholder="+1 (555) 123-4567"
              class="input"
            />
            <p class="help-text">Include country code</p>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            disabled={!profile.canSubmitPhone() || profile.isLoading()}
          >
            {profile.isLoading() && profile.currentOperation() === 'phone' ? (
              <span class="loading">Updating...</span>
            ) : (
              'Update Phone'
            )}
          </button>
        </form>
      </Show>

      {/* Password Tab */}
      <Show when={activeTab() === 'password'}>
        <form
          class="profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            profile.updatePassword();
          }}
        >
          <div class="form-group">
            <label for="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={profile.currentPassword()}
              onInput={(e) => profile.setCurrentPassword(e.currentTarget.value)}
              placeholder="Enter current password"
              class="input"
            />
          </div>

          <div class="form-group">
            <label for="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={profile.newPassword()}
              onInput={(e) => profile.setNewPassword(e.currentTarget.value)}
              placeholder="Enter new password"
              class="input"
            />

            {/* Password Strength Indicator */}
            <Show when={profile.newPassword()}>
              <div class="password-strength">
                <div class="strength-bar">
                  <div
                    class={`strength-fill ${profile.passwordStrength().level}`}
                    style={{ width: `${profile.passwordStrength().percentage}%` }}
                  />
                </div>
                <span class="strength-text">{profile.passwordStrength().text}</span>
              </div>
            </Show>
          </div>

          <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={profile.confirmNewPassword()}
              onInput={(e) => profile.setConfirmNewPassword(e.currentTarget.value)}
              placeholder="Confirm new password"
              class={`input ${!profile.passwordsMatch() && profile.confirmNewPassword() ? 'error' : ''}`}
            />

            <Show when={!profile.passwordsMatch() && profile.confirmNewPassword()}>
              <p class="error-text">Passwords do not match</p>
            </Show>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            disabled={!profile.canSubmitPassword() || profile.isLoading()}
          >
            {profile.isLoading() && profile.currentOperation() === 'password' ? (
              <span class="loading">Updating...</span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </Show>
    </div>
  );
}
