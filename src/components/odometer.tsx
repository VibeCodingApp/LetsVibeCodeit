'use client';
import { useEffect, useRef, useState } from 'react';

export function Odometer({ target }: { target: number }) {
  const [v, setV] = useState(0); const ref = useRef<HTMLSpanElement>(null); const done = useRef(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if(e.isIntersecting&&!done.current){done.current=true;const d=1500;const s=performance.now();const t=(ts:number)=>{const p=Math.min((ts-s)/d,1);const x=1-Math.pow(1-p,3);setV(Math.round(target*x));if(p<1)requestAnimationFrame(t)};requestAnimationFrame(t)};},{threshold:.5});
    if(ref.current)o.observe(ref.current); return ()=>o.disconnect();
  },[target]);
  return <span ref={ref} className="font-display text-4xl md:text-5xl font-bold text-danger tabular-nums">${v.toLocaleString()}</span>;
}
