import type { ReactNode } from 'react';

interface ArchiveBannerProps {
  title: ReactNode;
  subtitle: ReactNode;
  imageUrl: string;
  isBrandFallback?: boolean;
  className?: string;
}

export default function ArchiveBanner({
  title,
  subtitle,
  imageUrl,
  isBrandFallback = false,
  className = '',
}: ArchiveBannerProps) {
  return (
    <div
      className={`rp-archive-banner rp-cover-zoom-host mb-5 h-[200px] w-full overflow-hidden rounded-xl bg-[var(--bg-second)] text-center shadow-[var(--box-shadow)] ring-1 ring-black/5 dark:ring-white/5 md:h-[280px] ${className}`}
    >
      <img
        src={imageUrl}
        alt=""
        className={`rp-cover-zoom absolute inset-0 h-full w-full ${isBrandFallback ? 'object-contain' : 'object-cover'} object-center`}
      />
      <div className="rp-archive-banner__content">
        <p className="m-0 mt-12 text-2xl font-medium text-[var(--font-color-base,#fff)] [text-shadow:0_1px_3px_rgba(0,0,0,0.45)] md:mt-20 md:text-[2rem]">
          {title}
        </p>
        <p className="mt-3 mb-0 text-lg text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] md:text-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
