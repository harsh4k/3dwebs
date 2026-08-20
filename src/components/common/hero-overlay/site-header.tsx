import { StaggeredMenu } from "@/components/common/staggered-menu";
import { site } from "@/content/site";

const MENU_ITEMS = [
  { label: "Work", ariaLabel: "See the work", link: "/work" },
  { label: "Services", ariaLabel: "View our services", link: "/services" },
  { label: "About", ariaLabel: "Learn about us", link: "/about" },
  { label: "Contact", ariaLabel: "Get in touch", link: "/contact" },
  { label: "Start a project", ariaLabel: "Start a project", link: `mailto:${site.email}` },
] as const;

export const SiteHeader = () => {
  return (
    <StaggeredMenu
      isFixed
      position="right"
      logoLabel={site.name}
      items={[...MENU_ITEMS]}
      displaySocials={false}
      displayItemNumbering
      colors={["var(--foam)", "var(--cream)"]}
      accentColor="var(--heat)"
    />
  );
};
