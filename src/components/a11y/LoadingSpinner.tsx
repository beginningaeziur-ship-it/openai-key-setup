import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

/**
 * Accessible loading indicator: visible spinner + polite live announcement.
 */
export function LoadingSpinner({ label = 'Loading', className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn('flex items-center gap-3', className)}
    >
      <span
        aria-hidden="true"
        className="inline-block w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
      />
      <span className="text-base text-[#B0BEC5]">{label}…</span>
    </div>
  );
}
