// ── Navigation Workflow ────────────────────────────────────────────────────────
// Handles screen reading, element navigation, app switching, and web browsing.

import type { AutomationResult, ScreenState } from '../types/interpreter.types';
import { AccessibilityController } from '../core/AccessibilityController';
import { UIAutomationEngine } from '../core/UIAutomationEngine';
import { MultiAIOrchestrator } from '../providers/MultiAIOrchestrator';

export class NavigationWorkflow {
  constructor(
    private accessibility: AccessibilityController,
    private automation: UIAutomationEngine,
    private ai: MultiAIOrchestrator
  ) {}

  async readCurrentScreen(): Promise<string> {
    const state = this.accessibility.getScreenState();
    return this.describeScreen(state);
  }

  private async describeScreen(state: ScreenState): Promise<string> {
    const parts: string[] = [];

    if (state.title) parts.push(`Page: ${state.title}`);
    if (state.landmark) parts.push(`Region: ${state.landmark}`);
    if (state.alerts.length) parts.push(`Alert: ${state.alerts[0]}`);
    if (state.focusedElement) {
      parts.push(`Focused on: ${state.focusedElement.label}`);
    }
    if (state.headings.length) {
      parts.push(`Headings: ${state.headings.slice(0, 3).join(', ')}`);
    }

    const interactiveCount = state.interactiveElements.length;
    if (interactiveCount > 0) {
      const names = state.interactiveElements
        .slice(0, 5)
        .map(e => e.label)
        .join(', ');
      parts.push(`${interactiveCount} interactive elements including: ${names}`);
    }

    if (state.mainContent) {
      parts.push(`Content: ${state.mainContent.slice(0, 200)}`);
    }

    return parts.join('. ');
  }

  async describeElement(target: string): Promise<string> {
    const result = await this.automation.execute({ type: 'read', target });
    return result.message;
  }

  async navigateToElement(target: string): Promise<AutomationResult> {
    const result = await this.automation.execute({ type: 'focus', target });
    if (result.success) {
      this.accessibility.announce(`Moved to: ${result.message}`);
    }
    return result;
  }

  async navigateToUrl(url: string): Promise<AutomationResult> {
    return this.automation.execute({ type: 'navigate', value: url });
  }

  async navigateToApp(appName: string): Promise<AutomationResult> {
    // Web: navigate to known app routes
    const appRoutes: Record<string, string> = {
      home: '/',
      dashboard: '/dashboard',
      chat: '/chat',
      settings: '/settings',
      bedroom: '/bedroom',
      'sai room': '/sai-room',
      beach: '/beach',
      forest: '/forest',
      interpreter: '/interpreter',
    };

    const key = appName.toLowerCase().replace(/\s+/g, ' ');
    const route = appRoutes[key];

    if (route) {
      return this.automation.execute({ type: 'navigate', value: route });
    }

    // Try clicking navigation links with matching text
    return this.automation.execute({ type: 'click', target: appName });
  }

  async moveToNextElement(): Promise<string> {
    const el = this.accessibility.moveFocusToNext();
    if (!el) return 'No focusable elements found';
    return `${el.role}: ${el.label}${el.value ? `, Value: ${el.value}` : ''}`;
  }

  async listHeadings(): Promise<string> {
    const headings = this.accessibility.findHeadings();
    if (!headings.length) return 'No headings found on this page';
    return `Found ${headings.length} headings: ${headings.join('. ')}`;
  }

  async listLinks(): Promise<string> {
    const elements = this.accessibility.findInteractiveElements();
    const links = elements.filter(e => e.role === 'link' || e.tagName === 'a');
    if (!links.length) return 'No links found on this page';
    const names = links.slice(0, 10).map(l => l.label).join(', ');
    return `Found ${links.length} links: ${names}`;
  }

  async listButtons(): Promise<string> {
    const elements = this.accessibility.findInteractiveElements();
    const buttons = elements.filter(e => e.role === 'button' || e.tagName === 'button');
    if (!buttons.length) return 'No buttons found on this page';
    const names = buttons.slice(0, 10).map(b => b.label).join(', ');
    return `Found ${buttons.length} buttons: ${names}`;
  }

  async handleModalIfPresent(): Promise<string | null> {
    const modal = this.automation.detectModal();
    if (!modal) return null;
    this.accessibility.announceUrgent(`Dialog appeared: ${modal.label}`);
    return `Dialog: ${modal.label}`;
  }

  async scrollPage(direction: string): Promise<AutomationResult> {
    const result = await this.automation.execute({ type: 'scroll', value: direction });
    if (result.success) {
      this.accessibility.announce(result.message);
    }
    return result;
  }
}
