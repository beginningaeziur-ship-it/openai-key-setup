// ── Device Control Workflow ────────────────────────────────────────────────────
// Controls the entire phone/computer — any app, contacts, notifications.
// Uses native bridge on mobile; gracefully degrades to web on desktop.

import type { AutomationResult } from '../types/interpreter.types';
import { nativeBridge } from '../native/NativeAccessibilityBridge';
import type { ContactInfo, AppInfo } from '../native/AccessibilityBridgePlugin';
import { MultiAIOrchestrator } from '../providers/MultiAIOrchestrator';

export class DeviceControlWorkflow {
  private cachedApps: AppInfo[] = [];
  private cachedContacts: ContactInfo[] = [];

  constructor(private ai: MultiAIOrchestrator) {}

  // ── Current Screen (any app) ───────────────────────────────────────────────

  async readAnyScreen(): Promise<string> {
    const content = await nativeBridge.getScreenContent();
    if (!content) {
      return 'Native accessibility service is not active. Please enable it in Settings.';
    }

    const elementSummary = content.elements
      .filter(e => e.label.trim())
      .slice(0, 20)
      .map(e => e.isClickable ? `Button: ${e.label}` : e.label)
      .join('. ');

    return [
      `App: ${content.appName}`,
      elementSummary || content.rawText.slice(0, 300),
    ].filter(Boolean).join('. ');
  }

  async describeCurrentApp(): Promise<string> {
    const app = await nativeBridge.getCurrentApp();
    if (!app) return 'Cannot detect current app.';

    const content = await nativeBridge.getScreenContent();
    const elementCount = content?.elements.length || 0;
    const buttons = content?.elements.filter(e => e.isClickable).length || 0;

    return `You are in ${app.appName}. ${elementCount} elements on screen, ${buttons} are buttons.`;
  }

  // ── App Launcher ───────────────────────────────────────────────────────────

  async openApp(appName: string): Promise<AutomationResult> {
    const result = await nativeBridge.launchApp(appName);
    if (result.success) {
      return { success: true, message: `Opening ${appName}` };
    }

    // Try AI to figure out the right app
    const apps = await this.getInstalledApps();
    const appList = apps.slice(0, 30).map(a => a.name).join(', ');
    const prompt = `User wants to open "${appName}". Available apps: ${appList}.
Which app best matches? Reply with just the app name, or "not found".`;

    const suggestion = await this.ai.complete(prompt, 'navigate');
    if (suggestion && suggestion !== 'not found') {
      const retry = await nativeBridge.launchApp(suggestion.trim());
      return retry.success
        ? { success: true, message: `Opening ${suggestion}` }
        : { success: false, message: `Could not find "${appName}" on this device.` };
    }

    return { success: false, message: `Could not find "${appName}" on this device.` };
  }

  async listInstalledApps(): Promise<string> {
    const apps = await this.getInstalledApps();
    if (!apps.length) return 'Could not read installed apps. Is accessibility service enabled?';
    const names = apps.map(a => a.name).join(', ');
    return `${apps.length} apps installed: ${names}`;
  }

  private async getInstalledApps(): Promise<AppInfo[]> {
    if (this.cachedApps.length) return this.cachedApps;
    this.cachedApps = await nativeBridge.getInstalledApps();
    return this.cachedApps;
  }

  // ── Contacts ───────────────────────────────────────────────────────────────

  async findContact(name: string): Promise<ContactInfo | null> {
    if (!this.cachedContacts.length) {
      this.cachedContacts = await nativeBridge.getContacts();
    }
    const lower = name.toLowerCase();
    return this.cachedContacts.find(c =>
      c.name.toLowerCase().includes(lower)
    ) || null;
  }

  async getPhoneNumber(name: string): Promise<string | null> {
    const contact = await this.findContact(name);
    return contact?.phoneNumbers[0] || null;
  }

  async listContacts(): Promise<string> {
    if (!this.cachedContacts.length) {
      this.cachedContacts = await nativeBridge.getContacts();
    }
    if (!this.cachedContacts.length) return 'No contacts found or permission not granted.';
    const names = this.cachedContacts.slice(0, 20).map(c => c.name).join(', ');
    return `${this.cachedContacts.length} contacts. First 20: ${names}`;
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  async readNotifications(): Promise<string> {
    const notifications = await nativeBridge.getNotifications();
    if (!notifications.length) return 'No notifications.';

    return notifications.slice(0, 5).map(n =>
      `${n.app}: ${n.title} — ${n.text}`
    ).join('. ');
  }

  // ── Native UI Automation (any app) ────────────────────────────────────────

  async clickAnywhere(target: string): Promise<AutomationResult> {
    const result = await nativeBridge.clickElement(target);
    return result;
  }

  async typeAnywhere(text: string): Promise<AutomationResult> {
    const result = await nativeBridge.typeText(text);
    return result;
  }

  async goBack(): Promise<AutomationResult> {
    return nativeBridge.pressBack();
  }

  async goHome(): Promise<AutomationResult> {
    return nativeBridge.pressHome();
  }

  async scroll(direction: 'up' | 'down'): Promise<AutomationResult> {
    return nativeBridge.scroll(direction);
  }

  // ── Service Setup Guide ────────────────────────────────────────────────────

  async checkSetup(): Promise<{ ready: boolean; instructions: string }> {
    const ready = nativeBridge.isNative;
    if (ready) {
      return { ready: true, instructions: 'Device control is active.' };
    }

    const isNativePlatform = await isCapacitorNative();
    if (!isNativePlatform) {
      return {
        ready: false,
        instructions: 'Device control requires the mobile app. Open this on your Android or iPhone.',
      };
    }

    return {
      ready: false,
      instructions: [
        'To control your entire phone:',
        '1. Go to your phone Settings',
        '2. Open Accessibility',
        '3. Find "Aria Interpreter" in the list',
        '4. Turn it ON',
        'Then come back here and say "activate".',
      ].join(' '),
    };
  }
}

async function isCapacitorNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
