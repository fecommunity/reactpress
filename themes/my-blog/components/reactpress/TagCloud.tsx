'use client';

import TagCloudEngine from '@/src/tagCloud/tag';
import { type ReactNode, useEffect, useRef } from 'react';

interface TagCloudProps {
  children: ReactNode;
  className?: string;
  'aria-hidden'?: boolean;
}

export default function TagCloud({ children, className = '', ...rest }: TagCloudProps) {
  const ref = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TagCloudEngine | null>(null);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new TagCloudEngine();
    }

    const el = ref.current;
    const engine = engineRef.current;
    if (!el) return undefined;

    const frame = requestAnimationFrame(() => {
      engine.init(el);
    });

    return () => {
      cancelAnimationFrame(frame);
      engine.destroy();
    };
  }, [children]);

  useEffect(() => {
    return () => engineRef.current?.destroy();
  }, []);

  return (
    <div ref={ref} className={`rp-tag-cloud ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
