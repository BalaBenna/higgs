# Debugging Image Persistence & Authentication

This guide shows you exactly what to look for in the backend console when generating images.

## Quick Start

1. **Terminal 1**: Start backend on port 57989
   ```powershell
   cd server
   python main.py --port 57989
   ```

2. **Terminal 2**: Start frontend
   ```powershell
   cd app
   npm run dev
   ```

3. **Sign In** at http://localhost:3000/login with email/password

4. **Generate Image** at http://localhost:3000/explore with any prompt

5. **Watch Backend Console** for the complete flow

---

## Console Log Breakdown

### ✅ SUCCESSFUL FLOW (User Authenticated)

Expected output when you are **signed in** and generate an image:

```
================================================================================
🔐 AUTH: authenticated (abc12345...)
🎨 TOOL: generate_image_by_dalle3_openai
================================================================================

✅ 🔐 Token decoded successfully for user: abc12345...

🖼️ Tool result: image generated successfully...

📊 PERSISTENCE CHECK:
   user_id present: True
   results count: 1

💾 Starting Supabase persistence...
   ✅ Supabase IS configured
   📤 Uploading image_abc123.png (245821 bytes)...
   ✅ Uploaded to Storage: https://supabase.../abc12345.../image_abc123.png
   📱 Inserting image for user abc12345... to generated_content table
   ✅ Successfully inserted image with ID: 42

✅ COMPLETE: Persisted 1/1 images to Supabase

📤 RESPONSE: Returning 1 image(s) to frontend
```

### ❌ AUTHENTICATION ISSUE (User NOT Signed In)

Expected output when you are **NOT signed in** and generate an image:

```
================================================================================
🔐 AUTH: UNAUTHENTICATED
🎨 TOOL: generate_image_by_dalle3_openai
================================================================================

⚠️  🔐 No Bearer token in Authorization header - user is UNAUTHENTICATED

🖼️ Tool result: image generated successfully...

📊 PERSISTENCE CHECK:
   user_id present: False
   results count: 1

⛔ NO AUTH: Cannot persist to Supabase (user_id is None)
   💡 User must sign in for images to be saved to database

📤 RESPONSE: Returning 1 image(s) to frontend
```

**What this means**: Image was generated successfully, but NOT saved to your Supabase database because you weren't signed in. Image will only exist locally.

**How to fix**: Go to http://localhost:3000/login and sign in with your email, then try generating again.

---

## Troubleshooting Different Scenarios

### Scenario 1: "I'm signed in but images still not saving"

**Check for this in the console:**
```
✅ Supabase IS configured
```

If you see `⚠️ Supabase NOT configured`:
- Check environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Restart backend with `--port 57989`

**If you see database errors like:**
```
❌ FAILED: Constraint failed: user_id is not null
```

- Your JWT token doesn't contain the user_id
- Re-sign in to refresh the token
- Try a new account

### Scenario 2: "Logs show authenticated but image not in /my-content"

**Steps to verify:**

1. Check backend logs show: ✅ COMPLETE: Persisted 1/1 images
2. Check Supabase dashboard directly:
   ```bash
   # Open browser to:
   # https://app.supabase.com → Select project → SQL Editor
   # Run: SELECT * FROM generated_content ORDER BY created_at DESC LIMIT 5;
   ```

3. If record exists in Supabase but not in UI:
   - Clear browser cache: DevTools → Application → Clear site data
   - Refresh http://localhost:3000/my-content
   - Check browser console for fetch errors

### Scenario 3: "Image upload fails"

**Look for errors like:**
```
📤 Uploading image_abc123.png (245821 bytes)...
❌ FAILED: 403 Forbidden
traceback...
```

**This means:**
- Supabase Storage permissions issue
- Service role key might be invalid
- Check `SUPABASE_SERVICE_ROLE_KEY` in environment

---

## Console Log Symbols Guide

| Symbol | Meaning | Action |
|--------|---------|--------|
| 🔐 | Authentication status | Shows if user is authenticated |
| 🎨 | Tool/Model name | Shows which AI model was used |
| ✅ | Success | Everything is working |
| ⚠️  | Warning | Non-critical issue, might continue |
| ❌ | Error | Something failed |
| 📊 | Checkpoint | Status check happening |
| 💾 | Database operation | Persisting to Supabase |
| 📤 | Upload operation | Uploading to storage |
| 📱 | Database insert | Saving to generated_content table |
| ⛔ | Blocked operation | Cannot continue (user not auth'd, no results, etc) |
| 💡 | Helpful hint | Tip for fixing the issue |

---

## Complete Audit Trail Example

Here's what success looks like from start to finish:

```
AUTH CHECK:
  🔐 AUTH: authenticated (user_12345...)  ← You're signed in!
  ✅ 🔐 Token decoded successfully for user: user_12...

GENERATION:
  🖼️ Tool result: image generated successfully...

PERSISTENCE:
  📊 PERSISTENCE CHECK:
     user_id present: True         ← Has user_id
     results count: 1              ← Generated 1 image
     
  💾 Starting Supabase persistence...
     ✅ Supabase IS configured    ← Connection ready
     📤 Uploading image_xyz.png... ← Upload starting
     ✅ Uploaded to Storage        ← Storage saved
     📱 Inserting image for user... ← DB insert starting
     ✅ Successfully inserted       ← DB saved!
     
  ✅ COMPLETE: Persisted 1/1 images to Supabase  ← All done!

RESPONSE:
  📤 RESPONSE: Returning 1 image(s) to frontend  ← Sent to UI
```

---

## Database Verification

After seeing the success log, verify the record exists:

```bash
# Option 1: Supabase Dashboard
# Go to https://app.supabase.com
# Select your project → Table Editor → generated_content
# Should see your image in the list

# Option 2: Run verification script
cd d:\higgs
python verify_supabase_images.py

# Option 3: Python/psql query
# SELECT COUNT(*) FROM generated_content WHERE user_id = 'your_user_id';
```

---

## Quick Reference: Before & After

### BEFORE (Not Working)
```
⛔ NO AUTH: Cannot persist to Supabase (user_id is None)
   💡 User must sign in for images to be saved to database
```
→ 0 records in database

### AFTER (Working)
```
✅ COMPLETE: Persisted 1/1 images to Supabase
📤 RESPONSE: Returning 1 image(s) to frontend
```
→ Records appear in database & /my-content UI

---

## Need Help?

1. **Check the signs above** - they tell you exactly what's wrong
2. **Copy entire console output** when reporting issues
3. **Verify authentication first** - many issues trace back to "not signed in"
4. **Check Supabase dashboard** - records should appear if logs say "Persisted"
