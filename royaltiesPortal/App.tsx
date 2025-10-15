import Constants, { linking } from './Constants';
import { JSX, useEffect } from 'react';
import { RootStackParamList, UrlScreenProps } from './types/Navigation';
import * as RootNavigation from './RootNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen(): JSX.Element {
  return <Home uri={Constants.serverUrl} />;
}

function UrlScreen({ route }: UrlScreenProps): JSX.Element {
  return <Home uri={route.params?.url} />;
}

function App() {
  const handleForegroundNavigation = (event: { url: any }) => {
    try {
      RootNavigation.navigate('Url', { url: event.url });
    } catch (error) {
      console.error('Error opening foreground url: ', error);
    }
  };
  useEffect(() => {
    let urlNavigationListener = Linking.addEventListener(
      'url',
      handleForegroundNavigation,
    );
    urlNavigationListener.subscriber;
    return () => {
      urlNavigationListener.remove();
    };
  });
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking} ref={RootNavigation.navigationRef}>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            options={{ headerShown: false }}
            component={HomeScreen}
          />
          <Stack.Screen
            name="Url"
            options={{ headerShown: false }}
            component={UrlScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
