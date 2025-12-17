# Deployment Secrets Configuration

For GitHub Pages deployment to work with Firebase, you need to add the following secrets to your repository:

## How to Add Secrets

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add each secret below:

## Required Secrets

| Secret Name | Description |
|------------|-------------|
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

## Local Development

For local development:
1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration values
3. The file will be ignored by git automatically

## Verifying Secrets

After adding secrets, push a commit to trigger the GitHub Actions workflow. Check:
- ✅ Build completes successfully
- ✅ Deployed site connects to Firebase
- ✅ No environment variable errors in browser console
