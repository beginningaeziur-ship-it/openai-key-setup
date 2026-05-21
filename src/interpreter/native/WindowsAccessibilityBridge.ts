// ── Windows Accessibility Bridge ───────────────────────────────────────────────
// Routes accessibility calls through window.aria (Electron preload context bridge).
// Mirrors the Android NativeAccessibilityBridge interface so the engine code
// doesn't need to know which platform it's running on.

import type {
  NativeScreenContent,
  NativeElement,
  NativeActionResult,
  AppInfo,
  ContactInfo,
} from './AccessibilityBridgePlugin';

// window.aria is injected by electron/preload.ts — not available outside Electron
type AriaBridge = typeof window.aria;

function getBridge(): AriaBridge | null {
  if (typeof window !== 'undefined' && 'aria' in window && (window as Window & { aria?: AriaBridge }).aria?.isElectron) {
    return (window as Window & { aria: AriaBridge }).aria;
  }
  return null;
}

// ── Adapter helpers — map Electron types → shared NativeElement type ──────────

function toNativeElement(el: {
  id: string; name: string; role: string; value?: string;
  isEnabled: boolean; isFocused: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
} | null): NativeElement | null {
  if (!el) return null;
  return {
    id: el.id,
    label: el.name,
    role: el.role,
    value: el.value,
    isEnabled: el.isEnabled,
    isFocused: el.isFocused,
    bounds: el.bounds,
  };
}

function toNativeScreenContent(data: {
  appName: string; windowTitle: string;
  elements: Array<{ id: string; name: string; role: string; value?: string; isEnabled: boolean; isFocused: boolean; bounds?: { x: number; y: number; width: number; height: number }; }>;
  rawText: string;
}): NativeScreenContent {
  return {
    packageName: data.appName,
    appName: data.windowTitle,
    elements: data.elements.map(e => toNativeElement(e)!).filter(Boolean),
    rawText: data.rawText,
  };
}

// ── WindowsAccessibilityBridge ─────────────────────────────────────────────────

export class WindowsAccessibilityBridge {
  private screenChangeListeners: Array<(content: NativeScreenContent) => void> = [];
  private initialized = false;

  get isAvailable(): boolean {
    return getBridge() !== null;
  }

  async init(): Promise<boolean> {
    if (this.initialized) return this.isAvailable;
    this.initialized = true;
    return this.isAvailable;
  }

  // ── Screen Reading ─────────────────────────────────────────────────────────

  async getScreenContent(): Promise<NativeScreenContent | null> {
    const bridge = getBridge();
    if (!bridge) return null;
    try {
      const data = await bridge.getScreenContent();
      return toNativeScreenContent(data);
    } catch {
      return null;
    }
  }

  async getFocusedElement(): Promise<NativeElement | null> {
    const bridge = getBridge();
    if (!bridge) return null;
    try {
      const el = await bridge.getFocusedElement();
      return toNativeElement(el);
    } catch {
      return null;
    }
  }

  // ── UI Automation ──────────────────────────────────────────────────────────

  async clickElement(label: string): Promise<NativeActionResult> {
    const bridge = getBridge();
    if (!bridge) return { success: false, message: 'Windows bridge not available' };
    try {
      return await bridge.clickElement(label);
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Click failed' };
    }
  }

  async typeText(text: string): Promise<NativeActionResult> {
    const bridge = getBridge();
    if (!bridge) return { success: false, message: 'Windows bridge not available' };
    try {
      return await bridge.typeText(text);
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Type failed' };
    }
  }

  async scroll(direction: 'up' | 'down'): Promise<NativeActionResult> {
    const bridge = getBridge();
    if (!bridge) return { success: false, message: 'Windows bridge not available' };
    try {
      return direction === 'down' ? await bridge.scrollDown() : await bridge.scrollUp();
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Scroll failed' };
    }
  }

  async pressKey(key: string): Promise<NativeActionResult> {
    const bridge = getBridge();
    if (!bridge) return { success: false, message: 'Windows bridge not available' };
    try {
      return await bridge.pressKey(key);
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Key press failed' };
    }
  }

  // ── App Control ────────────────────────────────────────────────────────────

  async getInstalledApps(): Promise<AppInfo[]> {
    const bridge = getBridge();
    if (!bridge) return [];
    try {
      const apps = await bridge.getInstalledApps();
      return apps.map(a => ({ name: a.name, packageName: a.appId, path: a.path }));
    } catch {
      return [];
    }
  }

  async launchApp(nameOrPath: string): Promise<NativeActionResult> {
    const bridge = getBridge();
    if (!bridge) return { success: false, message: 'Windows bridge not available' };
    try {
      return await bridge.launchApp(nameOrPath);
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Launch failed' };
    }
  }

  async getCurrentApp(): Promise<{ packageName: string; appName: string } | null> {
    const bridge = getBridge();
    if (!bridge) return null;
    try {
      const app = await bridge.getCurrentApp();
      if (!app) return null;
      return { packageName: app.name, appName: app.windowTitle };
    } catch {
      return null;
    }
  }

  // ── Contacts (Windows Contacts app / People) ───────────────────────────────
  // Windows doesn't expose contacts via a simple API — returns empty.
  // Could be wired to Windows.ApplicationModel.Contacts WinRT in future.

  async getContacts(): Promise<ContactInfo[]> {
    return [];
  }

  async findContact(_name: string): Promise<ContactInfo | null> {
    return null;
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  // Could be wired to Windows.UI.Notifications WinRT in future.

  async getNotifications(): Promise<Array<{ app: string; title: string; text: string }>> {
    return [];
  }

  // ── Speech (Windows SAPI) ──────────────────────────────────────────────────

  async speak(text: string, voice?: string): Promise<NativeActionResult> {
    const bridge = getBridge();
    if (!bridge) return { success: false, message: 'Windows bridge not available' };
    return bridge.speak(text, voice);
  }

  stopSpeech(): void {
    getBridge()?.stopSpeech();
  }

  // ── Event Listening ────────────────────────────────────────────────────────

  onScreenChange(callback: (content: NativeScreenContent) => void): () => void {
    this.screenChangeListeners.push(callback);
    return () => {
      this.screenChangeListeners = this.screenChangeListeners.filter(l => l !== callback);
    };
  }
}

// Singleton
export const windowsBridge = new WindowsAccessibilityBridge();
