import { positioning, site } from '@/content/site';
import { InnerPage } from '@/features/page-shell/inner';

export default function AboutPage() {
  return (
    <InnerPage title="About">
      <p>{site.tagline}</p>
      <p className="mt-[1rem]">{positioning}</p>
    </InnerPage>
  );
}
