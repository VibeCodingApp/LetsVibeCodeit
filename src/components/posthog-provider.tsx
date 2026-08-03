'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import posthog from 'posthog-js';

let initialized = false;

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (initialized) return;

    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!token || !host) return;

    posthog.init(token, {
      api_host: host,
      defaults: '2026-05-30',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      capture_exceptions: true,
    });
    initialized = true;
  }, []);

  return children;
}
