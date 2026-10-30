import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';
export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800',
        className,
      )}
      {...props}
    />
  );
}
