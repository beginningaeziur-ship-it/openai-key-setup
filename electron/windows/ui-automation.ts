// ── Windows UI Automation ──────────────────────────────────────────────────────
// Uses PowerShell + .NET UIAutomationClient to read and control any Windows app.
// All operations run via child_process.execSync with inline PowerShell scripts.
// The UIAutomationClient assembly ships with every Windows installation.

import { execSync, spawnSync } from 'child_process';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Run a PowerShell script and return stdout as a string. */
function ps(script: string, timeoutMs = 8000): string {
  try {
    const result = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], {
      timeout: timeoutMs,
      encoding: 'utf8',
    });
    if (result.error) throw result.error;
    return (result.stdout || '').trim();
  } catch {
    return '';
  }
}

/** Parse JSON from PowerShell output, return null on failure. */
function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface ScreenContent {
  appName: string;
  windowTitle: string;
  elements: UIElement[];
  rawText: string;
}

export interface UIElement {
  id: string;
  name: string;
  role: string;
  value?: string;
  isEnabled: boolean;
  isFocused: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface ActionResult {
  success: boolean;
  message?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// UIAutomation class
// ────────────────────────────────────────────────────────────────────────────

export class UIAutomation {

  /** Read all interactive elements visible in the foreground window. */
  getScreenContent(): ScreenContent {
    const script = `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$automation = [System.Windows.Automation.AutomationElement]
$root = $automation::RootElement
$focused = $automation::FocusedElement
$fgWindow = $null
if ($focused) {
  $walk = $focused
  while ($walk -ne $null -and $walk.Current.ControlType -ne [System.Windows.Automation.ControlType]::Window) {
    $walk = [System.Windows.Automation.TreeWalker]::RawViewWalker.GetParent($walk)
  }
  $fgWindow = $walk
}
if (-not $fgWindow) {
  $cond = [System.Windows.Automation.PropertyCondition]::new($automation::IsEnabledProperty, $true)
  $fgWindow = $root.FindFirst([System.Windows.Automation.TreeScope]::Children, $cond)
}
$appName = if ($fgWindow) { $fgWindow.Current.ClassName } else { '' }
$windowTitle = if ($fgWindow) { $fgWindow.Current.Name } else { '' }
$elements = @()
$rawParts = @()
if ($fgWindow) {
  $allCond = [System.Windows.Automation.Condition]::TrueCondition
  $found = $fgWindow.FindAll([System.Windows.Automation.TreeScope]::Descendants, $allCond)
  foreach ($el in $found) {
    $name = $el.Current.Name
    $role = $el.Current.ControlType.ProgrammaticName -replace 'ControlType\.',''
    $value = ''
    try {
      $vp = $el.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
      $value = $vp.Current.Value
    } catch {}
    if ($name -or $value) {
      $bounds = $el.Current.BoundingRectangle
      $elements += [PSCustomObject]@{
        id = [System.Runtime.CompilerServices.RuntimeHelpers]::GetHashCode($el).ToString()
        name = $name
        role = $role
        value = $value
        isEnabled = $el.Current.IsEnabled
        isFocused = $el.Current.HasKeyboardFocus
        bounds = @{ x=[int]$bounds.X; y=[int]$bounds.Y; width=[int]$bounds.Width; height=[int]$bounds.Height }
      }
      if ($name) { $rawParts += $name }
      if ($value) { $rawParts += $value }
    }
  }
}
[PSCustomObject]@{
  appName = $appName
  windowTitle = $windowTitle
  elements = $elements
  rawText = ($rawParts | Select-Object -Unique) -join ' '
} | ConvertTo-Json -Depth 5 -Compress
`;

    const raw = ps(script, 12000);
    const data = parseJson<ScreenContent>(raw);
    return data ?? { appName: '', windowTitle: 'Unknown', elements: [], rawText: '' };
  }

  /** Return the element that currently has keyboard focus. */
  getFocusedElement(): UIElement | null {
    const script = `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$el = [System.Windows.Automation.AutomationElement]::FocusedElement
if (-not $el) { Write-Output 'null'; exit }
$value = ''
try {
  $vp = $el.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
  $value = $vp.Current.Value
} catch {}
$bounds = $el.Current.BoundingRectangle
[PSCustomObject]@{
  id = [System.Runtime.CompilerServices.RuntimeHelpers]::GetHashCode($el).ToString()
  name = $el.Current.Name
  role = $el.Current.ControlType.ProgrammaticName -replace 'ControlType\.',''
  value = $value
  isEnabled = $el.Current.IsEnabled
  isFocused = $true
  bounds = @{ x=[int]$bounds.X; y=[int]$bounds.Y; width=[int]$bounds.Width; height=[int]$bounds.Height }
} | ConvertTo-Json -Compress
`;

    const raw = ps(script);
    if (raw === 'null' || !raw) return null;
    return parseJson<UIElement>(raw);
  }

  /** Click a UI element by its name/label. Tries InvokePattern, then mouse click. */
  clickElement(label: string): ActionResult {
    const escaped = label.replace(/'/g, "''");
    const script = `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$cond = [System.Windows.Automation.PropertyCondition]::new(
  [System.Windows.Automation.AutomationElement]::NameProperty, '${escaped}',
  [System.Windows.Automation.PropertyConditionFlags]::IgnoreCase)
$el = [System.Windows.Automation.AutomationElement]::RootElement.FindFirst(
  [System.Windows.Automation.TreeScope]::Descendants, $cond)
if (-not $el) {
  Write-Output '{"success":false,"message":"Element not found: ${escaped}"}'
  exit
}
$el.SetFocus()
try {
  $ip = $el.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
  $ip.Invoke()
  Write-Output '{"success":true}'
} catch {
  # Fall back to clicking the center of its bounding rect
  $b = $el.Current.BoundingRectangle
  $x = [int]($b.X + $b.Width / 2)
  $y = [int]($b.Y + $b.Height / 2)
  Add-Type -AssemblyName System.Windows.Forms
  [System.Windows.Forms.Cursor]::Position = [System.Drawing.Point]::new($x, $y)
  $sig = '[DllImport("user32.dll")] public static extern void mouse_event(int dwFlags,int dx,int dy,int cButtons,int dwExtraInfo);'
  Add-Type -MemberDefinition $sig -Name Mouse -Namespace Win32
  [Win32.Mouse]::mouse_event(0x0002, 0, 0, 0, 0)  # LEFTDOWN
  [Win32.Mouse]::mouse_event(0x0004, 0, 0, 0, 0)  # LEFTUP
  Write-Output '{"success":true}'
}
`;

    const raw = ps(script);
    return parseJson<ActionResult>(raw) ?? { success: false, message: 'PowerShell error' };
  }

  /** Type text into the focused element using SendKeys. */
  typeText(text: string): ActionResult {
    // Escape special SendKeys characters
    const escaped = text
      .replace(/\+/g, '{+}')
      .replace(/\^/g, '{^}')
      .replace(/%/g, '{%}')
      .replace(/~/g, '{~}')
      .replace(/\(/g, '{(}')
      .replace(/\)/g, '{)}')
      .replace(/\[/g, '{[}')
      .replace(/\]/g, '{]}')
      .replace(/\{/g, '{{')
      .replace(/\}/g, '}}')
      .replace(/'/g, "''");

    const script = `
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait('${escaped}')
Write-Output '{"success":true}'
`;

    const raw = ps(script);
    return parseJson<ActionResult>(raw) ?? { success: true };
  }

  /** Scroll the focused scroll container up or down. */
  scroll(direction: 'up' | 'down'): ActionResult {
    const amount = direction === 'down' ? 3 : -3;
    const script = `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$el = [System.Windows.Automation.AutomationElement]::FocusedElement
$done = $false
if ($el) {
  $walk = $el
  while ($walk) {
    try {
      $sp = $walk.GetCurrentPattern([System.Windows.Automation.ScrollPattern]::Pattern)
      $sp.ScrollVertical([System.Windows.Automation.ScrollAmount]::${direction === 'down' ? 'SmallIncrement' : 'SmallDecrement'})
      $done = $true; break
    } catch {}
    $walk = [System.Windows.Automation.TreeWalker]::RawViewWalker.GetParent($walk)
  }
}
if (-not $done) {
  # Fallback: use mouse wheel
  $sig = '[DllImport("user32.dll")] public static extern void mouse_event(int dwFlags,int dx,int dy,int cButtons,int dwExtraInfo);'
  Add-Type -MemberDefinition $sig -Name Mouse -Namespace Win32 -ErrorAction SilentlyContinue
  [Win32.Mouse]::mouse_event(0x0800, 0, 0, ${amount * -120}, 0)  # MOUSEEVENTF_WHEEL
}
Write-Output '{"success":true}'
`;

    const raw = ps(script);
    return parseJson<ActionResult>(raw) ?? { success: true };
  }

  /** Send a single key press (e.g. "Tab", "Enter", "Escape", "F5"). */
  pressKey(key: string): ActionResult {
    const keyMap: Record<string, string> = {
      enter: '{ENTER}', tab: '{TAB}', escape: '{ESC}', backspace: '{BACKSPACE}',
      delete: '{DELETE}', home: '{HOME}', end: '{END}',
      pageup: '{PGUP}', pagedown: '{PGDN}',
      up: '{UP}', down: '{DOWN}', left: '{LEFT}', right: '{RIGHT}',
      f1: '{F1}', f2: '{F2}', f3: '{F3}', f4: '{F4}', f5: '{F5}',
      f6: '{F6}', f7: '{F7}', f8: '{F8}', f9: '{F9}', f10: '{F10}',
      f11: '{F11}', f12: '{F12}',
    };
    const sendKey = keyMap[key.toLowerCase()] ?? `{${key.toUpperCase()}}`;
    const script = `
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait('${sendKey}')
Write-Output '{"success":true}'
`;

    const raw = ps(script);
    return parseJson<ActionResult>(raw) ?? { success: true };
  }

  /** Return the name/title of the currently focused application window. */
  getCurrentApp(): { name: string; windowTitle: string } | null {
    const script = `
$sig = '[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow(); [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count); [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);'
Add-Type -MemberDefinition $sig -Name WinApi -Namespace Win32
$hwnd = [Win32.WinApi]::GetForegroundWindow()
$sb = [System.Text.StringBuilder]::new(256)
[Win32.WinApi]::GetWindowText($hwnd, $sb, 256) | Out-Null
$pid = 0
[Win32.WinApi]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
$proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
[PSCustomObject]@{
  name = if ($proc) { $proc.ProcessName } else { '' }
  windowTitle = $sb.ToString()
} | ConvertTo-Json -Compress
`;

    const raw = ps(script);
    return parseJson<{ name: string; windowTitle: string }>(raw);
  }
}
