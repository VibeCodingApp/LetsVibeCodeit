import type { MetadataRoute } from 'next';
import { getAllApps } from '@/lib/apps';
import { MOAT_TAGS } from '@/lib/constants';

const base = 'https://letsvibecodeit.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/moats`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/stats`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    { url: `${base}/sponsor`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/vibecode-this-site`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const appRoutes: MetadataRoute.Sitemap = getAllApps().map(app => ({
    url: `${base}/${app.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(getAllApps().map(app => app.category)),
  ).map(cat => ({
    url: `${base}/category/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const moatRoutes: MetadataRoute.Sitemap = Object.keys(MOAT_TAGS).map(tag => ({
    url: `${base}/moat/${tag}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...appRoutes, ...categoryRoutes, ...moatRoutes];
}
