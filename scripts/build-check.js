const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build compatibility...');

// Check for mobile-only imports
const mobileOnlyImports = [
  'react-native-sqlite-storage',
  'react-native-push-notification',
  'react-native-vector-icons',
  'react-native-chart-kit',
  'react-native-svg',
];

const sourceFiles = [
  'App.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/AnalyticsScreen.tsx',
  'src/screens/CalendarScreen.tsx',
  'src/screens/SubjectsScreen.tsx',
  'src/screens/SettingsScreen.tsx',
];

let hasErrors = false;

sourceFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    mobileOnlyImports.forEach(importName => {
      if (content.includes(importName) && !content.includes('isWeb')) {
        console.error(`❌ ${file}: Direct import of ${importName} without web check`);
        hasErrors = true;
      }
    });
  }
});

// Check web components exist
const webComponents = [
  'src/components/WebIcon.tsx',
  'src/components/WebChart.tsx',
  'src/services/WebDatabaseService.ts',
  'src/services/WebNotificationService.ts',
];

webComponents.forEach(component => {
  const componentPath = path.join(__dirname, '..', component);
  if (!fs.existsSync(componentPath)) {
    console.error(`❌ Missing web component: ${component}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\n🚨 Build compatibility check failed!');
  process.exit(1);
} else {
  console.log('✅ All compatibility checks passed!');
  console.log('🚀 Ready for Vercel deployment!');
}
