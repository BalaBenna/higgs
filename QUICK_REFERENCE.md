# Quick Reference: Log Symbols & Meanings

Keep this open while testing!

## Auth Status (Top of Console)

### When You're Signed In ✅
```
🔐 AUTH: authenticated (abc12345...)
```
→ User_id found in JWT token. Images WILL save to Supabase if everything else works.

### When You're NOT Signed In ❌
```
🔐 AUTH: UNAUTHENTICATED
```
→ No token in Authorization header. Images generated but NOT saved to database. **GO SIGN IN FIRST.**

---

## Persistence Flow

### Full Success ✅
```
💾 Starting Supabase persistence...
   ✅ Supabase IS configured
   📤 Uploading image_xyz.png...
   ✅ Uploaded to Storage
   📱 Inserting image...
   ✅ Successfully inserted
✅ COMPLETE: Persisted 1/1 images
```
→ Everything worked! Check Supabase dashboard.

### Failed: Not Signed In ❌
```
⛔ NO AUTH: Cannot persist to Supabase (user_id is None)
```
→ Need to sign in at http://localhost:3000/login first.

### Failed: Supabase Configuration ❌
```
⚠️ Supabase NOT configured
```
→ Check environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Failed: File Not Found ❌
```
⚠️ File not found: /path/to/image
```
→ Local file missing. Generated image but can't upload it. Restart servers.

### Failed: Database Insert ❌
```
📱 Inserting image...
❌ Constraint failed: user_id not null
```
→ JWT token doesn't contain user_id. Re-sign in.

---

## Decision Tree

**Image generated but database still empty?**

1. Check backend console for `🔐 AUTH:` line
   - Shows "UNAUTHENTICATED"? → GO SIGN IN!
   - Shows "authenticated"? → Continue to 2.

2. Look for `💾 Starting Supabase persistence...`
   - Shows "UNAUTHENTICATED"? → Already covered in step 1
   - Shows "✅ Supabase IS configured"? → Continue to 3
   - Shows "⚠️ Supabase NOT configured"? → Check environment

3. Look for `✅ COMPLETE: Persisted` line
   - NOT FOUND? → Error happened. Read full console output above persistence section
   - FOUND? → Persistence succeeded. Check Supabase dashboard

4. Check Supabase dashboard: https://app.supabase.com
   - Table Editor → generated_content → See your image?
   - YES? → Check /my-content URL (UI fetch issue)
   - NO? → Backend persistence claimed success but DB empty. Database error.

---

## Common Fixes

| You See | Fix |
|---------|-----|
| UNAUTHENTICATED | Go to http://localhost:3000/login, sign in with email |
| Supabase NOT configured | Check .env file has SUPABASE_URL, SUPABASE_KEY, etc |
| File not found | Restart: `python main.py --port 57989` |
| Constraint failed | Re-sign in: go to /login again |
| 0 records in Supabase | Scroll up in backend console, find ERROR line |

---

## What Each Symbol Means

- 🔐 = Authentication/Token
- 🎨 = Tool/Model being used
- ✅ = Success!
- ⚠️ = Warning (might continue)
- ❌ = Error (stopped here)
- 📊 = Status check
- 💾 = Supabase operation
- 📤 = File upload
- 📱 = Database insert
- ⛔ = Operation blocked
- 💡 = Helpful tip

---

## URLs to Remember

- 🔐 Login: http://localhost:3000/login
- 🎨 Generate: htp://localhost:3000/explore
- 📸 View images: http://localhost:3000/my-content
- 📊 Database: https://app.supabase.com (Table Editor)
- 📜 Backend logs: Watch terminal window running `python main.py`

---

## One-Liner Verification

After generating image, search backend console for:

```
✅ COMPLETE: Persisted 1/1 images
```

If found → Good! Check /my-content or Supabase dashboard.
If not found → Error happened. Look for ❌ or ⛔ symbol above.

---

**Most Common Issue:** User not signed in. Check for `UNAUTHENTICATED` - if you see it, go sign in!
