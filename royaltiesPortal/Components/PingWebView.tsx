import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import SplashScreen from 'react-native-splash-screen';
import { useEffect, useState } from 'react';

const RenderWebView = ({ webViewRef, onWebViewMessage, uri }: any) => {
  const [canGoBack, setCanGoBack] = useState(false);
  const onNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  const injectedJS = `
  (function() {
    window.IS_REACT_NATIVE_WEBVIEW = ${Platform.OS === 'ios'}
    const anchors = document.getElementsByTagName('a');
    for (let i = 0; i < anchors.length; i++) {
      anchors[i].setAttribute('target', '_self');
      anchors[i].addEventListener('click', function(e) {
        e.preventDefault();
        window.location = this.href;
      });
    }
  })();
  true; // Required for the script to evaluate correctly
`;

  return (
    <WebView
      ref={webViewRef}
      source={{ uri }}
      onNavigationStateChange={onNavigationStateChange}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      injectedJavaScriptBeforeContentLoaded={injectedJS}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      onLoadEnd={() => {
        SplashScreen.hide();
      }}
      onShouldStartLoadWithRequest={() => {
        // Always allow the webview to navigate internally
        // (Prevents links from opening in an external browser)
        return true;
      }}
      pullToRefreshEnabled={true}
      setSupportMultipleWindows={false}
      onMessage={onWebViewMessage}
    />
  );
};

export const PingWebView = ({ webViewRef, onMessage, uri }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    webViewRef?.current?.reload();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const onWebViewMessage = async (event: any) => {
    if (onMessage) {
      event?.persist && event.persist();
    }

    if (onMessage) {
      onMessage!(event);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {Platform.OS === 'ios' ? (
        <ScrollView
          scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentStyle}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <RenderWebView
            webViewRef={webViewRef}
            onWebViewMessage={onWebViewMessage}
            uri={uri}
          />
        </ScrollView>
      ) : (
        <RenderWebView
          webViewRef={webViewRef}
          onWebViewMessage={onWebViewMessage}
          uri={uri}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  contentStyle: { flex: 1 },
});

export default PingWebView;
