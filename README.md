# JEE Productivity App

A React Native productivity app for JEE students, now with web support!

## Features

- 📱 **Mobile App**: React Native app for iOS and Android
- 🌐 **Web App**: Now available as a web application
- 📊 Analytics and Progress Tracking
- 📅 Calendar Management
- 📚 Subject Management
- 🎨 Dark/Light Theme Support

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd JEEProductivityApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

### Web Version (Recommended for quick access)

1. **Start the development server:**
   ```bash
   npm run web
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

### Mobile Version

1. **Start Metro bundler:**
   ```bash
   npm start
   ```

2. **Run on Android:**
   ```bash
   npm run android
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

## Building for Production

### Web Build

```bash
npm run build:web
```

The built files will be in the `dist/` folder.

### Mobile Build

Follow React Native's standard build process for your target platform.

## Deployment

### GitHub Pages (Free Hosting)

1. **Enable GitHub Pages** in your repository settings
2. **Push to main branch** - the GitHub Action will automatically deploy
3. **Your app will be available at:** `https://<username>.github.io/<repo-name>`

### Other Hosting Options

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder
- **Firebase Hosting**: Use Firebase CLI to deploy

## Project Structure

```
JEEProductivityApp/
├── src/
│   ├── contexts/          # React contexts (Theme, etc.)
│   ├── screens/           # App screens
│   ├── services/          # API and database services
│   ├── theme/             # Theme configuration
│   └── types/             # TypeScript type definitions
├── public/                # Web assets
├── index.web.js           # Web entry point
├── webpack.config.js      # Web build configuration
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run web` - Start web development server
- `npm run build:web` - Build web app for production
- `npm start` - Start React Native Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS

## Technologies Used

- **Frontend**: React Native, React Native Web
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Build Tool**: Webpack
- **Language**: TypeScript

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.
