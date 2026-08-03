import type { AppData } from './types';

export function getAppFaq(app: AppData) {
  const verdict = app.verdict === 'yes'
    ? 'YES means a focused personal replacement is realistic in one sitting.'
    : app.verdict === 'kinda'
      ? 'KINDA means the core workflow is buildable, but the original still has meaningful advantages in polish, integrations, scale, or data.'
      : 'NOT REALLY means the original value depends heavily on network effects, proprietary data, regulated infrastructure, or a mature ecosystem.';
  const price = app.priceMonthly === null ? 'The source does not list a monthly price.' : app.priceMonthly === 0 ? 'The listed version is free.' : `The listed plan is about $${app.priceMonthly}/mo.`;
  const losses = app.whatYouLose.slice(0, 3).join('; ') || 'the hosted infrastructure, integrations, and ecosystem of the original service';

  return [
    { q: `Can I vibecode ${app.name}?`, a: `${verdict} ${app.tagline}` },
    { q: `How much does ${app.name} cost?`, a: price },
    { q: `What do I lose by replacing ${app.name}?`, a: `You give up ${losses}.` },
    { q: 'Where is the full build prompt?', a: app.prompt ? 'The full build prompt is published on this page under The Build Prompt. Copy it and paste it into your favorite coding agent.' : 'The full build prompt for this app is not published yet.' },
    { q: `Why would people still pay for ${app.name}?`, a: app.whyPeopleStillPay || 'Convenience, integrations, support, and the maturity of the hosted product.' },
  ];
}