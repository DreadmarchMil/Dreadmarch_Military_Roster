# Dreadmarch Military Roster

A personnel management database for tracking characters and NPCs across multiple military units in a Star Wars Sith Empire roleplay community (Dreadmarch). Designed to feel like an authentic in-universe Imperial database terminal.

![License](https://img.shields.io/badge/license-MIT-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-91.6%25-blue.svg)

## 🎯 Features

- **Unit Management** - Switch between different military units to view and manage unit-specific rosters
- **Role-Based Access Control** - Toggle between Player (read-only) and GM (full editing) modes
- **Personnel CRUD Operations** - Add, view, edit, and delete character/NPC entries
- **Immersive Sith Empire Theme** - Dark interface with crimson accents inspired by Star Wars Imperial aesthetics
- **Persistent Storage** - Unit selections and roster data persist between sessions

## 🚀 Live Demo

Visit the live application: [Dreadmarch Military Roster](https://dreadmarchmil.github.io/Dreadmarch_Military_Roster/)

## 🛠️ Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 with custom Imperial theme
- **UI Components:** Radix UI primitives
- **Icons:** Phosphor Icons
- **State Management:** React hooks with localStorage

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/DreadmarchMil/Dreadmarch_Military_Roster.git

# Navigate to project directory
cd Dreadmarch_Military_Roster

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Environment Configuration

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Firebase configuration:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `dreadmarch-military-rost-88c4e`
   - Go to Project Settings → Your apps → Web app
   - Copy the configuration values

3. Fill in `.env.local` with your Firebase config values

4. **Never commit `.env.local` to git!** It's already in `.gitignore`.

### Deployment

For GitHub Pages deployment, see [DEPLOYMENT_SECRETS.md](DEPLOYMENT_SECRETS.md) for instructions on setting up repository secrets.

### Security

⚠️ If Firebase credentials are ever exposed publicly:
1. Go to Firebase Console → Project Settings
2. Rotate your API keys
3. Update your secrets in GitHub and `.env.local`
4. Redeploy the application

## 🔥 Firebase Setup

This application uses Firebase Realtime Database for multi-GM collaboration. Follow these steps to set up your own Firebase instance:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `dreadmarch-military-roster`
4. Follow the setup wizard

### 2. Enable Realtime Database

1. In your Firebase project, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose a location close to your users
4. Start in **test mode** for development (secure it later)

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`)
4. Register your app
5. Copy the `firebaseConfig` values

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration values
3. Never commit `.env.local` to git

### 5. Deploy with Environment Variables

For GitHub Pages deployment, add your Firebase config as repository secrets:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add each environment variable as a secret:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 6. Update GitHub Actions Workflow

The deploy workflow will automatically use these secrets to build with Firebase configuration.

### Security Rules (Important!)

Once you're ready for production, update your Firebase Realtime Database rules:

```json
{
  "rules": {
    ".read": true,
    ".write": "auth != null"
  }
}
```

For a more secure setup with GM authentication, consider implementing Firebase Authentication.

## 🎨 Design Philosophy

The interface evokes the cold, calculated aesthetic of Sith Empire technology with:
- Deep blacks and crimson red accents
- Sharp geometric forms
- Monospace typography (JetBrains Mono)
- Technical, precise animations
- Military database terminal feel

## 📖 Usage

### For Players
- Switch between units using the dropdown selector
- Click on personnel entries to view detailed information
- View-only access ensures data integrity

### For GMs
- Toggle to GM mode using the role button in the header
- Add new personnel with the "Add Personnel" button
- Edit existing entries by clicking edit icons
- Delete entries with confirmation prompts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Built with [GitHub Spark](https://githubnext.com/projects/spark)
- Inspired by Star Wars: The Old Republic
- UI components powered by Radix UI

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

*May the Force serve you well, Imperial officer.*
