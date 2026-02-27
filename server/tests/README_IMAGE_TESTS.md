# Image Retrieval Test Suite

This directory contains comprehensive tests to verify that images are properly being stored in and retrieved from Supabase.

## Quick Start

### Option 1: Quick Verification (Recommended)

Run the quick verification script from the root directory:

```bash
python verify_supabase_images.py
```

This will:
- ✅ Check Supabase configuration
- ✅ Test connection to Supabase
- ✅ List recent images
- ✅ Show images per user
- ✅ Check storage bucket
- ✅ Validate metadata structure

### Option 2: Run Backend Tests

Test the Supabase database layer:

```bash
cd server
pytest tests/test_supabase_images.py -v
```

This tests:
1. **Supabase Configuration** - Verify env vars are set
2. **Connection** - Can we connect to Supabase?
3. **List Images** - Can we retrieve images from the database?
4. **Images Per User** - How many images does each user have?
5. **Image Metadata** - Is metadata properly formatted?
6. **Storage Bucket** - Are files in Supabase Storage?
7. **User Retrieval** - Can we retrieve images for a specific user?

### Option 3: Test API Endpoint

Test the `/api/my-content` backend endpoint:

```bash
cd server
pytest tests/test_my_content_endpoint.py -v
```

This tests:
1. **Backend Connectivity** - Is the backend running?
2. **Endpoint Without Auth** - Correctly returns 401?
3. **Endpoint With Valid Token** - Can retrieve images when authenticated?
4. **Type Filtering** - Can filter by image/video type?

### Option 4: Run Frontend Tests

Test frontend Supabase integration:

```bash
cd app
npm run test -- my-content.test.ts
```

This tests:
- Supabase client configuration
- Session handling
- Image metadata structure
- Sorting and filtering
- Pagination

## Test Results Interpretation

### ✅ All Tests Pass
- Images are properly stored in Supabase
- Authentication is working
- Images can be retrieved correctly
- Everything is configured properly

### ⚠️ Some Tests Fail
- Check the error messages
- Verify Supabase configuration
- Ensure you've generated images while logged in
- Check server logs for detailed errors

### ❌ Critical Tests Fail
- Supabase connection issues
- Missing environment variables
- Backend not running
- Database schema issues

## Troubleshooting

### "No images found in database"

This is the most common scenario. To populate the database:

1. **Sign in** at `http://localhost:3001/login`
   - Use email/password or Google OAuth
2. **Generate images** at `http://localhost:3001/explore`
3. **Wait for generation** to complete
4. **Check backend logs** for success message
5. **Run tests again**

### "Connection refused to backend"

Make sure both servers are running:

```bash
# Terminal 1: Backend
cd d:\higgs\server
python main.py

# Terminal 2: Frontend
cd d:\higgs\app
npm run dev
```

### "Authentication token invalid"

The JWT token might be expired or invalid:
- Make sure you're signed in
- Check that `SUPABASE_JWT_SECRET` is set in server/.env
- Try signing out and back in

### "403 Forbidden from Storage"

RLS (Row-Level Security) might be blocking access:
- Check Supabase Storage bucket RLS policies
- Verify user_id in metadata matches authenticated user

## What Each Test File Does

### `test_supabase_images.py`
Backend database tests for Supabase integration. Tests the core functionality of storing and retrieving images.

**Key Parts:**
- `_decode_token()` - Verify JWT validation works
- `test_list_images()` - Can we query the database?
- `test_images_per_user()` - How many images per authenticated user?
- `test_storage_bucket()` - Are files in Supabase Storage?

### `test_my_content_endpoint.py`
API endpoint tests for the `/api/my-content` route. Tests the full request/response cycle.

**Key Parts:**
- Backend connectivity check
- Authentication validation
- Token-based retrieval
- Type filtering

### `my-content.test.ts`
Frontend unit tests for the my-content page. Tests client-side Supabase operations.

**Key Parts:**
- Supabase client setup
- Session management
- Image data validation
- Sorting/filtering logic

## Environment Variables Needed

For tests to work, ensure these are set in `server/.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_ANON_KEY=your-anon-key
```

And in `app/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
BACKEND_URL=http://127.0.0.1:57989
```

## Expected Behavior After Tests Pass

1. ✅ Images generate without errors
2. ✅ Images save to Supabase Storage
3. ✅ Image metadata stored in database
4. ✅ Users can sign in and see their images
5. ✅ Images persist across sessions
6. ✅ Multiple users can have separate image galleries

## Debug Tips

### Check backend logs for:
```
🔑 optional_auth: Authenticated user abc12345...
🖼️ Tool result: image generated successfully...
✅ Persisted X/Y images to Supabase
```

### Check Supabase Dashboard:
1. **Authentication** → See list of signed-up users
2. **SQL Editor** → Query `SELECT * FROM generated_content LIMIT 10`
3. **Storage** → Browse generated-content bucket
4. **RLS Policies** → Check policies allow access

### Check frontend console:
- Network tab for API calls to `/api/my-content`
- Console for Supabase SDK messages
- Application tab to see stored session

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No images in database | Sign in and generate images first |
| 401 Unauthorized | Check auth token is being sent with request |
| CORS errors | Verify proxy in next.config.js is correct |
| RLS blocking access | Check Supabase Storage RLS policies |
| Connection timeout | Verify SUPABASE_URL is correct |
| JWT validation failed | Check SUPABASE_JWT_SECRET is set correctly |

## Next Steps

After verifying images are working:

1. ✅ Test with multiple users
2. ✅ Generate different types of images
3. ✅ Test on mobile/different browsers
4. ✅ Load test with many images
5. ✅ Monitor Supabase usage

---

**Need help?** Check the backend logs or run `verify_supabase_images.py` for diagnostic info.
