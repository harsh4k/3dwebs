import { featuredProjects, TOTAL_PROJECTS } from '@/content/projects';
import { WorkView } from '@/features/work/work-view';

export default function WorkPage() {
  return <WorkView projects={featuredProjects} total={TOTAL_PROJECTS} />;
}
