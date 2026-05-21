// ── Electron Preload — Context Bridge ──────────────────────────────────────────
// Runs in an isolated context that has access to both Node.js and the DOM.
// Exposes a safe, typed API to the renderer via window.aria.
// The renderer CANNOT access Node.js or Electron directly — only what's here.

import { contextBridge, ipcRenderer } from 'electron';

// ── Type definitions exposed to renderer ──────────────────────────────────────

export interface AriaScreenContent {
  appName: string;
  windowTitle: string;
  elements: AriaElement[];
  rawText: string;
}

export interface AriaElement {
  id: string;
  name: string;
  role: string;
  value?: string;
  isEnabled: boolean;
  isFocused: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface AriaActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface AriaAppInfo {
  name: string;
  appId: string;
  path?: string;
}

export interface AriaVoiceInfo {
  id: string;
  name: string;
  lang: string;
  gender?: string;
}

// ── The bridge object exposed as window.aria ───────────────────────────────────

const ariaBridge = {
  // ── Screen / UI Automation ─────────────────────────────────────────────────

  getScreenContent: (): Promise<AriaScreenContent> =>
    ipcRenderer.invoke('uia:getScreenContent'),

  getFocusedElement: (): Promise<AriaElement | null> =>
    ipcRenderer.invoke('uia:getFocusedElement'),

  clickElement: (label: string): Promise<AriaActionResult> =>
    ipcRenderer.invoke('uia:clickElement', label),

  typeText: (text: string): Promise<AriaActionResult> =>
    ipcRenderer.invoke('uia:typeText', text),

  scrollDown: (): Promise<AriaActionResult> =>
    ipcRenderer.invoke('uia:scrollDown'),

  scrollUp: (): Promise<AriaActionResult> =>
    ipcRenderer.invoke('uia:scrollUp'),

  pressKey: (key: string): Promise<AriaActionResult> =>
    ipcRenderer.invoke('uia:pressKey', key),

  getCurrentApp: (): Promise<{ name: string; windowTitle: string } | null> =>
    ipcRenderer.invoke('uia:getCurrentApp'),

  // ── App Control ────────────────────────────────────────────────────────────

  getInstalledApps: (): Promise<AriaAppInfo[]> =>
    ipcRenderer.invoke('apps:getInstalled'),

  launchApp: (nameOrPath: string): Promise<AriaActionResult> =>
    ipcRenderer.invoke('apps:launch', nameOrPath),

  // ── Speech (Windows SAPI) ──────────────────────────────────────────────────

  speak: (text: string, voice?: string): Promise<AriaActionResult> =>
    ipcRenderer.invoke('speech:speak', text, voice),

  stopSpeech: (): Promise<void> =>
    ipcRenderer.invoke('speech:stop'),

  getVoices: (): Promise<AriaVoiceInfo[]> =>
    ipcRenderer.invoke('speech:getVoices'),

  // ── System ─────────────────────────────────────────────────────────────────

  getMicrophonePermission: (): Promise<'granted' | 'denied' | 'not-determined' | 'restricted'> =>
    ipcRenderer.invoke('system:getMicrophonePermission'),

  requestMicrophonePermission: (): Promise<boolean> =>
    ipcRenderer.invoke('system:requestMicrophonePermission'),

  getPlatform: (): Promise<{ platform: string; version: string }> =>
    ipcRenderer.invoke('system:getPlatform'),

  // ── Platform Detection (synchronous — no IPC needed) ──────────────────────

  isElectron: true as const,
  platform: process.platform,
};

contextBridge.exposeInMainWorld('aria', ariaBridge);

// TypeScript augmentation so renderer code gets types without importing electron
declare global {
  interface Window {
    aria: typeof ariaBridge;
  }
}
