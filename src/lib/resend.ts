const RESEND_API = 'https://api.resend.com';
const AUDIENCE_NAME = 'LetsVibeCodeit Digest';

interface ResendAudience { id: string; name: string }
export interface ResendContact { email: string; unsubscribed: boolean }

function getKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('resend_not_configured');
  return key;
}

async function resendRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${getKey()}`);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(`${RESEND_API}${path}`, { ...init, headers, cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`resend_request_failed:${response.status}`);
  return data as T;
}

export async function getDigestAudienceId(): Promise<string> {
  const result = await resendRequest<{ data: ResendAudience[] }>('/audiences');
  const existing = result.data.find(audience => audience.name === AUDIENCE_NAME);
  if (existing) return existing.id;
  const created = await resendRequest<{ id: string }>('/audiences', {
    method: 'POST',
    body: JSON.stringify({ name: AUDIENCE_NAME }),
  });
  return created.id;
}

export async function addDigestContact(email: string): Promise<void> {
  const audienceId = await getDigestAudienceId();
  await resendRequest(`/audiences/${audienceId}/contacts`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function getDigestContacts(): Promise<ResendContact[]> {
  const audienceId = await getDigestAudienceId();
  const result = await resendRequest<{ data: ResendContact[] }>(`/audiences/${audienceId}/contacts?limit=100`);
  return result.data;
}

function sender(): string {
  const value = process.env.RESEND_FROM_EMAIL;
  if (!value) throw new Error('resend_sender_not_configured');
  return value;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await resendRequest('/emails', {
    method: 'POST',
    body: JSON.stringify({ from: sender(), to: [to], subject, html }),
  });
}

export async function sendBatchEmail(recipients: string[], subject: string, html: string): Promise<number> {
  let sent = 0;
  for (let index = 0; index < recipients.length; index += 100) {
    const batch = recipients.slice(index, index + 100).map(to => ({ from: sender(), to: [to], subject, html }));
    if (!batch.length) continue;
    await resendRequest('/emails/batch', { method: 'POST', body: JSON.stringify(batch) });
    sent += batch.length;
  }
  return sent;
}
