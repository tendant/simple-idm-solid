# Password Reset Flow - Testing Guide

This guide provides comprehensive instructions for manually testing the password reset functionality in simple-idm-solid.

## Overview

The password reset flow consists of two main parts:
1. **Forgot Password** - User requests a password reset link
2. **Reset Password** - User resets their password using a token

## Prerequisites

Before testing, ensure:
- ✅ simple-idm backend is running at `http://localhost:4000`
- ✅ Email service is configured in simple-idm backend
- ✅ You have a test user account with a verified email
- ✅ Project is built: `npm run build` (or use dev server)

## Test Suite 1: Headless Hooks

### Test 1.1: useForgotPassword - Email Method

**File:** `examples/headless-custom-ui/src/CustomForgotPassword.tsx`

**Steps:**
1. Navigate to the forgot password page
2. Enter a valid email address
3. Click "Send Reset Link"
4. Verify success message appears
5. Check email inbox for reset link

**Expected Results:**
- ✅ Loading state shows "Sending..."
- ✅ Success message: "Password reset email sent successfully"
- ✅ Email received with reset token
- ✅ canSubmit() returns true for valid email
- ✅ canSubmit() returns false for invalid email

**Error Cases to Test:**
- Invalid email format → Error: "Please enter a valid identifier"
- Non-existent email → Backend error message
- Empty input → Submit button disabled

### Test 1.2: useForgotPassword - Username Method

**Steps:**
1. Configure hook with `method: 'username'`
2. Enter a valid username
3. Submit form
4. Verify email sent to associated email address

**Expected Results:**
- ✅ Username validation (not empty)
- ✅ Email sent to user's registered email
- ✅ Success message displayed

### Test 1.3: useForgotPassword - Both Method (Auto-detect)

**Steps:**
1. Configure hook with `method: 'both'`
2. Test with email: Enter `user@example.com`
3. Test with username: Enter `testuser`
4. Verify both work correctly

**Expected Results:**
- ✅ Automatically detects email vs username
- ✅ Calls correct API endpoint
- ✅ Both methods send reset email

### Test 1.4: useResetPassword - Basic Flow

**File:** `examples/headless-custom-ui/src/CustomResetPassword.tsx`

**Steps:**
1. Get reset token from email
2. Navigate to reset page with `?token=<token>`
3. Enter new password: `NewPass123!`
4. Enter confirm password: `NewPass123!`
5. Submit form

**Expected Results:**
- ✅ Token auto-populated from URL
- ✅ Password strength indicator updates in real-time
- ✅ Passwords match validation works
- ✅ Success message: "Password reset successfully"
- ✅ Can login with new password

### Test 1.5: useResetPassword - Password Strength

**Steps:**
1. Test various passwords and observe strength:
   - `abc` → Weak (0-25%)
   - `password123` → Fair (26-50%)
   - `Password123` → Good (51-75%)
   - `P@ssw0rd123!` → Strong (76-100%)

**Expected Results:**
- ✅ Strength updates on each keystroke
- ✅ Color changes: red → yellow → blue → green
- ✅ Label shows: Weak, Fair, Good, Strong
- ✅ Percentage calculated correctly

### Test 1.6: useResetPassword - Password Policy

**Steps:**
1. Hook should auto-load policy with `autoLoadPolicy: true`
2. Check `policy()` state contains:
   - `min_length`
   - `require_uppercase`
   - `require_lowercase`
   - `require_digit`
   - `require_special_char`
3. Enter password that fails policy
4. Verify `meetsPolicy()` returns false
5. Submit button should be disabled

**Expected Results:**
- ✅ Policy loaded from backend
- ✅ Policy requirements displayed
- ✅ Real-time validation against policy
- ✅ meetsPolicy() accurate
- ✅ canSubmit() respects policy

### Test 1.7: useResetPassword - Password Confirmation

**Steps:**
1. Enter new password: `Test123!`
2. Enter confirm: `Test123!` (matching)
3. Verify `passwordsMatch()` returns true
4. Change confirm to: `Different123!`
5. Verify `passwordsMatch()` returns false
6. Submit button should be disabled

**Expected Results:**
- ✅ passwordsMatch() accurate
- ✅ Visual feedback on match/mismatch
- ✅ Cannot submit with mismatched passwords

## Test Suite 2: Styled Components

### Test 2.1: ForgotPasswordForm - Email Mode

**Component:** `<ForgotPasswordForm apiBaseUrl="..." method="email" />`

**Steps:**
1. Render component
2. Verify email input type
3. Enter valid email
4. Submit form
5. Verify success state UI

**Expected Results:**
- ✅ Email input with proper validation
- ✅ Loading spinner during submission
- ✅ Success message with instructions
- ✅ "Back to Login" link visible
- ✅ Proper styling (Tailwind classes)

### Test 2.2: ForgotPasswordForm - Username Mode

**Component:** `<ForgotPasswordForm apiBaseUrl="..." method="username" />`

**Steps:**
1. Verify text input (not email type)
2. Enter username
3. Submit and verify

**Expected Results:**
- ✅ Text input type
- ✅ Placeholder: "your-username"
- ✅ Label: "Username"

### Test 2.3: ForgotPasswordForm - Both Mode

**Component:** `<ForgotPasswordForm apiBaseUrl="..." method="both" />`

**Steps:**
1. Test with email format
2. Test with username format
3. Verify both work

**Expected Results:**
- ✅ Label: "Email or Username"
- ✅ Auto-detects input type
- ✅ Both methods successful

### Test 2.4: ResetPasswordForm - With Token

**Component:** `<ResetPasswordForm apiBaseUrl="..." token="abc123" />`

**Steps:**
1. Render with token prop
2. Verify token input hidden
3. Enter passwords
4. Submit
5. Verify success state

**Expected Results:**
- ✅ Token input not visible
- ✅ Password strength indicator visible
- ✅ Password policy requirements listed
- ✅ Visual match/mismatch indicator
- ✅ Success state shows checkmark icon
- ✅ "Continue to Login" button

### Test 2.5: ResetPasswordForm - Without Token

**Component:** `<ResetPasswordForm apiBaseUrl="..." showTokenInput={true} />`

**Steps:**
1. Render without token
2. Verify token input visible
3. Enter token manually
4. Complete password reset

**Expected Results:**
- ✅ Token input visible and required
- ✅ Placeholder: "Paste your reset token here"
- ✅ Can paste token and proceed

### Test 2.6: ResetPasswordForm - Strength Indicator UI

**Steps:**
1. Enter various passwords
2. Observe visual changes:
   - Progress bar width
   - Progress bar color
   - Strength label
   - Label color

**Expected Results:**
- ✅ Animated width transition
- ✅ Colors: red → yellow → blue → green
- ✅ Smooth transitions (CSS)
- ✅ Accessible color contrast

### Test 2.7: ResetPasswordForm - Policy Display

**Steps:**
1. Wait for policy to load
2. Verify policy requirements displayed
3. Enter password that fails each requirement
4. Verify requirements update visually

**Expected Results:**
- ✅ Policy loads automatically
- ✅ Requirements listed as bullets
- ✅ Clear indication of what's needed
- ✅ Shows min length, uppercase, lowercase, digit, special char

## Test Suite 3: API Integration

### Test 3.1: API Client Methods

**Methods to test:**
```typescript
client.initiatePasswordResetByEmail(email)
client.initiatePasswordResetByUsername(username)
client.resetPassword({ token, new_password })
client.getPasswordPolicy()
```

**Steps:**
1. Import `SimpleIdmClient`
2. Create instance
3. Call each method
4. Verify API responses

**Expected Results:**
- ✅ Methods exist and callable
- ✅ Proper TypeScript types
- ✅ Correct endpoints called
- ✅ Responses match API types

### Test 3.2: Error Handling

**Test Cases:**
1. Invalid token → 400/401 error
2. Expired token (24h+) → Error message
3. Token already used → Error message
4. Password fails policy → Backend validation error
5. Network error → Error caught and displayed

**Expected Results:**
- ✅ Errors caught in hook
- ✅ Error displayed to user
- ✅ onError callback called
- ✅ User-friendly error messages

### Test 3.3: Success Callbacks

**Steps:**
1. Configure `onSuccess` callback
2. Complete password reset
3. Verify callback called with response

**Expected Results:**
- ✅ Callback receives `PasswordResetInitResponse` or `PasswordResetResponse`
- ✅ Callback called exactly once
- ✅ Response contains expected data

## Test Suite 4: Edge Cases

### Test 4.1: Token Expiration

**Steps:**
1. Request password reset
2. Wait 24+ hours (or modify backend expiry for testing)
3. Attempt to use expired token
4. Verify proper error

**Expected Results:**
- ✅ Clear error: "Token expired"
- ✅ Option to request new token

### Test 4.2: Token Reuse

**Steps:**
1. Use token to reset password
2. Try using same token again
3. Verify error

**Expected Results:**
- ✅ Error: "Token already used" or similar
- ✅ Cannot reuse tokens (one-time use)

### Test 4.3: Multiple Reset Requests

**Steps:**
1. Request password reset
2. Immediately request another
3. Verify both emails received
4. Test that both tokens work (or only latest works, depending on backend)

**Expected Results:**
- ✅ Multiple emails sent
- ✅ Backend handles multiple tokens correctly

### Test 4.4: Special Characters in Password

**Steps:**
1. Enter password with special chars: `!@#$%^&*()_+-=[]{}|;:,.<>?`
2. Submit and reset
3. Login with new password

**Expected Results:**
- ✅ All special characters accepted
- ✅ Password saved correctly
- ✅ Can login with special chars

### Test 4.5: Copy/Paste Token

**Steps:**
1. Copy token from email
2. Paste into token field
3. Verify no whitespace issues
4. Submit

**Expected Results:**
- ✅ Trim() applied to token
- ✅ Pasted token works correctly

## Test Suite 5: Accessibility

### Test 5.1: Keyboard Navigation

**Steps:**
1. Use Tab key to navigate form
2. Use Enter to submit
3. Verify focus indicators

**Expected Results:**
- ✅ Logical tab order
- ✅ Visible focus indicators
- ✅ Enter key submits form

### Test 5.2: Screen Reader

**Steps:**
1. Use screen reader (VoiceOver, NVDA)
2. Navigate form
3. Verify labels read correctly

**Expected Results:**
- ✅ Input labels associated
- ✅ Error messages announced
- ✅ Success messages announced
- ✅ Loading states announced

### Test 5.3: Color Contrast

**Steps:**
1. Check contrast ratios for:
   - Labels
   - Error messages
   - Success messages
   - Strength indicators

**Expected Results:**
- ✅ WCAG AA compliance (4.5:1)
- ✅ Color not only indicator (text labels too)

## Test Suite 6: Performance

### Test 6.1: Loading States

**Steps:**
1. Throttle network (Chrome DevTools)
2. Submit form
3. Observe loading indicators

**Expected Results:**
- ✅ Loading state shows immediately
- ✅ Button disabled during submission
- ✅ Spinner/loading text visible

### Test 6.2: Password Policy Caching

**Steps:**
1. Load reset form (policy fetches)
2. Enter password and clear it
3. Verify policy not re-fetched

**Expected Results:**
- ✅ Policy fetched once
- ✅ Cached in component state
- ✅ No redundant API calls

## Test Checklist

Use this checklist for comprehensive testing:

### Headless Hooks
- [ ] useForgotPassword - email method
- [ ] useForgotPassword - username method
- [ ] useForgotPassword - both method
- [ ] useForgotPassword - error handling
- [ ] useResetPassword - basic flow
- [ ] useResetPassword - password strength
- [ ] useResetPassword - password policy
- [ ] useResetPassword - password matching
- [ ] useResetPassword - error handling

### Styled Components
- [ ] ForgotPasswordForm - email mode
- [ ] ForgotPasswordForm - username mode
- [ ] ForgotPasswordForm - both mode
- [ ] ForgotPasswordForm - success state
- [ ] ForgotPasswordForm - error state
- [ ] ResetPasswordForm - with token
- [ ] ResetPasswordForm - without token
- [ ] ResetPasswordForm - strength indicator
- [ ] ResetPasswordForm - policy display
- [ ] ResetPasswordForm - success state
- [ ] ResetPasswordForm - error state

### API Integration
- [ ] initiatePasswordResetByEmail()
- [ ] initiatePasswordResetByUsername()
- [ ] resetPassword()
- [ ] getPasswordPolicy()
- [ ] Error responses handled
- [ ] Success callbacks work

### Edge Cases
- [ ] Token expiration
- [ ] Token reuse prevention
- [ ] Multiple reset requests
- [ ] Special characters in password
- [ ] Copy/paste token
- [ ] Network errors
- [ ] Backend validation errors

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] Color contrast
- [ ] ARIA labels

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Automated Testing (Future)

For future automated test setup, consider:

```bash
# Install testing dependencies
npm install --save-dev vitest @solidjs/testing-library @testing-library/jest-dom

# Create test files
src/headless/__tests__/useForgotPassword.test.ts
src/headless/__tests__/useResetPassword.test.ts
src/components/__tests__/ForgotPasswordForm.test.tsx
src/components/__tests__/ResetPasswordForm.test.tsx
```

## Reporting Issues

If you find any issues during testing:

1. **Check** that the simple-idm backend is working correctly
2. **Verify** the backend endpoints are accessible
3. **Document** steps to reproduce
4. **Include** error messages and console logs
5. **Note** browser and version
6. **Report** at: https://github.com/tendant/simple-idm-solid/issues

## Conclusion

This testing guide covers all aspects of the password reset functionality. Manual testing ensures:

- ✅ All hooks work correctly
- ✅ All components render properly
- ✅ API integration is solid
- ✅ Edge cases are handled
- ✅ Accessibility standards met
- ✅ User experience is smooth

For production deployment, consider setting up automated E2E tests with Playwright or Cypress.
