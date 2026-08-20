import { positioning, site } from '@/content/site';
import { InnerPage } from '@/views/inner';

export default function AboutPage() {
  return (
    <InnerPage title="About">
      <p>{site.tagline}</p>
      <p className="mt-[1rem]">{positioning}</p>
    </InnerPage>
  );
}
