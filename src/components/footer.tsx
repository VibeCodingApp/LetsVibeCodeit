export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-12">
      <div className="container-main">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-3 text-center">
          <div className="h-px w-16 bg-primary/50" aria-hidden="true" />
          <p className="text-[13px] text-muted-2">
            Yes, you can vibecode this site too.{' '}
            <a href="/vibecode-this-site" className="text-primary underline underline-offset-2 hover:decoration-primary">How this site works</a>
            {' '}·{' '}
            <a href="https://github.com/VibeCodingApp/LetsVibeCodeit" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:decoration-primary">Source on GitHub</a>
          </p>
          <p className="text-[12px] leading-relaxed text-muted-2">built by @robj3d3 · MIT · no third-party trackers · weekly: what got a verdict, what died.</p>
        </div>
      </div>
    </footer>
  );
}