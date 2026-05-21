// ── UI Automation Engine ───────────────────────────────────────────────────────
// Programmatically interacts with DOM elements: click, type, scroll, select.
// Handles dynamic content, modals, and form submission.

import type { AutomationAction, AutomationResult, ScreenElement } from '../types/interpreter.types';
import { AccessibilityController } from './AccessibilityController';

export class UIAutomationEngine {
  constructor(private accessibility: AccessibilityController) {}

  async execute(action: AutomationAction): Promise<AutomationResult> {
    try {
      switch (action.type) {
        case 'click':    return await this.click(action.target!);
        case 'type':     return await this.type(action.target!, action.value || '');
        case 'clear':    return await this.clear(action.target!);
        case 'select':   return await this.selectOption(action.target!, action.value || '');
        case 'scroll':   return await this.scroll(action.value || 'down');
        case 'focus':    return await this.focus(action.target!);
        case 'navigate': return await this.navigateTo(action.value || '');
        case 'read':     return await this.readElement(action.target);
        case 'wait':     return await this.wait(action.delay || 1000);
        default:         return { success: false, message: `Unknown action: ${action.type}` };
      }
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Automation failed',
      };
    }
  }

  // ── Click ──────────────────────────────────────────────────────────────────

  async click(target: string): Promise<AutomationResult> {
    const el = this.resolve(target);
    if (!el) {
      return { success: false, message: `Could not find element: "${target}"` };
    }

    el.focus();
    el.click();

    // Also dispatch pointer events for frameworks that need them
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));

    const label = this.accessibility.elementToScreenElement(el).label;
    return { success: true, message: `Clicked: ${label}` };
  }

  // ── Type Text ──────────────────────────────────────────────────────────────

  async type(target: string, value: string): Promise<AutomationResult> {
    const el = this.resolveInput(target);
    if (!el) {
      return { success: false, message: `Could not find input: "${target}"` };
    }

    el.focus();

    // Set value via native input value setter for React-controlled inputs
    const nativeSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el), 'value'
    )?.set;

    if (nativeSetter) {
      nativeSetter.call(el, value);
    } else {
      (el as HTMLInputElement).value = value;
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    return { success: true, message: `Typed "${value}" into ${target}` };
  }

  // ── Clear ──────────────────────────────────────────────────────────────────

  async clear(target: string): Promise<AutomationResult> {
    return this.type(target, '');
  }

  // ── Select Option ──────────────────────────────────────────────────────────

  async selectOption(target: string, value: string): Promise<AutomationResult> {
    const el = this.resolve(target);
    if (!el) {
      return { success: false, message: `Could not find element: "${target}"` };
    }

    if (el instanceof HTMLSelectElement) {
      const option = Array.from(el.options).find(
        o => o.text.toLowerCase().includes(value.toLowerCase()) ||
             o.value.toLowerCase() === value.toLowerCase()
      );
      if (!option) {
        return { success: false, message: `Option "${value}" not found in ${target}` };
      }
      el.value = option.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { success: true, message: `Selected "${option.text}" in ${target}` };
    }

    // For custom dropdowns/comboboxes — click to open, then find option
    el.click();
    await this.wait(300);

    const options = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"]')) as HTMLElement[];
    const match = options.find(o =>
      (o.textContent || '').toLowerCase().includes(value.toLowerCase())
    );
    if (match) {
      match.click();
      return { success: true, message: `Selected "${value}"` };
    }

    return { success: false, message: `Could not select "${value}"` };
  }

  // ── Scroll ─────────────────────────────────────────────────────────────────

  async scroll(direction: string): Promise<AutomationResult> {
    const amount = 300;
    const map: Record<string, [number, number]> = {
      down: [0, amount],
      up: [0, -amount],
      right: [amount, 0],
      left: [-amount, 0],
      top: [0, -99999],
      bottom: [0, 99999],
    };

    const [x, y] = map[direction.toLowerCase()] || [0, amount];
    window.scrollBy({ left: x, top: y, behavior: 'smooth' });

    return { success: true, message: `Scrolled ${direction}` };
  }

  // ── Focus ──────────────────────────────────────────────────────────────────

  async focus(target: string): Promise<AutomationResult> {
    const el = this.resolve(target);
    if (!el) {
      return { success: false, message: `Could not find element: "${target}"` };
    }
    el.focus();
    const label = this.accessibility.elementToScreenElement(el).label;
    return { success: true, message: `Focused on: ${label}` };
  }

  // ── Navigate ───────────────────────────────────────────────────────────────

  async navigateTo(url: string): Promise<AutomationResult> {
    if (url.startsWith('/') || url.startsWith('#')) {
      window.location.href = url;
      return { success: true, message: `Navigated to ${url}` };
    }
    // For external URLs, open in same tab (accessibility: user is aware due to TTS)
    window.location.href = url;
    return { success: true, message: `Navigating to ${url}` };
  }

  // ── Read Element ───────────────────────────────────────────────────────────

  async readElement(target?: string): Promise<AutomationResult> {
    if (!target) {
      const state = this.accessibility.getScreenState();
      const summary = [
        `Page: ${state.title}`,
        state.headings.length ? `Headings: ${state.headings.join(', ')}` : '',
        state.alerts.length ? `Alerts: ${state.alerts.join(', ')}` : '',
        `Interactive elements: ${state.interactiveElements.length}`,
        state.mainContent ? `Content: ${state.mainContent.slice(0, 200)}` : '',
      ].filter(Boolean).join('. ');
      return { success: true, message: summary, data: state };
    }

    const el = this.resolve(target);
    if (!el) {
      return { success: false, message: `Could not find element: "${target}"` };
    }
    const info = this.accessibility.elementToScreenElement(el);
    const desc = [
      info.label,
      info.role !== info.tagName ? `(${info.role})` : '',
      info.value ? `Value: ${info.value}` : '',
      info.description || '',
    ].filter(Boolean).join(' ');
    return { success: true, message: desc, data: info };
  }

  // ── Wait ───────────────────────────────────────────────────────────────────

  async wait(ms: number): Promise<AutomationResult> {
    await new Promise(resolve => setTimeout(resolve, ms));
    return { success: true, message: `Waited ${ms}ms` };
  }

  // ── Form Filling ───────────────────────────────────────────────────────────

  async fillForm(fields: Record<string, string>): Promise<AutomationResult[]> {
    const results: AutomationResult[] = [];
    for (const [fieldName, value] of Object.entries(fields)) {
      const result = await this.type(fieldName, value);
      results.push(result);
      await this.wait(100);
    }
    return results;
  }

  // ── Submit Form ────────────────────────────────────────────────────────────

  async submitForm(formTarget?: string): Promise<AutomationResult> {
    let form: HTMLFormElement | null = null;

    if (formTarget) {
      const el = this.resolve(formTarget);
      form = el instanceof HTMLFormElement ? el : el?.closest('form') || null;
    } else {
      form = document.querySelector('form');
    }

    if (form) {
      form.requestSubmit();
      return { success: true, message: 'Form submitted' };
    }

    // Fallback: click submit button
    return this.click('submit button');
  }

  // ── Modal Handling ─────────────────────────────────────────────────────────

  detectModal(): ScreenElement | null {
    const modal = document.querySelector('[role="dialog"], [aria-modal="true"], .modal') as HTMLElement | null;
    if (!modal) return null;
    return this.accessibility.elementToScreenElement(modal);
  }

  async dismissModal(): Promise<AutomationResult> {
    const modal = this.detectModal();
    if (!modal) {
      return { success: false, message: 'No modal detected' };
    }

    // Try close button first
    const closeBtn = document.querySelector<HTMLElement>(
      '[aria-label="Close"], [aria-label="Dismiss"], .modal-close, [data-dismiss]'
    );
    if (closeBtn) {
      closeBtn.click();
      return { success: true, message: 'Modal dismissed' };
    }

    // Escape key fallback
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    return { success: true, message: 'Modal dismissed via Escape' };
  }

  // ── Resolution Helpers ─────────────────────────────────────────────────────

  private resolve(target: string): HTMLElement | null {
    // 1. CSS selector
    if (target.startsWith('#') || target.startsWith('.') || target.startsWith('[')) {
      const el = document.querySelector(target) as HTMLElement | null;
      if (el) return el;
    }

    // 2. ARIA label search
    const byLabel = this.accessibility.findElementByLabel(target);
    if (byLabel) return byLabel;

    // 3. Exact text content
    const all = Array.from(document.querySelectorAll('button, a, [role="button"]')) as HTMLElement[];
    return all.find(el =>
      (el.textContent || '').trim().toLowerCase() === target.toLowerCase()
    ) || null;
  }

  private resolveInput(target: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
    const byLabel = this.accessibility.findInputByLabel(target);
    if (byLabel) return byLabel;

    const el = this.resolve(target);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      return el;
    }
    return null;
  }
}
