import SakuraSVG from '@components/svg/SakuraSvg';
import { motionConfig } from '@constants/site-config';
import { cn } from '@lib/utils';
import type { ReactNode } from 'react';

const BLOOM_CLASS = 'section-divider-bloom size-4 shrink-0';

/** Flower on each side of a section title. A configured svg/gif replaces the built-in sakura. */
function SectionBloom() {
  const src = motionConfig.sectionBloom;
  if (!src) return <SakuraSVG className={cn(BLOOM_CLASS, 'text-primary/70')} />;
  return <img src={src} alt="" draggable={false} className={cn(BLOOM_CLASS, 'object-contain')} />;
}

export default function Divider({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn('section-divider my-4 flex items-center gap-4', className)}>
      <span className="section-divider-line h-px grow origin-right bg-linear-to-r from-transparent to-primary/45" />
      {children ? (
        <h2 className="section-divider-title flex items-center gap-2.5 font-bold text-2xl text-foreground/70 tracking-widest">
          <SectionBloom />
          {children}
          <SectionBloom />
        </h2>
      ) : null}
      <span className="section-divider-line h-px grow origin-left bg-linear-to-l from-transparent to-primary/45" />
    </div>
  );
}
