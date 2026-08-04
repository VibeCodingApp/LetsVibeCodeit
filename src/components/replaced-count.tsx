'use client';
import { useEffect, useState } from 'react';
import { getLocalVote } from '@/lib/votes';

export function ReplacedCount({ slug, initial }: { slug: string; initial: number }) {
  const [count, setCount] = useState(initial);
  useEffect(() => {
    if (getLocalVote(slug) === 'yes') setCount(initial + 1);
  }, [slug, initial]);
  return <span>{count} people</span>;
}
