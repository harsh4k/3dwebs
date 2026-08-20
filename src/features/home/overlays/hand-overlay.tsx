import { RevealItem, RevealText } from '@/components/common/reveal';
import { totalBodies } from '@/content/awards';
import { totalClients } from '@/content/clients';
import { TOTAL_PROJECTS } from '@/content/projects';
import { awardsFraming } from '@/content/site';

const STATS = [
  { value: String(totalBodies), label: 'Awarding bodies' },
  { value: String(TOTAL_PROJECTS), label: 'Projects in the record' },
  { value: String(totalClients), label: 'Named clients' },
];

export const HandOverlay = () => {
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-display text-overlay-ink">
      <div className="absolute left-[1.25rem] right-[1.25rem] top-[4.5rem] md:left-[1.875rem] md:right-auto md:top-[4.75rem] md:w-[38rem] md:max-w-[70vw]">
        <RevealText
          tag="h2"
          variant="heading"
          act="hand"
          className="text-[2.25rem] font-extralight uppercase leading-[1.1] md:text-[4rem]"
        >
          the record
        </RevealText>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-[1.5rem] px-[1.25rem] pb-[1.25rem] md:px-[1.875rem] md:pb-[2.1875rem]">
        <div className="flex w-full flex-col gap-[1rem] md:w-auto md:gap-[1.75rem]">
          <div className="md:w-[27.5rem] md:max-w-[45vw]">
            <RevealText
              tag="p"
              variant="copy"
              act="hand"
              delayIn={160}
              className="text-[0.8125rem] font-normal uppercase leading-[1.2] md:text-[1rem]"
            >
              {awardsFraming}
            </RevealText>
          </div>

          <ul className="flex w-full justify-between font-light md:w-[31.25rem] md:max-w-[52vw]">
            {STATS.map((stat, i) => (
              <RevealItem
                key={stat.label}
                tag="li"
                act="hand"
                index={i}
                count={STATS.length}
                delay={280}
                className="flex flex-col gap-[0.25rem] whitespace-nowrap border-l border-overlay-strong pl-[0.625rem] md:gap-[0.5rem] md:pl-[1rem]"
              >
                <span className="text-[1.125rem] leading-none md:text-[1.5rem]">{stat.value}</span>
                <span className="text-[0.75rem] leading-[1.1] md:text-[1rem]">{stat.label}</span>
              </RevealItem>
            ))}
          </ul>
        </div>

        <p className="hidden shrink-0 flex-col items-end whitespace-nowrap text-right text-[4rem] font-extralight uppercase leading-[1.1] md:flex">
          <RevealText tag="span" variant="heading" act="hand" delayIn={80}>
            the digital
          </RevealText>
          <RevealText tag="span" variant="heading" act="hand" delayIn={170}>
            branding people
          </RevealText>
        </p>
      </div>
    </div>
  );
};
