import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()
    
    // // Set Messaging and Notification delegates
    UNUserNotificationCenter.current().delegate = self as UNUserNotificationCenterDelegate
    Messaging.messaging().delegate = self as MessagingDelegate

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "royaltiesPortal",
      in: window,
      launchOptions: launchOptions
    )

    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
      print("Permission granted: \(granted)")
    }
    
    application.registerForRemoteNotifications()

    RNSplashScreen.show();
    return true
  }

   func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    // Pass token to Firebase Messaging and to RNCPushNotificationIOS
    let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
    let tokenString = tokenParts.joined()
    print("Did register for remote notifications with device token: \(tokenString)")
    Messaging.messaging().apnsToken = deviceToken
    // Forward to RNCPushNotificationIOS (Objective-C bridge)
    RNCPushNotificationIOS.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
  }

  func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
    print("Failed to register for remote notifications: \(error.localizedDescription)")
    RNCPushNotificationIOS.didFailToRegisterForRemoteNotificationsWithError(error)
  }

  func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable: Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    print("Received remote notification: \(userInfo)")
    RNCPushNotificationIOS.didReceiveRemoteNotification(userInfo)
    completionHandler(.newData)
  }

  // MARK: - UNUserNotificationCenterDelegate
  func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    let userInfo = notification.request.content.userInfo
    print("Will present notification: \(userInfo)")
    // Let RNCPushNotificationIOS handle it and show alert/badge/sound
    RNCPushNotificationIOS.didReceiveRemoteNotification(userInfo)
    completionHandler([.alert, .badge, .sound])
  }

  func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
    let userInfo = response.notification.request.content.userInfo
    print("Did receive notification response: \(userInfo)")
    RNCPushNotificationIOS.didReceiveNotificationResponse(response)
    completionHandler()
  }

  func application(
  _ application: UIApplication,
  continue userActivity: NSUserActivity,
  restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
