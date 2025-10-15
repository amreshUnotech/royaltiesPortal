import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REGISTER_DEVICE } from '../Components/services/graphql/registerDevice';
import createApolloClient from '../Components/services/graphql/client';
import { Platform, PermissionsAndroid } from 'react-native';

// token device ios
export const reQuesUserPermission = async (accessToken?: string) => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled && accessToken) {
    await getFcmTokenFireBase(accessToken);
  }
};

// // get token device
export const getFcmTokenFireBase = async (
  accessToken: string,
): Promise<string | null> => {
  let tokenDevice = await AsyncStorage.getItem('fcmToken');

  if (accessToken) {
    try {
      tokenDevice = await messaging().getToken();
      console.log('tokenDevice', tokenDevice);

      if (tokenDevice) {
        await AsyncStorage.setItem('fcmToken', tokenDevice);
        // Initialize Apollo Client
        const client = createApolloClient(accessToken);

        // Send mutation
        await client.mutate({
          mutation: REGISTER_DEVICE,
          variables: {
            deviceToken: tokenDevice,
            deviceType: Platform.OS.toUpperCase(),
          },
        });
        console.log('token register success', tokenDevice);
      }
    } catch (e) {
      await AsyncStorage.removeItem('fcmToken');
      console.log('error:', JSON.stringify(e, null, 2));
      console.log('error', e);
    }
  }

  return tokenDevice;
};

export const reqPostNotification = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};
