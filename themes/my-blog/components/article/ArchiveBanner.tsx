interface ArchiveBannerProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
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
      className={`rp-archive-banner mb-4 h-[200px] w-full overflow-hidden rounded-lg bg-[var(--bg-second)] text-center shadow-[var(--box-shadow)] md:h-[280px] ${className}`}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: isBrandFallback ? 'contain' : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <p className="m-0 mt-12 text-2xl font-medium text-[var(--font-color-base,#fff)] [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)] md:mt-20 md:text-[2rem]">
        {title}
      </p>
      <p className="mt-3 mb-0 text-lg text-[var(--font-color-base,#fff)] [text-shadow:1px_1px_2px_rgba(0,0,0,0.5)] md:text-2xl">
        {subtitle}
      </p>
    </div>
  );
}
