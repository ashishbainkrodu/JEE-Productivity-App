import { AppRegistry } from 'react-native';
import App from './App';

// No problematic service imports - using simple data service only
AppRegistry.registerComponent('JEEProductivityApp', () => App);
AppRegistry.runApplication('JEEProductivityApp', {
  rootTag: document.getElementById('root'),
});
