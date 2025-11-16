# Type System Guide

## Overview

The `simple-idm-solid` library uses two distinct type systems to maintain compatibility with both **OIDC standards** and **simple-idm custom APIs**.

## Type Categories

### 1. OIDC Standard Types (for `/oauth2/userinfo` only)

```typescript
export interface UserInfo {
  sub: string;                    // Subject - unique user identifier
  preferred_username?: string;     // Preferred username
  email?: string;                  // Email address
  email_verified?: boolean;        // Email verification status
  name?: string;                   // Full name
  given_name?: string;             // First name
  family_name?: string;            // Last name
  picture?: string;                // Profile picture URL
  groups?: string[];               // User groups/roles
  updated_at?: number;             // Last update timestamp
}
```

**Used by:**
- `SimpleIdmClient.getCurrentUser()` → calls `/api/v1/oauth2/userinfo`
- `useAuth` hook's `user()` state
- Any OIDC-compliant integration

**Why OIDC format?**
- `/oauth2/userinfo` is a **standard OIDC endpoint**
- Must follow [OpenID Connect Core spec](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)
- Enables interoperability with standard OAuth2/OIDC tools

### 2. Simple-IDM Custom Types (for IDM-specific endpoints)

```typescript
export interface IdmUser {
  id: string;                      // User ID
  email: string;                   // Email address
  name: string;                    // Display name
  role: string;                    // Primary role (deprecated)
  roles: string[];                 // User roles
}
```

**Used by:**
- `LoginResponse.users[]` - Multiple user selection
- `/api/v1/idm/auth/login` endpoint
- Custom simple-idm features (multi-user accounts, role management)

**Why custom format?**
- Supports simple-idm specific features (multiple users per login, role hierarchy)
- Not constrained by OIDC standards
- Can evolve independently

## Endpoint-to-Type Mapping

| Endpoint | Response Type | User Type | Format |
|----------|--------------|-----------|--------|
| `/api/v1/idm/auth/login` | `LoginResponse` | `IdmUser[]` | Custom |
| `/api/v1/idm/auth/magic-link/validate` | `MagicLinkValidateResponse` | Custom fields | Custom |
| `/api/v1/oauth2/userinfo` | `UserInfo` | `UserInfo` | OIDC Standard |
| `/api/v1/idm/signup/*` | `SignupResponse` | N/A | Custom |
| `/api/v1/idm/profile/*` | `ProfileUpdateResponse` | N/A | Custom |

## Usage Examples

### Getting Current User (OIDC Standard)

```typescript
import { SimpleIdmClient, UserInfo } from '@tendant/simple-idm-solid';

const client = new SimpleIdmClient({ basePrefix: '/api/v1/idm' });

// Returns OIDC standard format
const user: UserInfo = await client.getCurrentUser();
console.log(user.sub);   // OIDC standard claim
console.log(user.email); // OIDC standard claim
```

### Login with Multi-User Selection (Custom Format)

```typescript
import { useLogin, IdmUser } from '@tendant/simple-idm-solid';

const login = useLogin({ /* config */ });

const response = await login.submit();

if (response.status === 'multiple_users') {
  // users[] uses IdmUser format (simple-idm custom)
  const users: IdmUser[] = response.users!;
  users.forEach(user => {
    console.log(user.id);     // Custom field
    console.log(user.roles);  // Custom field
  });
}
```

### Using with useAuth Hook

```typescript
import { useAuth, UserInfo } from '@tendant/simple-idm-solid';

const auth = useAuth({
  client: idmClient,
  checkAuthOnMount: true,
});

// user() returns OIDC standard UserInfo
const currentUser: UserInfo | null = auth.user();
if (currentUser) {
  console.log(currentUser.sub);   // OIDC standard
  console.log(currentUser.email); // OIDC standard
}
```

## Design Rationale

### Why Two Type Systems?

**Standards Compliance + Flexibility**

1. **OIDC endpoints must use OIDC types** for interoperability
2. **Custom endpoints can use custom types** for flexibility
3. Clear separation prevents confusion about which format to expect

### Alternative Approaches Considered

❌ **Use only OIDC format everywhere**
- Problem: Can't support simple-idm specific features (multi-user, custom roles)
- Problem: Forces all responses into OIDC constraints

❌ **Use only custom format everywhere**
- Problem: Breaks OIDC compliance
- Problem: `/oauth2/userinfo` wouldn't work with standard OAuth2 clients

✅ **Use both with clear separation** (current approach)
- Benefit: Standards compliance where needed
- Benefit: Flexibility where needed
- Benefit: Clear documentation prevents mistakes

## Migration from Old UserInfo

If you were using the old `UserInfo` type with custom fields:

```typescript
// OLD (incorrect)
interface UserInfo {
  user_uuid: string;  // ❌ Not OIDC standard
  username: string;   // ❌ Not OIDC standard
}

// NEW (correct)
interface UserInfo {
  sub: string;              // ✅ OIDC standard
  preferred_username?: string;  // ✅ OIDC standard
}
```

**Migration steps:**
1. Replace `user_uuid` with `sub`
2. Replace `username` with `preferred_username`
3. For login responses, use `IdmUser` type instead of `UserInfo`

## Best Practices

### ✅ DO

- Use `UserInfo` for data from `/oauth2/userinfo`
- Use `IdmUser` for data from login/custom endpoints
- Check the endpoint to know which type to expect
- Use TypeScript to catch type mismatches

### ❌ DON'T

- Don't use `UserInfo` for login response users
- Don't expect OIDC format from custom endpoints
- Don't mix the two type systems

## Questions?

For more details:
- OIDC Standard Claims: https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
- Simple-IDM API: Check `simple-idm` backend OpenAPI specs
- Library Types: See `src/types/api.ts`
