// ── Windows SAPI Text-to-Speech ────────────────────────────────────────────────
// Wraps System.Speech.Synthesis via PowerShell.
// SAPI (Speech Application Programming Interface) ships with every Windows install.
// Supports all installed Windows voices — user can add more via Settings > Time & Language.

import { spawnSync, ChildProcess, spawn } from 'child_process';

export interface VoiceInfo {
  id: string;
  name: string;
  lang: string;
  gender: string;
}

export interface ActionResult {
  success: boolean;
  message?: string;
}

function ps(script: string, timeoutMs = 30000): string {
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

export class WindowsSpeech {
  // Track the current speaking process so we can kill it on stop()
  private currentSpeakProcess: ChildProcess | null = null;

  /** Speak text aloud using SAPI. Optionally specify a voice name. */
  async speak(text: string, voiceName?: string): Promise<ActionResult> {
    // Stop any in-progress speech first
    this.stop();

    // Escape single quotes for PowerShell
    const safeText = text.replace(/'/g, "''");
    const voiceCmd = voiceName
      ? `$synth.SelectVoice('${voiceName.replace(/'/g, "''")}')`
      : '';

    const script = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 1
$synth.Volume = 100
${voiceCmd}
$synth.Speak('${safeText}')
Write-Output 'done'
`;

    return new Promise((resolve) => {
      const proc = spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command', script]);
      this.currentSpeakProcess = proc;

      proc.on('close', (code) => {
        this.currentSpeakProcess = null;
        resolve({ success: code === 0 });
      });

      proc.on('error', (err) => {
        this.currentSpeakProcess = null;
        resolve({ success: false, message: err.message });
      });
    });
  }

  /** Immediately stop any current speech. */
  stop(): void {
    if (this.currentSpeakProcess) {
      try {
        this.currentSpeakProcess.kill('SIGTERM');
        // On Windows, SIGTERM may not work — use taskkill
        spawnSync('taskkill', ['/F', '/PID', String(this.currentSpeakProcess.pid), '/T'], {
          timeout: 2000,
        });
      } catch {
        // Ignore — process may have already exited
      }
      this.currentSpeakProcess = null;
    }
  }

  /** Return all installed SAPI voices. */
  getVoices(): VoiceInfo[] {
    const script = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.GetInstalledVoices() | ForEach-Object {
  $info = $_.VoiceInfo
  [PSCustomObject]@{
    id = $info.Id
    name = $info.Name
    lang = $info.Culture.Name
    gender = $info.Gender.ToString()
  }
} | ConvertTo-Json -Compress
`;

    const raw = ps(script);
    if (!raw) return [];
    // ConvertTo-Json outputs an object (not array) if only one voice — normalize
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }
}
