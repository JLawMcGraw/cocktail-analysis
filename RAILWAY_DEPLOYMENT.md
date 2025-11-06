# Railway Deployment Guide - v6.0.1

Complete guide for deploying the Cocktail Analyzer to Railway with all v6.0.1 security features.

---

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository connected to Railway
- Anthropic API key (optional, for AI features)

---

## Quick Deployment Steps

### 1. Connect GitHub Repository

1. Log in to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `cocktail-analysis` repository
4. Railway will auto-detect Node.js project

### 2. Configure Environment Variables

**CRITICAL:** Railway requires these environment variables. Go to your project → Settings → Variables:

#### Required Variables

```env
# JWT Secret (CRITICAL - Generate new one!)
JWT_SECRET=<generate-secure-64-char-hex-string>

# Node Environment
NODE_ENV=production

# Frontend URL (Railway will provide this)
FRONTEND_URL=https://your-app.up.railway.app

# Database Path
DATABASE_PATH=./server/database/cocktail-analyzer.db
```

#### Optional Variables

```env
# Anthropic API Key (for AI Bartender)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Custom Port (Railway sets this automatically, usually)
PORT=3000
```

### 3. Generate Secure JWT Secret

**DO NOT use a weak or default secret in production!**

Run this command locally and copy the output:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output (64 characters):
```
d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5
```

**Paste this into Railway's `JWT_SECRET` variable.**

### 4. Configure Build Settings

Railway auto-detects from `package.json`, but verify:

**Build Command:**
```bash
npm run railway:build
```
*(This runs: `npm install && npm run build`)*

**Start Command:**
```bash
npm start
```
*(This runs: `node server/server.cjs`)*

### 5. Deploy

1. Railway will automatically deploy on push to main branch
2. Watch the build logs for any errors
3. Deployment typically takes 2-3 minutes

---

## Post-Deployment Configuration

### Update FRONTEND_URL

After first deployment, Railway assigns a URL like `https://your-app.up.railway.app`

1. Copy the Railway-provided URL
2. Go to Settings → Variables
3. Update `FRONTEND_URL` to match:
   ```
   FRONTEND_URL=https://your-app.up.railway.app
   ```
4. Redeploy (Railway auto-deploys on variable changes)

### Update CORS Configuration

The server is configured to accept requests from `FRONTEND_URL`:

```javascript
// server/server.cjs
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Required for CSRF cookies
}));
```

This allows:
- CSRF cookies to work properly
- Authentication tokens to be sent
- Cross-origin requests from your Railway domain

---

## Security Checklist for Railway

### ✅ v6.0.1 Security Features (Auto-Enabled)

These are already implemented in the codebase:

- ✅ **JWT Secret Validation** - Server fails fast if JWT_SECRET is missing/weak
- ✅ **HTTPS Enforcement** - Automatic redirect to HTTPS in production
- ✅ **HSTS Headers** - 1-year HSTS policy with preload
- ✅ **Rate Limiting** - 5 auth attempts per 15 min, 10 failed per hour
- ✅ **CSRF Protection** - Double-submit cookie pattern
- ✅ **XSS Protection** - HTML escaping on all user input
- ✅ **SQL Injection Prevention** - Prepared statements
- ✅ **Body Size Limit** - 1MB max to prevent DoS
- ✅ **Helmet Security Headers** - CSP, X-Frame-Options, etc.

### ⚠️ Manual Configuration Required

1. **JWT_SECRET** - MUST generate unique secret (not default!)
2. **FRONTEND_URL** - MUST match Railway-provided URL
3. **ANTHROPIC_API_KEY** - Optional but recommended for AI features
4. **NODE_ENV** - Set to `production` (enables HTTPS redirect)

---

## Troubleshooting

### Issue: Server won't start - "JWT_SECRET is not set"

**Cause:** Missing or misconfigured JWT_SECRET environment variable.

**Solution:**
1. Generate secure secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Add to Railway environment variables
3. Ensure it's at least 32 characters
4. Redeploy

### Issue: "CSRF token missing or invalid"

**Cause:** CORS not configured correctly or cookies not being sent.

**Solution:**
1. Verify `FRONTEND_URL` matches Railway URL exactly (including `https://`)
2. Ensure no trailing slash in `FRONTEND_URL`
3. Check Railway logs for CORS errors
4. Frontend must include `credentials: 'include'` in fetch requests:
   ```javascript
   fetch('/api/csrf-token', {
     credentials: 'include'
   })
   ```

### Issue: "Too many authentication attempts"

**Cause:** Rate limiting is working correctly! (This is expected behavior)

**Solution:**
- Wait 15 minutes before retrying
- After 10 failed logins, wait 1 hour
- Rate limits prevent brute force attacks

### Issue: Database errors or "ENOENT"

**Cause:** SQLite database not persisting or path issues.

**Solution:**
1. Verify `DATABASE_PATH=./server/database/cocktail-analyzer.db` in Railway
2. Railway uses ephemeral storage (database resets on redeploy)
3. For persistent data, consider:
   - Railway PostgreSQL plugin (requires migration)
   - External database service
   - Railway volumes (beta feature)

### Issue: Build fails - "Cannot find module"

**Cause:** Missing dependencies or build step failed.

**Solution:**
1. Check Railway build logs
2. Verify `package.json` has all dependencies
3. Ensure `railway:build` script runs successfully locally
4. Try: `npm install && npm run build` locally first

### Issue: 502 Bad Gateway or App Crashes

**Cause:** Server not binding to Railway's PORT.

**Solution:**
1. Railway injects `PORT` environment variable
2. Server already uses: `const PORT = process.env.PORT || 3000`
3. Check Railway logs for startup errors
4. Verify database initializes successfully

---

## Railway-Specific Features

### Automatic HTTPS

Railway provides free HTTPS certificates automatically:
- All traffic is encrypted
- Server enforces HTTPS redirect in production
- HSTS headers instruct browsers to always use HTTPS

### Environment Variables

Railway environment variables are injected at runtime:
- Access via `process.env.VARIABLE_NAME`
- Changes trigger automatic redeployment
- Keep secrets secure (never commit to git)

### Build Caching

Railway caches `node_modules` between deploys:
- First deploy: ~2-3 minutes
- Subsequent deploys: ~30-60 seconds (if no dependency changes)

### Logs

Access deployment and runtime logs:
- Railway Dashboard → Your Project → Deployments → View Logs
- Filter by: Build, Deploy, Application logs
- Useful for debugging CSRF, auth, and database issues

---

## Database Persistence Considerations

**⚠️ IMPORTANT:** Railway uses ephemeral filesystem storage.

### What This Means:
- SQLite database is stored on Railway's filesystem
- **Database resets on every new deployment**
- User accounts, inventory, recipes lost on redeploy

### Solutions:

#### Option 1: Accept Ephemeral Storage (Development/Demo)
- Good for testing and demos
- Users expect to re-upload data after updates
- Simple, no additional setup

#### Option 2: Migrate to PostgreSQL (Recommended for Production)
- Railway offers PostgreSQL plugin (persistent storage)
- Requires code changes: Replace `sqlite3` with `pg` package
- Database survives redeployments
- Better for production use

#### Option 3: External Database
- Use external PostgreSQL (Supabase, Neon, etc.)
- Set `DATABASE_URL` environment variable
- More reliable for multi-instance deployments

---

## Testing the Deployment

### 1. Verify Server is Running

```bash
curl https://your-app.up.railway.app/auth/health
```

Expected response: `200 OK`

### 2. Test JWT Secret Validation

If JWT_SECRET is not set or too short, server should fail to start.

Check Railway logs for:
```
❌ FATAL ERROR: JWT_SECRET environment variable is not set!
```

This means security validation is working!

### 3. Test HTTPS Enforcement

Try accessing via HTTP:
```bash
curl -I http://your-app.up.railway.app
```

Expected: `301 Redirect` to HTTPS URL

### 4. Test Rate Limiting

Make 6+ rapid login attempts with wrong password:
```bash
for i in {1..6}; do
  curl -X POST https://your-app.up.railway.app/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

Expected: After 5 attempts, receive `429 Too Many Requests`

### 5. Test CSRF Protection

Try POST without CSRF token:
```bash
curl -X POST https://your-app.up.railway.app/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item"}'
```

Expected: `403 Forbidden - Invalid or missing CSRF token`

---

## Deployment Checklist

Before going live, verify:

- [ ] `JWT_SECRET` is set to secure 64-char hex string (not default!)
- [ ] `NODE_ENV` is set to `production`
- [ ] `FRONTEND_URL` matches Railway-provided URL
- [ ] `ANTHROPIC_API_KEY` is set (if using AI features)
- [ ] Server starts successfully (check Railway logs)
- [ ] HTTPS redirect is working (try HTTP URL)
- [ ] Rate limiting is active (test 6 failed logins)
- [ ] CSRF protection is working (test POST without token)
- [ ] Database initializes successfully
- [ ] Frontend can connect to backend
- [ ] Authentication (signup/login) works
- [ ] CSV upload works
- [ ] AI Bartender responds (if API key set)

---

## Monitoring and Maintenance

### Check Logs Regularly

Railway logs show:
- Startup errors (JWT_SECRET, database issues)
- Rate limiting events (blocked IPs)
- CSRF violations (potential attacks)
- Authentication failures
- API errors

### Security Monitoring

Watch for patterns indicating attacks:
- High rate of 429 errors → Brute force attempt
- High rate of 403 CSRF errors → CSRF attack attempt
- Unusual traffic patterns → Potential DoS

### Performance Monitoring

Railway provides metrics:
- CPU usage
- Memory usage
- Request count
- Response times

---

## Updating the Deployment

### Automatic Deployments

Railway auto-deploys on git push to main:

```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

Railway detects the push and:
1. Runs `npm run railway:build`
2. Starts server with `npm start`
3. Switches traffic to new deployment
4. Zero downtime (blue-green deployment)

### Manual Redeploy

In Railway Dashboard:
1. Go to your project
2. Click "Deployments"
3. Click "Deploy" on any previous deployment
4. Or click "Redeploy" to rebuild current version

---

## Cost Considerations

**Railway Pricing (as of 2024):**
- Hobby Plan: $5/month
- Includes $5 of usage credits
- Pay-as-you-go beyond credits

**Typical Monthly Cost:**
- Small app (< 1000 users): ~$5-10/month
- Medium traffic: ~$10-20/month
- Add PostgreSQL plugin: +$5/month (500MB)

---

## Next Steps

1. ✅ Deploy to Railway using this guide
2. ✅ Verify all security features are working
3. ✅ Test authentication and data upload
4. ✅ Monitor logs for errors
5. 🔄 Consider PostgreSQL migration for persistent data
6. 📊 Set up uptime monitoring (UptimeRobot, Pingdom, etc.)

---

## Support and Resources

- **Railway Docs:** https://docs.railway.app
- **Project Issues:** https://github.com/your-repo/issues
- **Security Documentation:** [SECURITY_FIXES.md](./SECURITY_FIXES.md)
- **Project Status:** [Documentation/PROJECT_STATUS.md](./Documentation/PROJECT_STATUS.md)

---

**Version:** 6.0.1 | **Last Updated:** 2025-11-06
