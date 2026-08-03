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

    const params = new URLSearchParams(window.location.search);
    const synthetic = params.get('ph_synthetic') === '1';
    const syntheticRun = params.get('ph_run') || 'unknown';
    if (synthetic) {
      posthog.register({ synthetic_test: true, test_run: syntheticRun });
    }

    posthog.init(token, {
      api_host: host,
      defaults: '2026-05-30',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      capture_exceptions: true,
      request_batching: false,
      opt_out_useragent_filter: true,
      ip: true,
      debug: process.env.NODE_ENV === 'development',
    });

    if (synthetic) {
      posthog.register({ synthetic_test: true, test_run: syntheticRun });
    }
    initialized = true;
  }, []);

  return children;
}
