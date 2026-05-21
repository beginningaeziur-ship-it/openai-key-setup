// ── Shopping Workflow ──────────────────────────────────────────────────────────
// Automates product identification, shopping cart management, and checkout.
// Reads product details including price, color, expiration dates.

import type { AutomationResult, ShoppingCart, ShoppingProduct } from '../types/interpreter.types';
import { AccessibilityController } from '../core/AccessibilityController';
import { UIAutomationEngine } from '../core/UIAutomationEngine';
import { MultiAIOrchestrator } from '../providers/MultiAIOrchestrator';

export class ShoppingWorkflow {
  private cart: ShoppingCart = { items: [], store: undefined };

  constructor(
    private accessibility: AccessibilityController,
    private automation: UIAutomationEngine,
    private ai: MultiAIOrchestrator
  ) {}

  // ── Product Identification ─────────────────────────────────────────────────

  async identifyCurrentProduct(): Promise<ShoppingProduct> {
    const screen = this.accessibility.getScreenState();
    const rawContent = [
      screen.title,
      screen.mainContent || '',
      ...screen.headings,
    ].join('\n');

    const prompt = `Extract product details from this page content for a blind user.

Page content:
${rawContent.slice(0, 1000)}

Respond with JSON only:
{
  "name": "product name",
  "price": "price as string e.g. $12.99",
  "description": "brief 1-sentence description",
  "color": "color if mentioned",
  "brand": "brand name if visible",
  "expirationDate": "expiration date if food/medicine",
  "inStock": true/false
}`;

    try {
      const result = await this.ai.complete(prompt, 'shop');
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned) as ShoppingProduct;
    } catch {
      return {
        name: screen.title || 'Product',
        description: screen.mainContent?.slice(0, 100),
        inStock: true,
      };
    }
  }

  async describeProduct(product: ShoppingProduct): Promise<string> {
    const parts: string[] = [];

    parts.push(product.name);
    if (product.brand) parts.push(`by ${product.brand}`);
    if (product.price) parts.push(`Price: ${product.price}`);
    if (product.color) parts.push(`Color: ${product.color}`);
    if (product.description) parts.push(product.description);
    if (product.expirationDate) parts.push(`Expires: ${product.expirationDate}`);
    if (product.inStock === false) parts.push('Out of stock');

    return parts.join('. ');
  }

  async readProductPrice(): Promise<string> {
    const priceSelectors = [
      '[class*="price"]',
      '[data-testid*="price"]',
      '[aria-label*="price"]',
      '.price', '#price',
      '[class*="cost"]',
    ];

    for (const sel of priceSelectors) {
      const el = document.querySelector(sel);
      if (el?.textContent?.trim()) {
        return `Price: ${el.textContent.trim()}`;
      }
    }

    // AI fallback
    const screen = this.accessibility.getScreenState();
    const prompt = `What is the price on this page? Content: ${screen.mainContent?.slice(0, 500)}
Answer with just the price, e.g. "$29.99" or "Not found".`;
    return this.ai.complete(prompt, 'shop');
  }

  async readExpirationDate(): Promise<string> {
    const screen = this.accessibility.getScreenState();
    const content = screen.mainContent || '';

    const datePattern = /(?:exp(?:ires?)?(?:ation)?|best by|use by|sell by)[\s:]+([A-Za-z0-9\/\-]+)/i;
    const match = content.match(datePattern);
    if (match) return `Expiration date: ${match[1]}`;

    const prompt = `Find the expiration or best-by date on this page.
Content: ${content.slice(0, 500)}
Answer with just the date or "No expiration date found".`;
    return this.ai.complete(prompt, 'shop');
  }

  async describeProductColor(): Promise<string> {
    const screen = this.accessibility.getScreenState();

    // Check color swatches
    const colorElements = Array.from(document.querySelectorAll(
      '[class*="color"], [data-color], [aria-label*="color"], [class*="swatch"]'
    ));
    const selected = colorElements.find(el =>
      el.getAttribute('aria-selected') === 'true' ||
      el.classList.contains('selected') ||
      el.classList.contains('active')
    );
    if (selected) {
      const colorLabel =
        selected.getAttribute('aria-label') ||
        selected.getAttribute('data-color') ||
        selected.textContent?.trim();
      if (colorLabel) return `Selected color: ${colorLabel}`;
    }

    const prompt = `What color options are available on this page?
Content: ${screen.mainContent?.slice(0, 500)}
Answer briefly, e.g. "Available in red, blue, and black. Red is currently selected."`;
    return this.ai.complete(prompt, 'shop');
  }

  // ── Cart Management ────────────────────────────────────────────────────────

  async addToCart(productQuery?: string): Promise<AutomationResult> {
    const addButtonLabels = [
      'Add to Cart', 'Add to Bag', 'Add to Basket',
      'Buy Now', 'Add', 'Purchase',
    ];

    for (const label of addButtonLabels) {
      const result = await this.automation.execute({ type: 'click', target: label });
      if (result.success) {
        // Track in local cart
        if (productQuery) {
          this.cart.items.push({ name: productQuery });
        }
        return { success: true, message: `Added to cart. Cart has ${this.cart.items.length} items.` };
      }
    }

    return { success: false, message: 'Could not find Add to Cart button. Try saying "click add to cart button".' };
  }

  async viewCart(): Promise<string> {
    // Navigate to cart
    const cartLinks = ['cart', 'shopping cart', 'bag', 'basket'];
    for (const label of cartLinks) {
      const result = await this.automation.execute({ type: 'click', target: label });
      if (result.success) return 'Opening cart...';
    }

    if (this.cart.items.length === 0) return 'Your cart is empty.';
    const items = this.cart.items.map(i => i.name).join(', ');
    return `Cart has ${this.cart.items.length} items: ${items}. Total: ${this.cart.total || 'unknown'}.`;
  }

  // ── Checkout Automation ────────────────────────────────────────────────────

  async startCheckout(): Promise<AutomationResult> {
    const checkoutLabels = ['Checkout', 'Proceed to Checkout', 'Buy Now', 'Place Order'];
    for (const label of checkoutLabels) {
      const result = await this.automation.execute({ type: 'click', target: label });
      if (result.success) return result;
    }
    return { success: false, message: 'Could not find checkout button.' };
  }

  async fillShippingAddress(address: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }): Promise<AutomationResult[]> {
    const fields: Record<string, string> = {};
    if (address.name) fields['Full Name'] = address.name;
    if (address.street) fields['Address'] = address.street;
    if (address.city) fields['City'] = address.city;
    if (address.state) fields['State'] = address.state;
    if (address.zip) fields['ZIP'] = address.zip;
    if (address.country) fields['Country'] = address.country;

    return this.automation.fillForm(fields);
  }

  async confirmOrder(): Promise<AutomationResult> {
    const screen = this.accessibility.getScreenState();
    const summary = screen.mainContent?.slice(0, 300) || 'Order details not available';

    this.accessibility.announceUrgent(`Ready to place order. ${summary}. Say "confirm" to proceed.`);

    return { success: true, message: `Order summary: ${summary}. Say "confirm order" to complete purchase.` };
  }

  async placeOrder(): Promise<AutomationResult> {
    const placeOrderLabels = ['Place Order', 'Confirm Order', 'Complete Purchase', 'Submit Order', 'Pay Now'];
    for (const label of placeOrderLabels) {
      const result = await this.automation.execute({ type: 'click', target: label });
      if (result.success) {
        this.cart = { items: [], store: undefined };
        return { success: true, message: 'Order placed successfully!' };
      }
    }
    return { success: false, message: 'Could not find place order button.' };
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  async searchForProduct(query: string): Promise<AutomationResult> {
    // Find search input
    const searchResult = await this.automation.execute({
      type: 'type',
      target: 'search',
      value: query,
    });

    if (!searchResult.success) {
      return { success: false, message: 'Could not find search input.' };
    }

    // Submit search
    const searchInput = this.accessibility.findElementByLabel('search');
    if (searchInput) {
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }

    return { success: true, message: `Searching for: ${query}` };
  }

  getCart(): ShoppingCart {
    return this.cart;
  }
}
