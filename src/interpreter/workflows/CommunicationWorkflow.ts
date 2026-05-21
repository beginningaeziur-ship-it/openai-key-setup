// ── Communication Workflow ─────────────────────────────────────────────────────
// Manages phone calls, messaging, in-call menu navigation, and contacts.
// Uses Web APIs for browser-based calling and native Capacitor bridges for mobile.

import type { AutomationResult, ContactInfo } from '../types/interpreter.types';
import { AccessibilityController } from '../core/AccessibilityController';
import { UIAutomationEngine } from '../core/UIAutomationEngine';
import { MultiAIOrchestrator } from '../providers/MultiAIOrchestrator';

export class CommunicationWorkflow {
  private activeCallStartTime: number | null = null;
  private dtmfTones = new Map<string, number>([
    ['0', 941], ['1', 697], ['2', 697], ['3', 697],
    ['4', 770], ['5', 770], ['6', 770],
    ['7', 852], ['8', 852], ['9', 852],
    ['*', 941], ['#', 941],
  ]);

  constructor(
    private accessibility: AccessibilityController,
    private automation: UIAutomationEngine,
    private ai: MultiAIOrchestrator
  ) {}

  // ── Phone Calls ────────────────────────────────────────────────────────────

  async initiateCall(target: string): Promise<AutomationResult> {
    const phoneNumber = this.resolveContact(target);

    // Web: use tel: protocol (opens native dialer on mobile)
    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = `tel:${phoneNumber}`;
      link.click();

      this.activeCallStartTime = Date.now();
      this.accessibility.announceUrgent(`Calling ${target}. Say "end call" to hang up.`);

      return { success: true, message: `Calling ${target} at ${phoneNumber}` };
    }

    return { success: false, message: 'Calling not supported in this environment.' };
  }

  async endCall(): Promise<AutomationResult> {
    this.activeCallStartTime = null;
    this.accessibility.announceUrgent('Call ended.');
    return { success: true, message: 'Call ended' };
  }

  getCallDuration(): string {
    if (!this.activeCallStartTime) return 'No active call';
    const seconds = Math.floor((Date.now() - this.activeCallStartTime) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ── DTMF / In-Call Menu Navigation ────────────────────────────────────────

  async pressPhoneKey(key: string): Promise<AutomationResult> {
    if (!/^[0-9*#]$/.test(key)) {
      return { success: false, message: `Invalid key: ${key}. Use 0-9, *, or #` };
    }

    this.playDTMFTone(key);
    this.accessibility.announce(`Pressed ${key}`);

    return { success: true, message: `Pressed ${key}` };
  }

  async navigatePhoneMenu(instruction: string): Promise<string> {
    const prompt = `You are helping a blind user navigate a phone menu.
Instruction from user: "${instruction}"

Common phone menu actions:
- "Press 1 for English" → press key 1
- "Press 0 for operator" → press key 0
- "Stay on the line" → wait

What key should the user press? Respond with just the key (0-9, *, #) or "wait" or "stay on line".`;

    const response = await this.ai.complete(prompt, 'call');
    const key = response.trim().split(' ')[0];

    if (/^[0-9*#]$/.test(key)) {
      await this.pressPhoneKey(key);
      return `Pressed ${key} for: ${instruction}`;
    }

    return response;
  }

  private playDTMFTone(key: string): void {
    if (typeof AudioContext === 'undefined') return;
    try {
      const ctx = new AudioContext();
      const freq = this.dtmfTones.get(key) || 697;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.frequency.value = freq;
      gain.gain.value = 0.1;
      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        ctx.close();
      }, 200);
    } catch {
      // Audio not available — silently fail
    }
  }

  // ── Messaging ──────────────────────────────────────────────────────────────

  async sendMessage(to: string, message: string): Promise<AutomationResult> {
    // Web: open SMS protocol on mobile
    const phoneNumber = this.resolveContact(to);
    const encodedMsg = encodeURIComponent(message);
    const smsLink = document.createElement('a');
    smsLink.href = `sms:${phoneNumber}?body=${encodedMsg}`;
    smsLink.click();

    return { success: true, message: `Message to ${to}: "${message}"` };
  }

  async composeEmailMessage(to: string, subject: string, body: string): Promise<AutomationResult> {
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    return { success: true, message: `Email composer opened for ${to}` };
  }

  async readLastMessage(): Promise<string> {
    // Scan for message content in current view
    const msgSelectors = [
      '[class*="message"]', '[class*="chat"]',
      '[role="log"]', '[aria-live]',
      '[class*="inbox"]', '[class*="conversation"]',
    ];

    for (const sel of msgSelectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) {
        const text = el.textContent.trim();
        return `Message: ${text.slice(0, 200)}`;
      }
    }

    const screen = this.accessibility.getScreenState();
    return screen.mainContent?.slice(0, 300) || 'No messages found on screen';
  }

  async draftMessageWithAI(to: string, intent: string): Promise<string> {
    const prompt = `Draft a short, natural text message for a blind user.
Recipient: ${to}
Intent: ${intent}
Write only the message body, no labels or quotes. Keep it under 3 sentences.`;

    return this.ai.complete(prompt, 'message');
  }

  // ── Contacts ───────────────────────────────────────────────────────────────

  private contacts: ContactInfo[] = [
    // Pre-populated with examples; in a real app, sync from device contacts
  ];

  addContact(contact: ContactInfo): void {
    this.contacts.push(contact);
  }

  findContact(name: string): ContactInfo | undefined {
    const normalized = name.toLowerCase();
    return this.contacts.find(c =>
      c.name.toLowerCase().includes(normalized)
    );
  }

  private resolveContact(target: string): string {
    // If it looks like a phone number, use directly
    if (/^[\d\s\+\-\(\)]+$/.test(target)) {
      return target.replace(/\s/g, '');
    }

    // Look up in contacts
    const contact = this.findContact(target);
    return contact?.phoneNumber || target;
  }

  // ── In-App Messaging ───────────────────────────────────────────────────────

  async readChatHistory(): Promise<string> {
    const messages = Array.from(document.querySelectorAll(
      '[class*="message"], [role="listitem"], [data-message]'
    )).slice(-10);

    if (!messages.length) return 'No chat messages found on screen';

    return messages.map(el => {
      const sender = el.querySelector('[class*="sender"], [class*="author"]')?.textContent?.trim() || 'Unknown';
      const text = el.querySelector('[class*="text"], [class*="body"], p')?.textContent?.trim() || el.textContent?.trim() || '';
      return `${sender}: ${text}`;
    }).join('. ');
  }

  async sendChatMessage(message: string): Promise<AutomationResult> {
    // Type into chat input
    const typeResult = await this.automation.execute({
      type: 'type',
      target: 'message input',
      value: message,
    });

    if (!typeResult.success) {
      // Try alternate selectors
      const input = document.querySelector<HTMLElement>('[class*="chat-input"], [placeholder*="message"], [aria-label*="message"]');
      if (!input) {
        return { success: false, message: 'Could not find message input' };
      }
      input.focus();
    }

    // Press Enter to send
    const activeEl = document.activeElement as HTMLElement;
    activeEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    return { success: true, message: `Message sent: "${message}"` };
  }
}
