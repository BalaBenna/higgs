# Image Retrieval Testing Guide

Complete guide to testing whether images are being properly stored in and retrieved from Supabase.

## Quick Start (5 minutes)

### 1. Run Quick Verification

From the root directory, run:

**Windows:**
```bash
verify_images.bat
```

**Mac/Linux:**
```bash
./verify_images.sh
```

**Or directly:**
```bash
python verify_supabase_images.py
```

This will verify:
- ✅ Supabase configuration
- ✅ Database connection
- ✅ Image storage
- ✅ Metadata structure

### 2. Generate Some Images

If no images are found:

1. Go to `http://localhost:3001/login`
2. Sign in with email/password or Google
3. Go to `http://localhost:3001/explore`
4. Generate a few images
5. Run the verification script again

### 3. Verify in Frontend

1. Go to `http://localhost:3001/my-content`
2. Your generated images should appear
3. Try filtering by "images" type
4. Try different sorting options

---

## Detailed Test Suites

### Backend Database Tests

Test the Supabase database layer directly:

```bash
cd server
pytest tests/test_supabase_images.py -v
```

**What it tests:**
1. Supabase configuration (env vars)
2. Connection to Supabase
3. Ability to list images
4. Images grouped by user
5. Image metadata validation
6. Storage bucket access
7. User-specific image retrieval

**Example output:**
```
Test 1: Checking Supabase configuration... ✅ PASSED
Test 2: Testing Supabase connection... ✅ PASSED
Test 3: Listing generated images... ✅ PASSED: Retrieved 3 images
Test 4: Counting images per authenticated user... ✅ PASSED: Found 2 users
...
Results: 7/7 tests passed
```

### API Endpoint Tests

Test the `/api/my-content` endpoint that the frontend uses:

```bash
cd server
pytest tests/test_my_content_endpoint.py -v
```

**What it tests:**
1. Backend is running and accessible
2. Endpoint requires authentication (returns 401 without token)
3. Endpoint returns images with valid authentication token
4. Type filtering works correctly

**Example output:**
```
Test 1: Testing endpoint WITHOUT authentication... ✅ PASSED: Correctly returned 401
Test 2: Testing endpoint WITH valid authentication token... ✅ PASSED: Retrieved 2 images
Test 3: Testing endpoint with type=image filter... ✅ PASSED
...
Results: 4/4 tests passed
```

### Frontend Unit Tests

Test frontend Supabase integration:

```bash
cd app
npm run test -- my-content.test.ts
```

**What it tests:**
1. Supabase client initialization
2. Session/authentication handling
3. Image data structure validation
4. Sorting/filtering logic
5. Pagination

---

## Understanding Test Results

### ✅ All Tests Pass

This means:
- Images are properly stored in Supabase
- Authentication is working correctly
- Images can be retrieved for display
- All infrastructure is configured properly

**Next steps:**
- Test with multiple users
- Generate various image types
- Monitor Supabase usage in dashboard
- Move to production

### ⚠️ Some Tests Fail

Check the error messages:

- **"No images found in database"** → Generate images first
- **"Connection refused"** → Backend not running
- **"401 Unauthorized"** → Auth token issue
- **"Metadata validation failed"** → Database schema issue

**How to debug:**
1. Read the error message carefully
2. Check server logs for details
3. Verify `.env` configuration
4. Test each component separately

### ❌ Critical Tests Fail

Indicates a configuration or setup issue:

- **Connection failed to Supabase** → Check SUPABASE_URL
- **Auth secret not found** → Check SUPABASE_JWT_SECRET
- **Backend not running** → Start with `python main.py`

**How to fix:**
1. Verify all required env vars are set
2. Check Supabase project is accessible
3. Restart backend/frontend servers
4. Run verification script again

---

## Test Files Reference

### `server/tests/test_supabase_images.py`

**Purpose:** Test Supabase database operations directly

**Key Classes:**
- `TestSupabaseImages` - Main test class

**Test Methods:**
- `test_supabase_configured()` - Check env vars
- `test_supabase_connection()` - Can connect to DB?
- `test_list_images()` - Query works?
- `test_images_per_user()` - User grouping works?
- `test_image_metadata()` - Metadata structure valid?
- `test_storage_bucket()` - Files in storage?
- `test_image_retrieval_by_user()` - User-specific query works?

### `server/tests/test_my_content_endpoint.py`

**Purpose:** Test the API endpoint that frontend uses

**Key Classes:**
- `TestMyContentEndpoint` - API endpoint tests

**Test Methods:**
- `test_backend_connectivity()` - Backend running?
- `test_endpoint_without_auth()` - Auth required?
- `test_endpoint_with_valid_token()` - Data retrieved correctly?
- `test_endpoint_with_type_filter()` - Filtering works?

### `app/src/__tests__/my-content.test.ts`

**Purpose:** Frontend unit tests for my-content page

**Key Test Suites:**
- Configuration validation
- Session handling
- Data structure tests
- Utility function tests (sorting, filtering, pagination)

### `verify_supabase_images.py`

**Purpose:** Quick verification script for manual testing

**Functions:**
- `check_configuration()` - Verify env vars
- `check_connection()` - Test connectivity
- `list_recent_images()` - Show recent data
- `check_user_images()` - User statistics
- `check_storage()` - Storage bucket check
- `verify_metadata()` - Metadata validation

---

## Step-by-Step Testing Workflow

### Step 1: Verify Configuration

```bash
python verify_supabase_images.py
```

Expected output:
```
✅ SUPABASE_URL: https://your-project.supabase.co
✅ Connected to Supabase
```

If this fails → Check `.env` file configuration

### Step 2: Generate Test Data

1. Sign in at `http://localhost:3001/login`
2. Generate 2-3 images at `http://localhost:3001/explore`
3. Check backend logs for:
   ```
   ✅ Persisted X/Y images to Supabase
   ```

### Step 3: Run Full Test Suite

```bash
# Backend tests
cd server
pytest tests/test_supabase_images.py -v

# API endpoint tests
pytest tests/test_my_content_endpoint.py -v

# Frontend tests
cd ../app
npm run test -- my-content.test.ts
```

### Step 4: Verify in Frontend

Visit `http://localhost:3001/my-content` and verify:
- ✅ Your generated images appear
- ✅ Images show correct prompts/models
- ✅ Images are sorted by date
- ✅ Filtering works (type=image/video)

### Step 5: Advanced Testing

Try these scenarios:
- Generate images as different users → Verify each user sees only their images
- Generate videos → Verify both image and video retrieval
- Check Supabase Dashboard → Verify data is actually stored
- Test on mobile → Verify responsive design
- Test in incognito → Verify no client-side cache issues

---

## Troubleshooting Guide

### Nothing appears in my-content page

**Check these in order:**

1. **Are you signed in?**
   - Check `http://localhost:3001/login`
   - Ensure you see your profile/signed-in state

2. **Did you generate images?**
   - Go to `http://localhost:3001/explore`
   - Generate at least one image
   - Check backend logs for success message

3. **Check backend logs:**
   ```
   🔑 optional_auth: Authenticated user abc12345...
   ✅ Persisted X/Y images to Supabase
   ```

4. **Run verification script:**
   ```bash
   python verify_supabase_images.py
   ```

5. **Check Supabase Dashboard:**
   - Go to SQL Editor
   - Run: `SELECT * FROM generated_content WHERE user_id = 'your-id';`

### API returns 401 Unauthorized

**Causes:**
- Not signed in
- Sign-in session expired
- Auth headers not being sent
- JWT token invalid

**Solution:**
1. Go to `/login` and sign in again
2. Check browser DevTools → Application → Cookies
3. Look for `sb-*` cookies
4. Check Network tab → API calls have `Authorization` header

### Backend connection refused

**Causes:**
- Backend not running
- Wrong port number
- Firewall blocking

**Solution:**
```bash
# Kill any existing processes
taskkill /F /IM python.exe

# Start fresh
cd server
python main.py
```

### No images in database

**This is normal if you just started!**

To populate:
1. Sign in at `http://localhost:3001/login`
2. Generate images at `http://localhost:3001/explore`
3. Wait for them to complete
4. Run `python verify_supabase_images.py`

### Metadata looks invalid

**Check database schema:**
```bash
# In Supabase SQL Editor:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'generated_content';
```

Metadata should be `text` or `jsonb` type.

---

## Command Reference

| Task | Command |
|------|---------|
| Quick verify | `python verify_supabase_images.py` |
| Backend tests | `cd server && pytest tests/test_supabase_images.py -v` |
| API endpoint tests | `cd server && pytest tests/test_my_content_endpoint.py -v` |
| Frontend tests | `cd app && npm run test -- my-content.test.ts` |
| Start backend | `cd server && python main.py` |
| Start frontend | `cd app && npm run dev` |
| View Supabase | Open dashboard at supabase.com |
| Check logs | Look at server terminal output |

---

## Success Indicators

You'll know everything is working when:

1. ✅ `verify_supabase_images.py` shows all checks passed
2. ✅ All pytest tests pass with green checkmarks
3. ✅ Images appear in `http://localhost:3001/my-content`
4. ✅ Supabase Dashboard shows images in `generated_content` table
5. ✅ Multiple users can generate images independently
6. ✅ Images persist across browser sessions
7. ✅ Images are accessible via Supabase Storage URLs

---

## Next Steps

After all tests pass:

- [ ] Test with real users (not just you)
- [ ] Generate various image types and styles
- [ ] Test on different devices/browsers
- [ ] Monitor Supabase usage metrics
- [ ] Set up backup strategy
- [ ] Plan for scaling
- [ ] Consider CDN for storage

---

## Support

If tests fail:

1. Check the error message
2. Read the "Troubleshooting Guide" above
3. Review server logs for details
4. Check Supabase Dashboard configuration
5. Verify all environment variables are set correctly
6. Try restarting servers with fresh state

**Debug command:**
```bash
# Get detailed backend logs
cd server
python main.py 2>&1 | tee debug.log
```

Then share the `debug.log` output for support.
