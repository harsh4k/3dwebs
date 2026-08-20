'use client';

import Link from 'next/link';

export function ServiceCard({
  href,
  client,
  title,
  bg,
}: {
  href: string;
  client: string;
  title: string;
  bg: string;
}) {
  return (
    <Link href={href} className="relative block size-full overflow-hidden rounded-[var(--radius-card)] text-[var(--cc-dark-ink)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bg}
        alt=""
        className="absolute inset-0 size-full object-cover object-center"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-[3.2vmin]">
        <p className="text-[1.4vmin] tracking-[0.06em] text-paper/80 uppercase">{client}</p>
        <h3 className="mt-[0.6vmin] text-[3.2vmin] leading-[1.1] font-normal text-paper">{title}</h3>
      </div>
    </Link>
  );
}
