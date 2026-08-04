export function trackSponsorEvent(sessionId: string, eventType: 'impression' | 'click', placement: string): void {
  const payload = JSON.stringify({ sessionId, eventType, placement, pagePath: window.location.pathname });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/sponsors/event', new Blob([payload], { type: 'application/json' }));
    return;
  }
  void fetch('/api/sponsors/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
}
