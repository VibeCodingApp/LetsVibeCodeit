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
    { q: 'Why is the full build prompt not shown?', a: 'The source prompt is kept private. The public page intentionally focuses on the verdict, trade-offs, alternatives, and scope of the replacement.' },
    { q: `Why would people still pay for ${app.name}?`, a: app.whyPeopleStillPay || 'Convenience, integrations, support, and the maturity of the hosted product.' },
  ];
}