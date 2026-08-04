import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LetsVibeCodeit.com',
    short_name: 'VibeCodeit',
    description: 'The leaderboard of SaaS apps you can replace with a focused build, with honest verdicts and the trade-offs of leaving.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0d0b',
    theme_color: '#0b0d0b',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
