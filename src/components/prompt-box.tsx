'use client';

import { useState } from 'react';
import posthog from 'posthog-js';
import { AGENT_VARIANTS, AGENT_LABELS, type AgentVariant } from '@/lib/constants';

export function PromptBox({ prompt, appName }: { prompt: string; appName: string }) {
  const [agent, setAgent] = useState<AgentVariant>('raw');
  const [copied, setCopied] = useState(false);

  const prefixes: Record<AgentVariant, string> = {
    raw: '',
    'claude-code': `Please build a replacement for ${appName}:\n\n`,
    codex: `@codex build a replacement for ${appName}:\n\n`,
    cursor: `Build a replacement for ${appName}:\n\n`,
  };

  const full = prefixes[agent] + prompt;

  const copy = async () => {
    await navigator.clipboard.writeText(full);
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture('prompt_copied', { app_name: appName, agent_variant: agent });
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-surface-2">
      <div className="flex items-center gap-1.5 p-2 border-b border-[var(--border)] bg-surface-3">
        {AGENT_VARIANTS.map(v => (
          <button key={v} onClick={() => setAgent(v)}
            className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${agent === v ? 'bg-primary text-black font-semibold' : 'text-muted hover:text-fg hover:bg-surface-2'}`}>
            {AGENT_LABELS[v]}
          </button>
        ))}
      </div>
      <div className="p-4 md:p-5">
        <pre className="font-mono text-[13.5px] leading-relaxed text-fg whitespace-pre-wrap mb-4 max-h-[400px] overflow-y-auto">{full}</pre>
        <button onClick={copy} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-display font-semibold text-sm transition-all ${copied ? 'bg-primary text-black' : 'bg-surface-3 text-fg border border-[var(--border)] hover:border-[var(--border-2)]'}`}>
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>
    </div>
  );
}