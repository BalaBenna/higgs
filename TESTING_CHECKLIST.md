# Quick Testing Checklist for Image Persistence

Use this checklist to verify everything is working end-to-end.

## Pre-Test Setup

- [ ] Backend running on port 57989: `python main.py --port 57989`
- [ ] Frontend running on port 3000: `npm run dev`
- [ ] Both servers started without errors
- [ ] Backend console is visible and you can see logs
- [ ] Browser at http://localhost:3000

## Test Flow

### Step 1: Sign In (2 min)
- [ ] Navigate to http://localhost:3000/login
- [ ] Click "Email" tab
- [ ] Enter email and password (create account if needed)
- [ ] Click "Sign In"
- [ ] You see "Success!" message or redirect to explore
- [ ] Check browser DevTools → Application → Cookies → see `sb-access-token` cookie
   
   **Expected backend log:** None yet (no API call on login)

### Step 2: Check Authentication (1 min)
- [ ] Go to browser DevTools → Console
- [ ] Look for any auth errors (should be none)
- [ ] Check cookies are present: `sb-access-token`

   **Expected:** Cookie present, no auth errors

### Step 3: Generate Image (3 min)
- [ ] Navigate to http://localhost:3000/explore
- [ ] Enter prompt: "a cute cat"
- [ ] Select any model from dropdown
- [ ] Click "Generate"
- [ ] Wait 10-30 seconds for image to appear
   
   **Expected backend log:**
   ```
   ================================================================================
   🔐 AUTH: authenticated (abc12345...)
   🎨 TOOL: generate_image_by_dalle3_openai
   ================================================================================
   ```

### Step 4: Check Persistence in Console (2 min)
- [ ] Look for this line in backend console:
   ```
   ✅ COMPLETE: Persisted 1/1 images to Supabase
   ```
   
   **Good signs:**
   - ✅ Shows "authenticated (abc12345...)" - you're signed in
   - ✅ Shows "Supabase IS configured" - connection ready
   - ✅ Shows storage upload success
   - ✅ Shows database insert success
   
   **Bad signs:**
   - ❌ Shows "UNAUTHENTICATED" - NOT signed in (go back to Step 1)
   - ❌ Shows "Supabase NOT configured" - check environment variables
   - ❌ Shows "File not found" - local file issue
   - ❌ Shows database error - token might be invalid

### Step 5: Check Supabase Dashboard (2 min)
- [ ] Open https://app.supabase.com
- [ ] Select your project
- [ ] Go to "Table Editor" or "SQL Editor"
- [ ] Open `generated_content` table
- [ ] Look for your image record
   
   **Expected:** At least 1 row with:
   - `user_id`: matches the logged user ID
   - `prompt`: "a cute cat" (or your prompt)
   - `model`: "generate_image_by_dalle3_openai"
   - `created_at`: recent timestamp

   **If empty:** Check Step 4 - backend logs should tell you why it didn't save

### Step 6: Check Frontend UI (2 min)
- [ ] Navigate to http://localhost:3000/my-content
- [ ] You should see your generated image in the gallery
- [ ] Click on it to view full size/details
   
   **Expected:** Image appears in your content gallery
   
   **If image not showing:**
   - Check Step 5 - is it in Supabase?
   - If yes in Supabase: frontend fetch issue (check browser console)
   - If no in Supabase: backend persistence failed (check Step 4)

### Step 7: Verify Multiple Generations (3 min)
- [ ] Go back to /explore
- [ ] Generate 2 more images with different prompts
- [ ] Wait for completion after each
- [ ] Backend should show:
   ```
   ✅ COMPLETE: Persisted 1/1 images to Supabase
   ```
   for each one (3 times total)
- [ ] Supabase should now have 3+ records
- [ ] /my-content should show all 3+ images

## Pass/Fail Criteria

### ✅ PASS: All of these should be true
1. [x] Can sign in with email/password
2. [x] Backend logs show "authenticated" during generation
3. [x] Backend logs show "Persisted X/1 images"
4. [x] Supabase dashboard shows generated_content records
5. [x] /my-content displays your images
6. [x] Multiple generations work consistently

### ❌ FAIL: If any of these are true
1. [ ] Backend logs show "UNAUTHENTICATED" during generation
2. [ ] Supabase shows "Supabase NOT configured"
3. [ ] Backend shows database insert errors
4. [ ] Supabase dashboard has 0 records in generated_content
5. [ ] /my-content is empty (even though logs show success)

## Troubleshooting Quick Links

| Problem | Debug Steps |
|---------|------------|
| "UNAUTHENTICATED" in logs | Check Step 1 & 2 - need to sign in first |
| "Supabase NOT configured" | Verify environment variables in `.env` file |
| Database error in logs | Check JWT token is valid, might need re-signin |
| 0 records in database | Read full backend console - error message will explain |
| Image not in /my-content | Record exists in Supabase? (Step 5) If yes, check browser console for fetch error |

## Log Shortcut Commands

**View last 20 lines of backend output:**
```powershell
# Keep running, pipe to find the image generation logs
# Look for "🔐 AUTH:" line at the start
```

**Check if authentication line appears:**
```powershell
# Search backend console for: "authenticated (abc"
# If not found → user not signed in
```

**Verify persistence succeeded:**
```powershell
# Search backend console for: "✅ COMPLETE: Persisted"
# Count occurrences = number of images saved
```

## Timeline Expectations

| Step | Duration | What's Happening |
|------|----------|------------------|
| Step 1 | 2 min | Email sign-in |
| Step 2 | 1 min | Cookie verification |
| Step 3 | 5-30 sec | Image generation (depends on model) |
| Step 4 | 30 sec | Supabase upload + database insert |
| Steps 5-7 | 5 min | Verification in dashboard + UI |
| **Total** | **~10-40 min** | **Full flow completion** |

---

## Sample Success Output

Here's what you should see in the backend console when everything works:

```
================================================================================
🔐 AUTH: authenticated (user_abc1234...)
🎨 TOOL: generate_image_by_dalle3_openai
================================================================================

✅ 🔐 Token decoded successfully for user: user_abc1...

🖼️ Tool result: image generated successfully ![image_id: gen_abc123.png](...)

📊 PERSISTENCE CHECK:
   user_id present: True
   results count: 1

💾 Starting Supabase persistence...
   ✅ Supabase IS configured
   📤 Uploading gen_abc123.png (245821 bytes)...
   ✅ Uploaded to Storage: https://supabase...
   📱 Inserting image for user user_abc... to generated_content table
   ✅ Successfully inserted image with ID: 42

✅ COMPLETE: Persisted 1/1 images to Supabase

📤 RESPONSE: Returning 1 image(s) to frontend
```

---

## Still Not Working?

1. **Copy the entire backend console output** (from "🔐 AUTH:" line onward)
2. **Copy any error messages** shown in red
3. **Check these 3 things first:**
   - Are you signed in? (Backend should show "authenticated")
   - Is Supabase configured? (Should show "✅ Supabase IS configured")
   - Does the error message appear in the logs? (Read it carefully - it usually explains the issue)
4. **If stuck:** Share the console output and we can debug from there

---

**Ready? Start with Step 1 and work through systematically. The logs will tell you exactly what's happening at each stage.**
