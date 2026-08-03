'use client';

import { useState } from 'react';
import posthog from 'posthog-js';

export function PromptViewer({ slug, prompt }: { slug: string; prompt: string }) {
  const [copied, setCopied] = useState(false);
  const [openIn, setOpenIn] = useState<string | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) posthog.capture('prompt_copied', { app_slug: slug });
    } catch {
      setCopied(false);
    }
    window.setTimeout(() => setCopied(false), 2200);
  };

  const open = (tool: string) => {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) posthog.capture('prompt_open_in', { app_slug: slug, tool });
    setOpenIn(tool);
    window.setTimeout(() => setOpenIn(null), 2200);
  };

  const promptTools = [
    { tool: 'Claude Code', url: `https://claude.ai/new?q=${encodeURIComponent(prompt)}` },
    { tool: 'Codex', url: `https://chatgpt.com/?q=${encodeURIComponent(prompt)}` },
    { tool: 'Cursor', url: `https://cursor.com` },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3">
        <span className="font-mono text-[11px] text-muted-2">ready to paste · {prompt.length.toLocaleString()} chars</span>
        <div className="flex flex-wrap items-center gap-2">
          {promptTools.map(({ tool, url }) => (
            <a key={tool} href={url} target="_blank" rel="noopener noreferrer" onClick={() => open(tool)}
              className="rounded-lg border border-[var(--border)] bg-surface-3 px-3 py-1.5 font-mono text-[11px] font-semibold text-fg-2 no-underline transition-colors hover:border-[var(--border-2)] hover:text-fg">
              open in {tool}
            </a>
          ))}
          <button type="button" onClick={copy} aria-pressed={copied}
            className="rounded-lg bg-primary px-3 py-1.5 font-mono text-[11px] font-semibold text-black transition-all hover:brightness-110">
            {copied ? 'copied ✓' : 'copy prompt'}
          </button>
        </div>
      </div>
      <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-muted">{prompt}</pre>
    </div>
  );
}
