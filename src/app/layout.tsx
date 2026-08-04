import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SponsorRails } from '@/components/sponsor-rails';
import { MobileAdMarquee } from '@/components/mobile-ad-marquee';
import { ThemeProvider } from '@/components/theme-provider';
import { PostHogProvider } from '@/components/posthog-provider';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0b0d0b',
};

const sg = Space_Grotesk({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-display' });
const jm = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500','700'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://letsvibecodeit.com'),
  title: {
    default: 'LetsVibeCodeit.com - Which subscriptions are one prompt away from free',
    template: '%s · LetsVibeCodeit.com',
  },
  description: 'The leaderboard of SaaS apps you can replace with a focused build, with honest verdicts and the trade-offs of leaving.',
  openGraph: {
    type: 'website',
    url: 'https://letsvibecodeit.com',
    siteName: 'LetsVibeCodeit.com',
    locale: 'en_US',
    title: 'LetsVibeCodeit.com - Which subscriptions are one prompt away from free',
    description: 'The leaderboard of SaaS apps you can replace with a focused build, with honest verdicts and the trade-offs of leaving.',
  },
  twitter: { card: 'summary_large_image', title: 'LetsVibeCodeit.com', description: 'Which subscriptions are one prompt away from free' },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-256.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sg.variable} ${jm.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'LetsVibeCodeit.com',
          url: 'https://letsvibecodeit.com',
          description: 'The leaderboard of SaaS apps you can replace with a focused build.',
          potentialAction: { '@type': 'SearchAction', target: 'https://letsvibecodeit.com/api/search?q={search_term_string}', 'query-input': 'required name=search_term_string' },
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'LetsVibeCodeit.com',
          url: 'https://letsvibecodeit.com',
        }) }} />
      </head>
      <body className="min-h-screen">
        <PostHogProvider>
          <ThemeProvider>
            <Header />
            <MobileAdMarquee />
            <SponsorRails />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
