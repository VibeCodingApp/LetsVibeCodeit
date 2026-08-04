import type { MetadataRoute } from 'next';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getAllApps } from '@/lib/apps';
import { MOAT_TAGS } from '@/lib/constants';

const base = 'https://letsvibecodeit.com';
const appDir = join(process.cwd(), 'src', 'app');

export const revalidate = 3600;

function discoverStaticRoutes(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];
  const walk = (directory: string, segments: string[]) => {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        if (entry !== 'api' && !entry.startsWith('[')) walk(fullPath, [...segments, entry]);
        continue;
      }
      if (entry !== 'page.tsx' || segments.includes('claim')) continue;
      routes.push({ url: `${base}/${segments.join('/')}`.replace(/\/$/, ''), lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 });
    }
  };
  walk(appDir, []);
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/categories`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/moats`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/stats`, lastModified, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${base}/sponsor`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/vibecode-this-site`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    ...discoverStaticRoutes(),
  ];

  const appRoutes: MetadataRoute.Sitemap = getAllApps().map(app => ({
    url: `${base}/${app.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(getAllApps().map(app => app.category)),
  ).map(cat => ({
    url: `${base}/category/${encodeURIComponent(cat)}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const moatRoutes: MetadataRoute.Sitemap = Object.keys(MOAT_TAGS).map(tag => ({
    url: `${base}/moat/${tag}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return Array.from(new Map(
    [...staticRoutes, ...appRoutes, ...categoryRoutes, ...moatRoutes].map(entry => [entry.url, entry]),
  ).values());
}
