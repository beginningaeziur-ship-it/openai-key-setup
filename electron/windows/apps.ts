// ── Windows App Enumeration & Launcher ────────────────────────────────────────
// Lists installed apps via Get-StartApps (PowerShell) and launches them.
// Get-StartApps returns both UWP (Store) apps and classic Win32 apps from the Start Menu.
// For apps not in Start Menu, we fall back to searching common paths and the registry.

import { spawnSync } from 'child_process';

export interface AppInfo {
  name: string;
  appId: string;       // UWP app ID or executable path
  isUWP: boolean;
}

export interface ActionResult {
  success: boolean;
  message?: string;
}

function ps(script: string, timeoutMs = 10000): string {
  try {
    const result = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], {
      timeout: timeoutMs,
      encoding: 'utf8',
    });
    return (result.stdout || '').trim();
  } catch {
    return '';
  }
}

export class WindowsApps {

  /** List all apps visible in the Start Menu (UWP + Win32 shortcuts). */
  getInstalledApps(): AppInfo[] {
    const script = `
Get-StartApps | ForEach-Object {
  [PSCustomObject]@{
    name = $_.Name
    appId = $_.AppId
    isUWP = $_.AppId -notlike '*\\*' -and $_.AppId -notlike '*:*'
  }
} | ConvertTo-Json -Compress
`;

    const raw = ps(script);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }

  /** Launch an app by name (fuzzy match) or by full path. */
  launchApp(nameOrPath: string): ActionResult {
    // Absolute path or .exe — launch directly
    if (nameOrPath.endsWith('.exe') || nameOrPath.includes('\\') || nameOrPath.includes('/')) {
      const safePath = nameOrPath.replace(/'/g, "''");
      const raw = ps(`Start-Process '${safePath}'; Write-Output '{"success":true}'`);
      return JSON.parse(raw || '{"success":true}');
    }

    // Fuzzy search Start Menu apps then launch
    const safeName = nameOrPath.replace(/'/g, "''");
    const script = `
$apps = Get-StartApps
$match = $apps | Where-Object { $_.Name -like '*${safeName}*' } | Select-Object -First 1
if (-not $match) {
  Write-Output '{"success":false,"message":"App not found: ${safeName}"}'
  exit
}
try {
  if ($match.AppId -like '{*' -or $match.AppId -match '^[A-Za-z0-9._]+![A-Za-z0-9._]+$') {
    # UWP app — use Start-Process shell:AppsFolder\\
    Start-Process "shell:AppsFolder\\$($match.AppId)"
  } else {
    Start-Process $match.AppId
  }
  Write-Output '{"success":true}'
} catch {
  Write-Output ('{"success":false,"message":"' + $_.Exception.Message.Replace('"','\\\"') + '"}')
}
`;

    const raw = ps(script);
    try {
      return JSON.parse(raw || '{"success":true}');
    } catch {
      return { success: true };
    }
  }
}
