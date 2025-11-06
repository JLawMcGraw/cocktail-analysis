# CSRF Protection Implementation

## Overview
This server uses **Double-Submit Cookie Pattern** for CSRF protection.

## How It Works

1. Server sends CSRF token in two ways:
   - As an HTTP-only cookie (cannot be read by JavaScript)
   - As a JSON response body (client stores this in memory)

2. Client includes token in requests:
   - Cookie is sent automatically by browser
   - Token from JSON is sent in `X-CSRF-Token` header

3. Server validates both match:
   - If tokens don't match → CSRF attack detected → request rejected
   - If tokens match → legitimate request → proceed

## Client Implementation

### Step 1: Get CSRF Token on App Load

```javascript
// On app initialization
async function initializeCsrf() {
  const response = await fetch('http://localhost:3000/api/csrf-token', {
    credentials: 'include' // Important: send cookies
  });

  const data = await response.json();
  const csrfToken = data.csrfToken;

  // Store token in memory (NOT localStorage - that defeats the purpose)
  window.csrfToken = csrfToken;
}
```

### Step 2: Include Token in All POST/PUT/DELETE Requests

```javascript
// Example: Creating inventory item
async function createInventoryItem(item) {
  const response = await fetch('http://localhost:3000/api/inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'X-CSRF-Token': window.csrfToken // Include CSRF token
    },
    credentials: 'include', // Send cookies
    body: JSON.stringify(item)
  });

  return response.json();
}
```

### Step 3: Refresh Token Periodically (Optional)

```javascript
// Refresh CSRF token every 12 hours
setInterval(async () => {
  await initializeCsrf();
}, 12 * 60 * 60 * 1000);
```

## Protected Routes

CSRF protection is applied to:
- ✅ `POST /api/inventory/*`
- ✅ `PUT /api/inventory/*`
- ✅ `DELETE /api/inventory/*`
- ✅ `POST /api/recipes/*`
- ✅ `PUT /api/recipes/*`
- ✅ `DELETE /api/recipes/*`
- ✅ `POST /api/favorites/*`
- ✅ `DELETE /api/favorites/*`

CSRF protection is NOT applied to:
- ❌ `GET` requests (safe methods)
- ❌ `POST /auth/login` (separate protection via rate limiting)
- ❌ `POST /auth/signup`

## Error Handling

If CSRF token is missing or invalid:

```json
HTTP 403 Forbidden
{
  "error": "Forbidden",
  "message": "Invalid or missing CSRF token"
}
```

Client should:
1. Fetch new CSRF token
2. Retry the request

## Security Benefits

### Prevents CSRF Attacks
```html
<!-- Attacker's malicious site -->
<form action="http://yourapp.com/api/inventory/1" method="POST">
  <input type="hidden" name="delete" value="true">
</form>
<script>document.forms[0].submit();</script>
```

**Without CSRF Protection:** ❌ Attack succeeds
**With CSRF Protection:** ✅ Attack blocked (attacker doesn't have CSRF token)

### Why Double-Submit Cookie Pattern?

1. **Stateless:** No server-side session storage needed
2. **Scalable:** Works with load balancers
3. **Secure:** Attacker can't read HTTP-only cookies
4. **Simple:** No database lookups required

## Testing CSRF Protection

```bash
# Should succeed (with token)
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: abc123..." \
  -H "Cookie: csrf_token=abc123..." \
  -d '{"name":"Test"}'

# Should fail (missing token)
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# Response: 403 Forbidden
```

## Production Considerations

1. **HTTPS Only:** CSRF cookies set with `secure: true` in production
2. **SameSite:** Cookies use `SameSite=Strict` for additional protection
3. **Token Rotation:** Tokens expire after 24 hours
4. **CORS:** Configured to only accept requests from trusted origins

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://owasp.org/www-community/SameSite)
