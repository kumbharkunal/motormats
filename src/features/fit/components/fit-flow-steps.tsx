import { cn } from '@/lib/utils';

const FLOW = [
  'Car',
  'Model',
  'Year',
  'Exact fit',
  'Material',
  'Buy',
] as const;

export function FitFlowSteps({ className }: { className?: string }) {
  return (
    <ol
      className={cn(
        'mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2',
        className,
      )}
      aria-label="Fit journey steps"
    >
      {FLOW.map((label, index) => (
        <li key={label}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[0.6875rem] font-bold text-white"
            >
              {index + 1}
            </span>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
