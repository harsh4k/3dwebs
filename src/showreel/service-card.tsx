'use client';

export function ServiceCard({
  variant,
  url,
  leadStrong,
  pillLabel,
  pillTitle,
  searchText,
  bg,
}: {
  variant: 'dark' | 'light';
  url: string;
  leadStrong: string;
  pillLabel?: string;
  pillTitle?: string;
  searchText?: string;
  bg: string;
}) {
  const dark = variant === 'dark';
  const ink = dark ? 'text-[var(--cc-dark-ink)]' : 'text-[var(--cc-light-ink)]';

  return (
    <div className={`relative size-full overflow-hidden rounded-[var(--radius-card)] ${ink}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={bg} alt="" className="absolute inset-0 size-full object-cover" decoding="async" />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 flex flex-col p-[3.2vmin] font-sans">
        <div className="flex items-center justify-between">
          <span
            aria-hidden
            className="flex size-[3.4vmin] shrink-0 items-center justify-center rounded-[0.9vmin] bg-white text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" className="size-[2.2vmin]" fill="currentColor">
              <path d="M12 2 L13.9 10.1 L22 12 L13.9 13.9 L12 22 L10.1 13.9 L2 12 L10.1 10.1 Z" />
            </svg>
          </span>
          <span className="text-[1.5vmin] tracking-[0.02em] text-white opacity-85">{url}</span>
        </div>

        {dark ? (
          <div className="mt-[2.6vmin] flex items-center justify-between gap-[1.5vmin] rounded-[4vmin] border border-[var(--glass-border)] bg-[var(--glass-dark)] px-[2vmin] py-[1.8vmin] backdrop-blur-[10px]">
            <span className="flex flex-col gap-[0.4vmin] text-white">
              <span className="text-[1.4vmin] opacity-60">{pillLabel}</span>
              <span className="text-[2.2vmin]">{pillTitle}</span>
            </span>
            <span className="flex size-[3vmin] shrink-0 items-center justify-center rounded-full bg-[var(--glass-border)] text-[1.9vmin] text-white">
              +
            </span>
          </div>
        ) : (
          <div className="my-auto flex items-center gap-[1.4vmin] rounded-[5vmin] bg-[var(--cc-search)] px-[2.2vmin] py-[2vmin] text-[var(--paper)]">
            <span className="flex size-[3vmin] shrink-0 items-center justify-center rounded-full bg-[var(--glass-border-soft)] text-[1.9vmin]">
              +
            </span>
            <span className="flex-1 overflow-hidden text-[1.7vmin] text-ellipsis whitespace-nowrap opacity-80">
              {searchText}
            </span>
            <span className="flex size-[3vmin] shrink-0 items-center justify-center rounded-full bg-[var(--glass-border-soft)] text-[1.9vmin]">
              →
            </span>
          </div>
        )}

        <div className="mt-auto">
          <h3 className="text-[3.4vmin] leading-[1.1] font-normal text-white">{leadStrong}</h3>
        </div>
      </div>
    </div>
  );
}
