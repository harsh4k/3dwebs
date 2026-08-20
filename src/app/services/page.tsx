import { servicePillars } from '@/content/services';
import { InnerPage } from '@/features/page-shell/inner';

export default function ServicesPage() {
  return (
    <InnerPage title="Services">
      <ul className="flex flex-col gap-[2rem]">
        {servicePillars.map((pillar) => (
          <li key={pillar.slug} id={pillar.slug} className="scroll-mt-[5rem]">
            <h2 className="text-[1.25rem] font-normal">{pillar.name}</h2>
            <ul className="mt-[0.75rem] list-disc pl-[1.25rem]">
              {pillar.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </InnerPage>
  );
}
