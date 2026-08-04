export function AppIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 select-none items-center justify-center border border-[var(--border)] bg-[var(--surface-2)] font-display font-bold text-primary ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
