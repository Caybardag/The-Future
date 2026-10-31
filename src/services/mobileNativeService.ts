import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

/**
 * Mobile Native Integration Service for Android & Google Play
 * Safely guards all native calls so the app works identically on web browsers and native Android.
 */

export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
};

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Initializes Android StatusBar and hides native Splash Screen smoothly.
 */
export async function initializeNativeMobile(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Hide splash screen after webview finishes initial render
    await SplashScreen.hide();
  } catch (err) {
    console.debug("[Native] SplashScreen.hide bypassed:", err);
  }

  try {
    // Configure dark status bar matching the deep space theme
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#060a14" });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    console.debug("[Native] StatusBar configuration bypassed:", err);
  }
}

/**
 * Subscribes to the Android hardware Back Button.
 * @param handler Callback returning true if back action was handled (e.g. closed a modal or view), or false to let native default happen.
 */
export function setupAndroidBackButton(handler: () => boolean): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const listenerPromise = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
    const wasHandled = handler();
    if (!wasHandled) {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
    }
  });

  return () => {
    listenerPromise.then((handle) => handle.remove()).catch(() => {});
  };
}
