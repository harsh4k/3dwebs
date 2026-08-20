import { featuredProjects, TOTAL_PROJECTS } from '@/content/projects';
import { InnerPage } from '@/views/inner';

export default function WorkPage() {
  return (
    <InnerPage title="Work">
      <p>{TOTAL_PROJECTS} projects in the record. Featured:</p>
      <ul className="mt-[1.5rem] flex flex-col gap-[1.25rem]">
        {featuredProjects.map((project) => (
          <li key={project.slug}>
            <p className="uppercase">
              {project.client} — {project.title}
            </p>
            <p>{project.deliverables.join(' · ')}</p>
            {project.liveUrl ? (
              <a className="underline decoration-from-font underline-offset-4" href={project.liveUrl}>
                {project.liveUrl.replace(/^https?:\/\//, '')}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </InnerPage>
  );
}
