import type { Project } from "@/content/schema";

export const WorkCarouselFallback = ({ projects }: { projects: readonly Project[] }) => {
  return (
    <ul className="grid grid-cols-1 gap-[1.25rem] px-[1.25rem] py-[2rem] md:grid-cols-2 md:gap-[1.5rem] md:px-[1.875rem]">
      {projects.map((project) => {
        const image = project.images[0];
        return (
          <li key={project.slug}>
            <a
              href={`/work?case=${project.slug}`}
              className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="aspect-[4/3] w-full object-cover object-top bg-cream"
                />
              ) : null}
              <p className="mt-[0.75rem] text-[0.75rem] uppercase tracking-[0.08em] text-ink">
                {project.client}
              </p>
              <p className="mt-[0.25rem] font-display text-[1.25rem] font-extralight leading-[1.15] text-ink">
                {project.title}
              </p>
              <p className="mt-[0.35rem] text-[0.8125rem] text-ink-muted">
                {project.deliverables.join(" · ")}
              </p>
            </a>
          </li>
        );
      })}
    </ul>
  );
};
