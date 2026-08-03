export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12">
      <div className="container-main flex flex-col items-center gap-2 text-center">
        <p className="text-muted-2 text-[13px]">
          Yes, you can vibecode this site too.{' '}
          <a href="/vibecode-this-site" className="text-primary no-underline hover:underline">Here&rsquo;s the prompt</a>
          {' '}·{' '}
          <a href="https://github.com/canivibecodeit/canivibecodeit" target="_blank" rel="noopener noreferrer" className="text-primary no-underline hover:underline">Source on GitHub</a>
        </p>
        <p className="text-muted-2 text-[12px]">built by @robj3d3 · MIT · no third-party trackers · weekly: what got a verdict, what died.</p>
      </div>
    </footer>
  );
}
