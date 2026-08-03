import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SponsorRails } from '@/components/sponsor-rails';
import { ThemeProvider } from '@/components/theme-provider';
import { PostHogProvider } from '@/components/posthog-provider';
import './globals.css';

const sg = Space_Grotesk({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-display' });
const jm = JetBrains_Mono({ subsets: ['latin'], weight: ['400','500','700'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'LetsVibeCodeit.com â€” Which subscriptions are one prompt away from free',
  description: 'The leaderboard of SaaS apps you can replace with a focused build, with honest verdicts and the trade-offs of leaving.',
  openGraph: { title: 'LetsVibeCodeit.com', description: 'Which subscriptions are one prompt away from free' },
  twitter: { card: 'summary_large_image', title: 'LetsVibeCodeit.com', description: 'Which subscriptions are one prompt away from free' },
  robots: { index: true, follow: true },
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
            <SponsorRails />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}