import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-main flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
        <p className="text-muted text-lg mb-6">This page hasn&apos;t been vibecoded yet.</p>
        <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-black font-display font-semibold">Back to the vibecoded list</a>
      </div>
    </div>
  );
}
