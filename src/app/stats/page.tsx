import { StatsDashboard } from '@/components/stats-dashboard';

export const dynamic = 'force-dynamic';

export default function StatsPage() {
  return (
    <div className="container-main py-10 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Site Analytics</h1>
      <p className="text-muted text-sm mb-8">Public, first-party numbers from this project&rsquo;s PostHog instance. Refreshed every 60 seconds.</p>
      <StatsDashboard />
    </div>
  );
}