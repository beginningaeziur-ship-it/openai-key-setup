// ── Accessibility Controller ──────────────────────────────────────────────────
// Bridges with ARIA/DOM on web and native accessibility APIs on mobile.
// Provides TalkBack/VoiceOver-equivalent output via aria-live regions.

import type { ScreenElement, ScreenState } from '../types/interpreter.types';

export class AccessibilityController {
  private liveRegion: HTMLElement | null = null;
  private assertiveLiveRegion: HTMLElement | null = null;
  private mutationObserver: MutationObserver | null = null;
  private alertCallbacks: Array<(text: string) => void> = [];

  constructor() {
    this.setupLiveRegions();
    this.setupMutationObserver();
  }

  // ── Live Region Setup ──────────────────────────────────────────────────────

  private setupLiveRegions(): void {
    if (typeof document === 'undefined') return;

    this.liveRegion = this.getOrCreate('aria-interpreter-polite', 'polite');
    this.assertiveLiveRegion = this.getOrCreate('aria-interpreter-assertive', 'assertive');
  }

  private getOrCreate(id: string, politeness: 'polite' | 'assertive'): HTMLElement {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('aria-live', politeness);
      el.setAttribute('aria-atomic', 'true');
      el.setAttribute('aria-relevant', 'additions text');
      Object.assign(el.style, {
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      });
      document.body.appendChild(el);
    }
    return el;
  }

  // ── Announcements ──────────────────────────────────────────────────────────

  announce(text: string, assertive = false): void {
    const region = assertive ? this.assertiveLiveRegion : this.liveRegion;
    if (!region) return;
    region.textContent = '';
    requestAnimationFrame(() => {
      if (region) region.textContent = text;
    });
  }

  announceUrgent(text: string): void {
    this.announce(text, true);
  }

  // ── Screen Reading ─────────────────────────────────────────────────────────

  getScreenState(): ScreenState {
    const title = document.title || 'Untitled page';
    const url = window.location.href;
    const interactiveElements = this.findInteractiveElements();
    const headings = this.findHeadings();
    const mainContent = this.extractMainContent();
    const focusedElement = this.getFocusedElement();
    const alerts = this.findAlerts();
    const landmark = this.getCurrentLandmark();

    return { title, url, interactiveElements, headings, mainContent, focusedElement, alerts, landmark };
  }

  getFocusedElement(): ScreenElement | undefined {
    const el = document.activeElement;
    if (!el || el === document.body) return undefined;
    return this.elementToScreenElement(el as HTMLElement);
  }

  findInteractiveElements(): ScreenElement[] {
    const interactiveRoles = [
      'button', 'link', 'textbox', 'combobox', 'listbox', 'checkbox',
      'radio', 'switch', 'slider', 'spinbutton', 'menuitem', 'tab',
      'option', 'searchbox',
    ];
    const nativeTags = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const byRole = interactiveRoles.flatMap(role =>
      Array.from(document.querySelectorAll(`[role="${role}"]`))
    );
    const byTag = Array.from(document.querySelectorAll(nativeTags));

    const all = [...new Set([...byRole, ...byTag])] as HTMLElement[];
    return all
      .filter(el => this.isVisible(el))
      .map(el => this.elementToScreenElement(el))
      .slice(0, 50); // cap for performance
  }

  findHeadings(): string[] {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]'))
      .filter(el => this.isVisible(el as HTMLElement))
      .map(el => {
        const level = el.getAttribute('aria-level') || el.tagName.replace('H', '');
        return `Heading level ${level}: ${this.getLabel(el as HTMLElement)}`;
      })
      .slice(0, 20);
  }

  private extractMainContent(): string {
    const main = document.querySelector('main, [role="main"], #main, .main-content');
    const source = main || document.body;
    const text = source.textContent || '';
    return text.replace(/\s+/g, ' ').trim().slice(0, 500);
  }

  private findAlerts(): string[] {
    return Array.from(document.querySelectorAll('[role="alert"], [role="status"], [aria-live]'))
      .map(el => (el.textContent || '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }

  private getCurrentLandmark(): string {
    const el = document.activeElement;
    if (!el) return 'main';
    const landmarks = ['main', 'navigation', 'banner', 'contentinfo', 'complementary', 'form', 'search'];
    let current: Element | null = el;
    while (current) {
      const role = current.getAttribute('role') || current.tagName.toLowerCase();
      if (landmarks.includes(role)) return role;
      current = current.parentElement;
    }
    return 'main';
  }

  // ── Element Finding ────────────────────────────────────────────────────────

  findElementByLabel(labelText: string): HTMLElement | null {
    const normalized = labelText.toLowerCase().trim();

    // 1. aria-label match
    const byAriaLabel = Array.from(
      document.querySelectorAll(`[aria-label]`)
    ).find(el =>
      (el.getAttribute('aria-label') || '').toLowerCase().includes(normalized)
    ) as HTMLElement | undefined;
    if (byAriaLabel) return byAriaLabel;

    // 2. Button/link text match
    const interactive = Array.from(
      document.querySelectorAll('button, a, [role="button"], [role="link"]')
    ).find(el =>
      (el.textContent || '').toLowerCase().includes(normalized)
    ) as HTMLElement | undefined;
    if (interactive) return interactive;

    // 3. Placeholder match for inputs
    const byPlaceholder = Array.from(
      document.querySelectorAll<HTMLInputElement>('[placeholder]')
    ).find(el =>
      (el.placeholder || '').toLowerCase().includes(normalized)
    );
    if (byPlaceholder) return byPlaceholder;

    // 4. Label element association
    const labels = Array.from(document.querySelectorAll('label'));
    const matchedLabel = labels.find(l =>
      (l.textContent || '').toLowerCase().includes(normalized)
    );
    if (matchedLabel) {
      const forId = matchedLabel.getAttribute('for');
      if (forId) {
        const input = document.getElementById(forId);
        if (input) return input as HTMLElement;
      }
      const nested = matchedLabel.querySelector('input, select, textarea');
      if (nested) return nested as HTMLElement;
    }

    // 5. Any element text match
    return (Array.from(document.querySelectorAll('*')).find(el =>
      this.isVisible(el as HTMLElement) &&
      (el.textContent || '').toLowerCase().trim() === normalized
    ) as HTMLElement) || null;
  }

  findInputByLabel(labelText: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
    const el = this.findElementByLabel(labelText);
    if (!el) return null;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      return el as HTMLInputElement;
    }
    return null;
  }

  // ── Element Helpers ────────────────────────────────────────────────────────

  elementToScreenElement(el: HTMLElement): ScreenElement {
    const rect = el.getBoundingClientRect();
    return {
      role: el.getAttribute('role') || el.tagName.toLowerCase(),
      label: this.getLabel(el),
      value: this.getValue(el),
      description: el.getAttribute('aria-describedby')
        ? (document.getElementById(el.getAttribute('aria-describedby')!)?.textContent || undefined)
        : undefined,
      interactive: this.isInteractive(el),
      visible: this.isVisible(el),
      tagName: el.tagName.toLowerCase(),
      selector: this.buildSelector(el),
      position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
    };
  }

  private getLabel(el: HTMLElement): string {
    return (
      el.getAttribute('aria-label') ||
      (el.getAttribute('aria-labelledby')
        ? (document.getElementById(el.getAttribute('aria-labelledby')!)?.textContent || '')
        : '') ||
      el.getAttribute('alt') ||
      el.getAttribute('title') ||
      el.getAttribute('placeholder') ||
      el.textContent?.trim().slice(0, 100) ||
      el.tagName.toLowerCase()
    );
  }

  private getValue(el: HTMLElement): string | undefined {
    if (el instanceof HTMLInputElement) return el.value;
    if (el instanceof HTMLSelectElement) return el.options[el.selectedIndex]?.text;
    if (el instanceof HTMLTextAreaElement) return el.value;
    return el.getAttribute('aria-valuenow') || undefined;
  }

  private isVisible(el: HTMLElement): boolean {
    if (!el.getBoundingClientRect) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  private isInteractive(el: HTMLElement): boolean {
    const interactiveTags = ['a', 'button', 'input', 'select', 'textarea'];
    const interactiveRoles = ['button', 'link', 'textbox', 'checkbox', 'radio', 'switch', 'combobox'];
    return (
      interactiveTags.includes(el.tagName.toLowerCase()) ||
      interactiveRoles.includes(el.getAttribute('role') || '') ||
      el.tabIndex >= 0 ||
      el.hasAttribute('onclick')
    );
  }

  private buildSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.getAttribute('aria-label')) {
      return `[aria-label="${el.getAttribute('aria-label')}"]`;
    }
    return el.tagName.toLowerCase();
  }

  // ── Focus Management ───────────────────────────────────────────────────────

  moveFocusToNext(): ScreenElement | undefined {
    const focusable = this.findInteractiveElements();
    const current = this.getFocusedElement();
    if (!current) {
      const first = focusable[0];
      if (first?.selector) {
        const el = document.querySelector(first.selector) as HTMLElement;
        el?.focus();
      }
      return focusable[0];
    }
    const idx = focusable.findIndex(e => e.selector === current.selector);
    const next = focusable[idx + 1] || focusable[0];
    if (next?.selector) {
      const el = document.querySelector(next.selector) as HTMLElement;
      el?.focus();
    }
    return next;
  }

  // ── Dynamic Content Watching ───────────────────────────────────────────────

  private setupMutationObserver(): void {
    if (typeof MutationObserver === 'undefined') return;
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          this.handleNewContent(mutation.addedNodes);
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-live') {
          const el = mutation.target as HTMLElement;
          const text = el.textContent?.trim();
          if (text) this.handleDynamicAlert(text);
        }
      }
    });
    if (typeof document !== 'undefined') {
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-live', 'role'],
      });
    }
  }

  private handleNewContent(nodes: NodeList): void {
    nodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as HTMLElement;
      const role = el.getAttribute('role');
      if (role === 'alert' || role === 'dialog' || role === 'status') {
        const text = el.textContent?.trim() || '';
        if (text) this.handleDynamicAlert(text);
      }
    });
  }

  private handleDynamicAlert(text: string): void {
    this.alertCallbacks.forEach(cb => cb(text));
  }

  onDynamicContent(callback: (text: string) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
    };
  }

  // ── Capacitor Native Bridge (stub for future native plugin) ───────────────

  async getNativeScreenContent(): Promise<string> {
    // In a real Capacitor app, this would call a native plugin:
    // return Plugins.AccessibilityBridge.getScreenContent();
    return this.getScreenState().mainContent || '';
  }

  async performNativeClick(x: number, y: number): Promise<void> {
    // Capacitor native: Plugins.AccessibilityBridge.click({ x, y });
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    el?.click();
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  destroy(): void {
    this.mutationObserver?.disconnect();
    this.liveRegion?.remove();
    this.assertiveLiveRegion?.remove();
    this.alertCallbacks = [];
  }
}
