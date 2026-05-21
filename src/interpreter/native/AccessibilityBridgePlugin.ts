// ── Native Accessibility Bridge — TypeScript Plugin Interface ─────────────────
// Talks to Android AccessibilityService and iOS VoiceOver bridge via Capacitor.
// Falls back gracefully to web DOM automation when native is not available.

export interface AppInfo {
  name: string;
  packageName: string;
  icon?: string;
}

export interface ContactInfo {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

export interface NativeScreenContent {
  packageName: string;
  appName: string;
  elements: NativeElement[];
  rawText: string;
}

export interface NativeElement {
  id: string;
  label: string;
  role: string;
  value?: string;
  isClickable: boolean;
  isFocused: boolean;
  bounds?: { left: number; top: number; right: number; bottom: number };
}

export interface NativeActionResult {
  success: boolean;
  message?: string;
}

// The Capacitor plugin interface (implemented natively on Android/iOS)
export interface AccessibilityBridgePlugin {
  // Service status
  checkServiceEnabled(): Promise<{ enabled: boolean }>;
  openAccessibilitySettings(): Promise<void>;

  // Screen reading
  getScreenContent(): Promise<NativeScreenContent>;
  getFocusedElement(): Promise<NativeElement | null>;

  // UI Automation
  clickElement(options: { label: string }): Promise<NativeActionResult>;
  clickElementById(options: { id: string }): Promise<NativeActionResult>;
  clickAtPoint(options: { x: number; y: number }): Promise<NativeActionResult>;
  typeText(options: { text: string }): Promise<NativeActionResult>;
  clearText(): Promise<NativeActionResult>;
  scrollUp(): Promise<NativeActionResult>;
  scrollDown(): Promise<NativeActionResult>;
  pressBack(): Promise<NativeActionResult>;
  pressHome(): Promise<NativeActionResult>;

  // App control
  getInstalledApps(): Promise<{ apps: AppInfo[] }>;
  launchApp(options: { packageName: string }): Promise<NativeActionResult>;
  getCurrentApp(): Promise<{ packageName: string; appName: string }>;

  // Contacts
  getContacts(): Promise<{ contacts: ContactInfo[] }>;

  // Notifications
  getNotifications(): Promise<{ notifications: Array<{ app: string; title: string; text: string }> }>;

  // Events
  addListener(
    event: 'screenChanged' | 'elementFocused' | 'notificationPosted',
    callback: (data: unknown) => void
  ): Promise<{ remove: () => void }>;
}
