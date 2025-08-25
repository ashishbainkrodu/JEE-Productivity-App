import { AppRegistry } from 'react-native';
import App from './App';

// Override mobile-only services with web-compatible ones
import './src/services/WebDatabaseService';
import './src/services/WebNotificationService';

AppRegistry.registerComponent('JEEProductivityApp', () => App);
AppRegistry.runApplication('JEEProductivityApp', {
  rootTag: document.getElementById('root'),
});
