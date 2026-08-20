import { closingCopy, site } from '@/content/site';
import { InnerPage } from '@/views/inner';

export default function ContactPage() {
  return (
    <InnerPage title="Contact">
      {closingCopy.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="mt-[1.5rem]">
        <a className="underline decoration-from-font underline-offset-4" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </p>
      <p>
        <a className="underline decoration-from-font underline-offset-4" href={`mailto:${site.careersEmail}`}>
          {site.careersEmail}
        </a>
      </p>
    </InnerPage>
  );
}
