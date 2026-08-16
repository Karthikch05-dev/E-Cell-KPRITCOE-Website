# E-Cell KPRIT-COE Deployment Checklist ✅

## Project Overview
This is a full-stack application built with:
- **Frontend**: React 19 + Vite + React Router
- **Backend**: Supabase Functions (Edge Functions)
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (with Supabase integration)

## Pre-Deployment Checklist

### 1. ✅ Code Quality & Build
- [x] Build completes successfully (`npm run build`)
- [x] No TypeScript/Lint errors
- [x] All dependencies installed correctly
- [x] Supabase functions implemented
- [x] Form validation added

### 2. ✅ Environment Variables Setup

#### Client Environment Variables
Required environment variables for `Client/.env`:
```
VITE_SUPABASE_URL=https://pldeudjuokrwhzungmgs.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_X6iRAYyrabRIQYfeP8qn3w_7RbshTJI
```

#### Supabase Edge Function Environment Variables
For the `send-registration-email` function, configure in Supabase dashboard:
```
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Note**: These should be set in Supabase Project Settings → Edge Functions

### 3. ✅ Database Setup
Ensure your Supabase database has the following tables:

#### `events` table
```sql
- id (UUID, primary key)
- title (text)
- description (text)
- event_date (timestamp)
- event_time (time)
- location (text)
- image_url (text, optional)
- created_at (timestamp)
```

#### `registrations` table
```sql
- id (UUID, primary key)
- full_name (text)
- email (text)
- phone (text)
- college (text)
- year (text)
- department (text)
- event (text)
- team_size (integer)
- created_at (timestamp)
```

### 4. ✅ Supabase Configuration

#### Edge Functions
- [x] `send-registration-email` function deployed with proper environment variables

#### Row Level Security (RLS)
Recommended policies:
- `events` table: Public read access, authenticated write access
- `registrations` table: Authenticated access only

#### API Keys
- [x] Supabase URL configured
- [x] Supabase publishable key configured

### 5. ✅ Features Implemented

#### Registration Form
- [x] Client-side validation (email, phone, required fields)
- [x] Server-side registration to database
- [x] Confirmation email sent via Supabase Edge Function
- [x] Error handling and user feedback
- [x] Success notification

#### Event Management
- [x] Event listing on home page
- [x] Event details page with registration link
- [x] Event filtering and sorting
- [x] Event card previews

#### User Experience
- [x] Responsive design (mobile, tablet, desktop)
- [x] Loading states
- [x] Error notifications
- [x] Success messages
- [x] Navigation between pages

### 6. ✅ Performance & Optimization
- [x] Build size optimized (CSS: 6.22kB gzip, JS: 131.26kB gzip)
- [x] React optimizations applied
- [x] No console errors

### 7. ✅ Security Considerations
- [x] Environment variables not exposed
- [x] Sensitive data properly handled
- [x] CORS configured (if needed)
- [x] Input validation on client and function
- [x] Email validation
- [x] Phone validation

## Deployment Steps

### Step 1: Prepare Vercel Deployment
1. Ensure `.gitignore` is properly configured
2. Verify `vercel.json` is correct:
   ```json
   {
     "version": 2,
     "installCommand": "cd Client && npm install",
     "buildCommand": "cd Client && npm run build",
     "outputDirectory": "Client/dist",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables on Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Step 4: Verify Deployment
1. Check the deployed URL
2. Test registration form
3. Verify email sending works
4. Test navigation and event listing
5. Check mobile responsiveness

### Step 5: Deploy Supabase Functions
```bash
# From project root
supabase functions deploy send-registration-email
```

Or use Supabase CLI:
```bash
# Deploy all functions
supabase functions deploy
```

## Post-Deployment Verification

### Testing Checklist
- [ ] Home page loads correctly
- [ ] Navigation works
- [ ] Events display properly
- [ ] Event details page loads
- [ ] Registration form submits
- [ ] Confirmation email received
- [ ] Error handling works
- [ ] Mobile view is responsive
- [ ] All images load correctly
- [ ] Database records are created

### Monitoring
- Monitor Vercel deployment logs for errors
- Check Supabase Function logs for email sending issues
- Monitor database for registration records

## Troubleshooting

### Registration Not Working
1. Check Supabase connection in browser console
2. Verify environment variables are set
3. Check Supabase database table permissions
4. Verify registration table exists

### Emails Not Sending
1. Check Supabase Edge Function logs
2. Verify Resend API key is set correctly
3. Check email sender address is configured
4. Verify email validation passed

### Build Failures
1. Clear `node_modules` and reinstall: `npm install`
2. Clear Vite cache: `npm run build -- --clear`
3. Check for TypeScript errors: `npx tsc --noEmit`

### Deployment Issues
1. Check Vercel logs for build errors
2. Verify all environment variables are set
3. Check GitHub sync is working
4. Verify Supabase functions are deployed

## Resources
- [Vercel Deployment](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [Resend Email Service](https://resend.com)

## Support
For issues or questions:
1. Check this deployment checklist
2. Review Vercel logs
3. Check Supabase logs
4. Review console errors in browser DevTools
