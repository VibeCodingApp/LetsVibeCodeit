export const dynamic = 'force-static';

export default function VibecodePage() {
  return (
    <div className="container-main py-10 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Vibecode This Site</h1>
      <p className="text-muted text-sm mb-8">The public repository keeps the original generation prompt private.</p>

      <div className="bg-surface-2 border border-[var(--border)] rounded-xl p-6 mb-6">
        <h2 className="font-display text-xl font-bold mb-4">Public architecture summary</h2>
        <ul className="space-y-2 text-muted text-sm leading-relaxed">
          <li>Next.js 14 App Router with TypeScript strict mode.</li>
          <li>Static app catalog in data/apps with server-rendered pages.</li>
          <li>Tailwind CSS with dark/light theme variables.</li>
          <li>Sticky header, blurred single-slot in-list ad layer, sponsors, and AdSense anchors.</li>
          <li>PostHog pageviews, autocapture, custom events, and live aggregate stats.</li>
        </ul>
      </div>

      <p className="text-muted-2 text-xs text-center">
        The exact generation prompt is intentionally excluded from this public mirror.
      </p>
    </div>
  );
}