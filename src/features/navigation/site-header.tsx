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
      /* 72px WebP, not the 1254x1254 `logo.jpeg` source: the header slot is 36px, so the
         full-size file was ~34x more pixels than it can show. Same crop, so the mark is
         unchanged on screen. `logo.jpeg` stays on disk — `icon.tsx` and `apple-icon.tsx`
         still generate the favicons from it at build time and want the resolution. */
      logoSrc="/assets/hand/logo-72.webp"
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
