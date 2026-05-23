// ── Electron Main Process ──────────────────────────────────────────────────────
// Entry point for the Windows desktop app.
// Runs in Node.js — full access to Windows APIs, file system, and native modules.

import { app, BrowserWindow, ipcMain, systemPreferences, session } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { UIAutomation } from './windows/ui-automation.js';
import { WindowsSpeech } from './windows/speech.js';
import { WindowsApps } from './windows/apps.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
const uia = new UIAutomation();
const speech = new WindowsSpeech();
const apps = new WindowsApps();

// ── Window ─────────────────────────────────────────────────────────────────────

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    backgroundColor: '#000000',
    title: 'Aria Interpreter',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // security: renderer cannot access Node.js directly
      nodeIntegration: false,   // security: no Node.js in renderer
      webSecurity: true,
      // Allow microphone and speech APIs
      experimentalFeatures: true,
    },
  });

  // Enable full accessibility support (required for screen readers like NVDA)
  app.setAccessibilitySupportEnabled(true);

  // Load the React app
  if (isDev) {
    win.loadURL('http://localhost:8080');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

// ── App Lifecycle ──────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  // Grant microphone permission to the app without prompting
  // (user already agreed via Windows system prompt on first launch)
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed = ['media', 'microphone', 'audioCapture', 'mediaKeySystem'];
    callback(allowed.includes(permission));
  });

  // Allow media devices in the renderer
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return ['media', 'audioCapture', 'microphone'].includes(permission);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── IPC Handlers — called from renderer via preload bridge ─────────────────────

// ── Screen / UI Automation ────────────────────────────────────────────────────

ipcMain.handle('uia:getScreenContent', async () => {
  return uia.getScreenContent();
});

ipcMain.handle('uia:getFocusedElement', async () => {
  return uia.getFocusedElement();
});

ipcMain.handle('uia:clickElement', async (_event, label: string) => {
  return uia.clickElement(label);
});

ipcMain.handle('uia:typeText', async (_event, text: string) => {
  return uia.typeText(text);
});

ipcMain.handle('uia:scrollDown', async () => {
  return uia.scroll('down');
});

ipcMain.handle('uia:scrollUp', async () => {
  return uia.scroll('up');
});

ipcMain.handle('uia:pressKey', async (_event, key: string) => {
  return uia.pressKey(key);
});

ipcMain.handle('uia:getCurrentApp', async () => {
  return uia.getCurrentApp();
});

// ── App Control ────────────────────────────────────────────────────────────────

ipcMain.handle('apps:getInstalled', async () => {
  return apps.getInstalledApps();
});

ipcMain.handle('apps:launch', async (_event, nameOrPath: string) => {
  return apps.launchApp(nameOrPath);
});

// ── Speech ─────────────────────────────────────────────────────────────────────

ipcMain.handle('speech:speak', async (_event, text: string, voice?: string) => {
  return speech.speak(text, voice);
});

ipcMain.handle('speech:stop', async () => {
  return speech.stop();
});

ipcMain.handle('speech:getVoices', async () => {
  return speech.getVoices();
});

// ── System ─────────────────────────────────────────────────────────────────────

ipcMain.handle('system:getMicrophonePermission', async () => {
  if (process.platform !== 'win32') return 'granted';
  try {
    const status = systemPreferences.getMediaAccessStatus('microphone');
    return status; // 'not-determined' | 'granted' | 'denied' | 'restricted'
  } catch {
    return 'granted'; // Windows doesn't always implement this
  }
});

ipcMain.handle('system:requestMicrophonePermission', async () => {
  if (process.platform !== 'win32') return true;
  try {
    return await systemPreferences.askForMediaAccess('microphone');
  } catch {
    return true; // Windows grants via OS prompt
  }
});

ipcMain.handle('system:getPlatform', () => {
  return { platform: process.platform, version: process.getSystemVersion() };
});
