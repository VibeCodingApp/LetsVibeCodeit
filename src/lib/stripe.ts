const STRIPE_API = 'https://api.stripe.com/v1';
const STRIPE_FILES_API = 'https://files.stripe.com/v1';
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://letsvibecodeit.com';

export const SPONSOR_PLANS = {
  rail: { label: 'Fixed side rail', amount: 19900, description: 'One fixed L/R rail placement for 30 days' },
  hero: { label: 'Hero vertical', amount: 4900, description: 'One rotating hero placement for 30 days' },
  inList: { label: 'In-list placement', amount: 7900, description: 'One rotating in-list placement for 30 days' },
  digest: { label: 'Weekly digest', amount: 2500, description: 'One native placement in up to four weekly sends' },
} as const;

export type SponsorPlan = keyof typeof SPONSOR_PLANS;

export interface StripeCheckoutSession {
  id: string;
  status: 'open' | 'complete' | 'expired' | null;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  created: number;
  expires_at: number;
  metadata: Record<string, string>;
  customer_details?: { email?: string | null } | null;
}

function getKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('stripe_not_configured');
  return key;
}

async function stripeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${getKey()}`);
  const response = await fetch(`${STRIPE_API}${path}`, { ...init, headers, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`stripe_request_failed:${response.status}`);
  return data as T;
}

function metadataParams(metadata: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(metadata).forEach(([key, value]) => params.set(`metadata[${key}]`, value));
  return params;
}

export async function createCheckoutSession(plan: SponsorPlan, slotId: string): Promise<{ id: string; url: string }> {
  const product = SPONSOR_PLANS[plan];
  const params = new URLSearchParams({
    mode: 'payment',
    success_url: `${SITE_URL}/sponsor/claim?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/sponsor?cancelled=1`,
    customer_creation: 'always',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(product.amount),
    'line_items[0][price_data][product_data][name]': `LetsVibeCodeit ${product.label}`,
    'line_items[0][price_data][product_data][description]': product.description,
    'line_items[0][quantity]': '1',
  });
  Object.entries({ plan, slotId, claimed: 'false' }).forEach(([key, value]) => params.set(`metadata[${key}]`, value));
  const session = await stripeRequest<{ id: string; url: string }>('/checkout/sessions', { method: 'POST', body: params });
  return { id: session.id, url: session.url };
}

export async function createTestCheckoutSession(): Promise<string> {
  const params = new URLSearchParams({
    mode: 'setup',
    currency: 'usd',
    success_url: `${SITE_URL}/sponsor/claim?test_slot=left-1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/sponsor`,
    'metadata[plan]': 'rail',
    'metadata[slotId]': 'left-1',
    'metadata[test]': 'true',
    'metadata[claimed]': 'false',
  });
  const session = await stripeRequest<{ id: string }>('/checkout/sessions', { method: 'POST', body: params });
  return session.id;
}

export async function retrieveCheckoutSession(id: string): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(`/checkout/sessions/${encodeURIComponent(id)}`);
}

export async function listCheckoutSessions(status: 'open' | 'complete'): Promise<StripeCheckoutSession[]> {
  const sessions: StripeCheckoutSession[] = [];
  let startingAfter = '';
  for (let page = 0; page < 10; page += 1) {
    const params = new URLSearchParams({ limit: '100', status });
    if (startingAfter) params.set('starting_after', startingAfter);
    const result = await stripeRequest<{ data: StripeCheckoutSession[]; has_more: boolean }>(`/checkout/sessions?${params}`);
    sessions.push(...result.data);
    if (!result.has_more || !result.data.length) break;
    startingAfter = result.data[result.data.length - 1].id;
  }
  return sessions;
}

export async function updateCheckoutMetadata(id: string, metadata: Record<string, string>): Promise<void> {
  await stripeRequest(`/checkout/sessions/${encodeURIComponent(id)}`, { method: 'POST', body: metadataParams(metadata) });
}

export async function uploadSponsorAsset(file: File, purpose: 'business_icon' | 'business_logo'): Promise<string> {
  const bytes = await file.arrayBuffer();
  const form = new FormData();
  form.append('purpose', purpose);
  form.append('file', new Blob([bytes], { type: file.type }), file.name || 'sponsor-icon');
  const response = await fetch(`${STRIPE_FILES_API}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getKey()}` },
    body: form,
    cache: 'no-store',
  });
  const uploaded = await response.json().catch(() => ({}));
  if (!response.ok || !uploaded.id) throw new Error(`stripe_file_upload_failed:${response.status}`);
  const linkParams = new URLSearchParams({ file: uploaded.id });
  const link = await stripeRequest<{ url: string }>('/file_links', { method: 'POST', body: linkParams });
  return link.url;
}
