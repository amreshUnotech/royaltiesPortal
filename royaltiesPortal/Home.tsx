import {
  Platform,
  StatusBar,
  useColorScheme,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import PingWebView from './Components/PingWebView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import {
  getFcmTokenFireBase,
  reqPostNotification,
  reQuesUserPermission,
} from './utils/Notification';
import Constants from './Constants';
import { useEffect, useRef, useState } from 'react';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import NotificationDialog from './Components/NotificationDialog';
import { getFileNameFromHeader } from './utils/fileDownload';

let removeNotificationOpenedListener: () => void = () => null;
let removeNotificationListener: () => void = () => null;
const receivedPushNotification: string[] = [];

interface HomeProps {
  uri?: string;
}

const Home: React.FC<HomeProps> = ({ uri }) => {
  const webView = useRef(null);
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState({
    title: '',
    message: '',
  });
  const isDarkMode = useColorScheme() === 'dark';

  const onInit = async (appToken?: string) => {
    notifee.createChannel({
      id: 'default',
      name: 'Default',
      importance: AndroidImportance.HIGH,
    });
    removeNotificationOpenedListener = messaging().onNotificationOpenedApp(
      (notification: any) => {
        console.log('onNotificationOpened', notification);
        if (notification) {
          // this.openNotification(notification)
        }
      },
    );

    const initialNotification = await messaging().getInitialNotification();
    console.log('initialNotification', initialNotification);

    removeNotificationListener = messaging().onMessage(
      (notification: FirebaseMessagingTypes.RemoteMessage) => {
        // Process your notification as required
        console.log(notification, 'Foreground notification');
        showMessage(notification, true);
      },
    );
    messaging().setBackgroundMessageHandler(
      async (notification: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('Home: Message handled in the background!', notification);
        await showMessage(notification);
      },
    );
    if (appToken) {
      await reQuesUserPermission(appToken); // token
    }
    const previouslyGranted = await AsyncStorage.getItem(
      Constants.keys.PUSH_PREVIOUSLY_GRANTED,
    );

    if (Platform.OS === 'android' && previouslyGranted === null) {
      await AsyncStorage.setItem(
        Constants.keys.PUSH_PREVIOUSLY_GRANTED,
        'true',
      );
    }
  };
  useEffect(() => {
    onInit();
    reqPostNotification();
    return () => {
      removeNotificationOpenedListener();
      removeNotificationListener();
    };
  }, []);

  const handleDownload = async (url: string) => {
    try {
      const headRes = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });
      if (!headRes.ok) {
        throw new Error(`HEAD request failed: ${headRes.status}`);
      }

      const contentDisposition = headRes.headers.get('content-disposition');
      let fileName = getFileNameFromHeader(contentDisposition);
      if (!fileName.endsWith('.pdf')) {
        fileName += '.pdf';
      }

      const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // Download
      const res = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        headers: {
          Accept: 'application/pdf',
        },
      }).promise;

      if (res.statusCode === 200) {
        // Open PDF with native viewer
        await FileViewer.open(localPath, { showOpenWithDialog: true });
      } else {
        Alert.alert('Download failed');
      }
    } catch (err) {
      console.error('Download error', err);
      Alert.alert('Error', 'Could not download file');
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      let message: object;
      let jsonMessage: string;
      if (data?.action === 'appToken' && data?.value) {
        onInit(data?.value);
      }
      if (data?.action === 'getDeviceToken') {
        const value = (await getFcmTokenFireBase(data?.value)) || ''; // token
        message = {
          action: 'getDeviceTokenResponse',
          key: data.key,
          value,
        };
        jsonMessage = JSON.stringify(message);
        // @ts-ignore
        webView?.current?.webview?.injectJavaScript(
          `window.postMessage('${jsonMessage}', '*');`,
        );
      }
      if (data?.action === 'download') {
        handleDownload(data.value);
      }
    } catch (error) {
      console.error('Error handling incoming message from webview: ', error);
    }
  };

  const showMessage = async (
    notification: FirebaseMessagingTypes.RemoteMessage,
    showAlert?: boolean,
  ) => {
    const strNotification = JSON.stringify(notification);
    if (receivedPushNotification.includes(strNotification)) {
      return;
    }
    receivedPushNotification.push(strNotification);

    const title = notification?.notification?.title || 'UMB';
    const body: any =
      notification?.data?.default || notification?.notification?.body || '';
    setState({
      title: title,
      message: body,
    });

    try {
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: 'default',
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (error) {
      console.error('Failed to display notification:', error);
    }
    setVisible(!!showAlert);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <PingWebView webViewRef={webView} onMessage={handleMessage} uri={uri} />
      <NotificationDialog
        visible={visible}
        onClose={() => setVisible(false)}
        title={state?.title}
        message={state?.message}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Home;
