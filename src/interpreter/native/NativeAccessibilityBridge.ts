// ── Native Accessibility Bridge — Runtime wrapper ─────────────────────────────
// Detects platform at runtime:
//   • Electron (Windows desktop) → routes through WindowsAccessibilityBridge
//   • Capacitor (Android/iOS)    → routes through AccessibilityBridgePlugin
//   • Browser                    → returns null / no-ops
// All callers use this — they never import platform SDKs directly.

import type {
  AccessibilityBridgePlugin,
  NativeScreenContent,
  NativeElement,
  NativeActionResult,
  AppInfo,
  ContactInfo,
} from './AccessibilityBridgePlugin';
import { windowsBridge } from './WindowsAccessibilityBridge';

// ── Platform Detection ─────────────────────────────────────────────────────────

function isElectron(): boolean {
  return typeof window !== 'undefined' && 'aria' in window &&
    !!(window as { aria?: { isElectron?: boolean } }).aria?.isElectron;
}

// Lazily load Capacitor to avoid breaking web builds
async function getPlugin(): Promise<AccessibilityBridgePlugin | null> {
  if (isElectron()) return null; // Electron uses Windows bridge instead
  try {
    // @ts-ignore — Capacitor is injected at runtime on native platforms
    const { Capacitor, Plugins } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return null;
    return (Plugins as Record<string, unknown>).AccessibilityBridge as AccessibilityBridgePlugin || null;
  } catch {
    return null;
  }
}

export class NativeAccessibilityBridge {
  private plugin: AccessibilityBridgePlugin | null = null;
  private initialized = false;
  private serviceEnabled = false;
  private screenChangeListeners: Array<(content: NativeScreenContent) => void> = [];

  async init(): Promise<boolean> {
    if (this.initialized) return this.serviceEnabled;
    this.initialized = true;

    // Electron/Windows path
    if (isElectron()) {
      this.serviceEnabled = await windowsBridge.init();
      return this.serviceEnabled;
    }

    // Capacitor/Android path
    this.plugin = await getPlugin();
    if (!this.plugin) return false;

    try {
      const { enabled } = await this.plugin.checkServiceEnabled();
      this.serviceEnabled = enabled;

      if (enabled) {
        await this.plugin.addListener('screenChanged', (data) => {
          const content = data as NativeScreenContent;
          this.screenChangeListeners.forEach(l => l(content));
        });
      }

      return enabled;
    } catch {
      return false;
    }
  }

  get isNative(): boolean {
    if (isElectron()) return windowsBridge.isAvailable;
    return this.plugin !== null && this.serviceEnabled;
  }

  // ── Service Setup ──────────────────────────────────────────────────────────

  async requestServiceEnable(): Promise<void> {
    if (isElectron()) return; // Electron doesn't need an accessibility service toggle
    if (!this.plugin) return;
    await this.plugin.openAccessibilitySettings();
  }

  // ── Screen Reading ─────────────────────────────────────────────────────────

  async getScreenContent(): Promise<NativeScreenContent | null> {
    if (isElectron()) return windowsBridge.getScreenContent();
    if (!this.plugin) return null;
    try {
      return await this.plugin.getScreenContent();
    } catch {
      return null;
    }
  }

  async getFocusedElement(): Promise<NativeElement | null> {
    if (isElectron()) return windowsBridge.getFocusedElement();
    if (!this.plugin) return null;
    try {
      return await this.plugin.getFocusedElement();
    } catch {
      return null;
    }
  }

  // ── UI Automation ──────────────────────────────────────────────────────────

  async clickElement(label: string): Promise<NativeActionResult> {
    if (isElectron()) return windowsBridge.clickElement(label);
    if (!this.plugin) return { success: false, message: 'Native bridge not available' };
    try {
      return await this.plugin.clickElement({ label });
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Click failed' };
    }
  }

  async clickAtPoint(x: number, y: number): Promise<NativeActionResult> {
    if (!this.plugin) return { success: false, message: 'Native bridge not available' };
    try {
      return await this.plugin.clickAtPoint({ x, y });
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Click failed' };
    }
  }

  async typeText(text: string): Promise<NativeActionResult> {
    if (isElectron()) return windowsBridge.typeText(text);
    if (!this.plugin) return { success: false, message: 'Native bridge not available' };
    try {
      return await this.plugin.typeText({ text });
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Type failed' };
    }
  }

  async scroll(direction: 'up' | 'down'): Promise<NativeActionResult> {
    if (isElectron()) return windowsBridge.scroll(direction);
    if (!this.plugin) return { success: false, message: 'Native bridge not available' };
    try {
      return direction === 'up'
        ? await this.plugin.scrollUp()
        : await this.plugin.scrollDown();
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Scroll failed' };
    }
  }

  async pressBack(): Promise<NativeActionResult> {
    if (isElectron()) return windowsBridge.pressKey('backspace');
    if (!this.plugin) return { success: false, message: 'Native bridge not available' };
    return this.plugin.pressBack();
  }

  async pressHome(): Promise<NativeActionResult> {
    if (isElectron()) return windowsBridge.pressKey('home');
    if (!this.plugin) return { success: false, message: 'Native bridge not available' };
    return this.plugin.pressHome();
  }

  // ── App Control ────────────────────────────────────────────────────────────

  async getInstalledApps(): Promise<AppInfo[]> {
    if (isElectron()) return windowsBridge.getInstalledApps();
    if (!this.plugin) return [];
    try {
      const { apps } = await this.plugin.getInstalledApps();
      return apps;
    } catch {
      return [];
    }
  }

  async launchApp(packageNameOrName: string): Promise<NativeActionResult> {
    if (isElectron()) return windowsBridge.launchApp(packageNameOrName);
    if (!this.plugin) return { success: false, message: 'Native bridge not available' };
    try {
      const { apps } = await this.plugin.getInstalledApps();
      const match = apps.find(a =>
        a.packageName === packageNameOrName ||
        a.name.toLowerCase().includes(packageNameOrName.toLowerCase())
      );
      if (!match) return { success: false, message: `App not found: ${packageNameOrName}` };
      return this.plugin.launchApp({ packageName: match.packageName });
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Launch failed' };
    }
  }

  async getCurrentApp(): Promise<{ packageName: string; appName: string } | null> {
    if (isElectron()) return windowsBridge.getCurrentApp();
    if (!this.plugin) return null;
    try {
      return await this.plugin.getCurrentApp();
    } catch {
      return null;
    }
  }

  // ── Contacts ───────────────────────────────────────────────────────────────

  async getContacts(): Promise<ContactInfo[]> {
    if (isElectron()) return windowsBridge.getContacts();
    if (!this.plugin) return [];
    try {
      const { contacts } = await this.plugin.getContacts();
      return contacts;
    } catch {
      return [];
    }
  }

  async findContact(name: string): Promise<ContactInfo | null> {
    if (isElectron()) return windowsBridge.findContact(name);
    const contacts = await this.getContacts();
    return contacts.find(c =>
      c.name.toLowerCase().includes(name.toLowerCase())
    ) || null;
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  async getNotifications(): Promise<Array<{ app: string; title: string; text: string }>> {
    if (isElectron()) return windowsBridge.getNotifications();
    if (!this.plugin) return [];
    try {
      const { notifications } = await this.plugin.getNotifications();
      return notifications;
    } catch {
      return [];
    }
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
export const nativeBridge = new NativeAccessibilityBridge();
