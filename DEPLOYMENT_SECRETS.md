# Deployment Secrets Configuration

For GitHub Pages deployment to work with Firebase, you need to add the following secrets to your repository:

## Firebase Adapter Mode

The application now uses a Firebase adapter that can operate in two modes:

- **Enabled mode**: When `VITE_FIREBASE_ENABLED=true` and all required env vars are present, the app connects to Firebase Realtime Database
- **Mock/Disabled mode**: When `VITE_FIREBASE_ENABLED` is not set to `'true'` or required env vars are missing, the app uses an in-memory + localStorage mock. This is safe for development and automated editing environments like Spark.

## How to Add Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add each secret below:

## Required Secrets

| Secret Name | Description |
|------------|-------------|
| `VITE_FIREBASE_ENABLED` | Set to `true` to enable Firebase, or `false` to use mock mode |
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (e.g., your-project.firebaseapp.com) |
| `VITE_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

## Security Notes

- ⚠️ **NEVER** commit `.env.local` to git
- ✅ The `.gitignore` file is configured to exclude environment files
- ✅ Secrets are encrypted and only accessible during GitHub Actions builds
- 🔄 If credentials are ever exposed, regenerate them in Firebase Console immediately
- 🛡️ When allowing Spark or other automated editors to edit code, set `VITE_FIREBASE_ENABLED=false` to prevent accidental writes to production

## Local Development

For local development:
1. Copy `.env.example` to `.env.local`
2. Set `VITE_FIREBASE_ENABLED=true` to enable Firebase
3. Fill in your Firebase configuration values
4. The file will be ignored by git automatically

For safe local editing without Firebase:
1. Copy `.env.example` to `.env.local`
2. Set `VITE_FIREBASE_ENABLED=false` (or omit it)
3. The app will use mock mode with localStorage persistence

## Verifying Secrets

After adding secrets, push a commit to trigger the GitHub Actions workflow. Check:
- ✅ Build completes successfully
- ✅ Deployed site connects to Firebase (if enabled)
- ✅ No environment variable errors in browser console
