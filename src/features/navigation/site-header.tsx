import { StaggeredMenu } from "@/components/common/staggered-menu";
import { site } from "@/content/site";

const MENU_ITEMS = [
  { label: "Work", ariaLabel: "See the work", link: "/work" },
  { label: "Services", ariaLabel: "View our services", link: "/services" },
  { label: "About", ariaLabel: "Learn about us", link: "/about" },
  { label: "Contact", ariaLabel: "Get in touch", link: "/contact" },
] as const;

export const SiteHeader = () => {
  return (
    <StaggeredMenu
      isFixed
      position="right"
      logoLabel={site.name}
      logoSrc="/assets/hand/logo.jpeg"
      talkHref="/contact"
      talkLabel="let's talk"
      items={[...MENU_ITEMS]}
      socials={[
        { label: `Email ${site.email}`, href: `mailto:${site.email}`, icon: "mail" },
        { label: site.domain, href: `https://${site.domain}`, icon: "web" },
      ]}
      displayItemNumbering={false}
      colors={["var(--peach)", "var(--cream)"]}
      accentColor="var(--heat)"
    />
  );
};
