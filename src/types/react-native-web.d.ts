declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  export default class MaterialIcons extends Component<IconProps> {}
}

declare module 'react-native-sqlite-storage' {
  export default class SQLite {
    static openDatabase(config: any): any;
  }
}

declare module 'react-native-push-notification' {
  export default class PushNotification {
    static configure(options: any): void;
    static localNotification(details: any): void;
    static requestPermissions(permissions?: string[]): Promise<any>;
  }
}
