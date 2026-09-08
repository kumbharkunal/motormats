import Image from 'next/image';

import { cn } from '@/lib/utils';

const SIZES = {
  sm: { className: 'h-8', width: 129, height: 32 },
  md: { className: 'h-10', width: 161, height: 40 },
  lg: { className: 'h-14', width: 226, height: 56 },
} as const;

type LogoSize = keyof typeof SIZES;

export function MotormatsLogo({
  size = 'md',
  priority = false,
  className,
}: {
  size?: LogoSize;
  priority?: boolean;
  className?: string;
}) {
  const { className: sizeClass, width, height } = SIZES[size];

  return (
    <Image
      src="/brand/logo.webp"
      alt="Motormats"
      width={width}
      height={height}
      priority={priority}
      // The Cloudinary loader passes /-prefixed sources through unchanged; unoptimized avoids the width warning.
      unoptimized
      className={cn('w-auto object-contain', sizeClass, className)}
    />
  );
}
