"use client";

import { useEffect } from "react";

import Link from "next/link";

import { useStaggeredMenu } from "./use-staggered-menu";

import type { MenuPosition, StaggeredMenuItem, StaggeredMenuSocial } from "./types";
import type { CSSProperties } from "react";

import "./staggered-menu.css";

type StaggeredMenuProps = {
  position?: MenuPosition;
  colors?: string[];
  items?: StaggeredMenuItem[];
  displayItemNumbering?: boolean;
  className?: string;
  logoLabel: string;
  logoHref?: string;
  logoSrc?: string;
  talkHref?: string;
  talkLabel?: string;
  socials?: StaggeredMenuSocial[];
  accentColor?: string;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
};

const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

export const StaggeredMenu = ({
  position = "right",
  colors = ["var(--peach)", "var(--cream)"],
  items = [],
  displayItemNumbering = true,
  className,
  logoLabel,
  logoHref = "/",
  logoSrc,
  talkHref,
  talkLabel = "let's talk",
  socials = [],
  accentColor = "var(--heat)",
  isFixed = false,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
}: StaggeredMenuProps) => {
  const { open, textLines, toggleMenu, closeMenu, refs } = useStaggeredMenu({
    position,
    onMenuOpen,
    onMenuClose,
  });

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = refs.panelRef.current;
      const toggle = refs.toggleBtnRef.current;
      if (!panel || !toggle) return;
      const focusable = [
        toggle,
        ...Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")),
      ];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu, refs.panelRef, refs.toggleBtnRef]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (refs.panelRef.current?.contains(target) || refs.toggleBtnRef.current?.contains(target)) {
        return;
      }
      closeMenu();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeOnClickAway, open, closeMenu, refs.panelRef, refs.toggleBtnRef]);

  const layers = (colors.length ? colors.slice(0, 4) : ["var(--peach)", "var(--cream)"]).filter(
    (_, i, arr) => arr.length < 3 || i !== Math.floor(arr.length / 2),
  );

  return (
    <div
      className={`${className ? `${className} ` : ""}staggered-menu-wrapper${isFixed ? " fixed-wrapper" : ""}`}
      style={{ "--sm-accent": accentColor } as CSSProperties}
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={refs.preLayersRef} className="sm-prelayers" aria-hidden="true">
        {layers.map((color, i) => (
          <div key={`${color}-${i}`} className="sm-prelayer" style={{ background: color }} />
        ))}
      </div>

      <header className="staggered-menu-header" aria-label="Main navigation header">
        <Link href={logoHref} className="sm-logo">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" className="sm-logo-mark" />
          ) : null}
          {logoLabel}
        </Link>
        <div className="sm-header-actions">
          {talkHref ? (
            isInternal(talkHref) ? (
              <Link href={talkHref} className="sm-talk">
                {talkLabel}
              </Link>
            ) : (
              <a href={talkHref} className="sm-talk">
                {talkLabel}
              </a>
            )
          ) : null}
          <button
            ref={refs.toggleBtnRef}
            className="sm-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span className="sm-toggle-textWrap" aria-hidden="true">
              <span ref={refs.textInnerRef} className="sm-toggle-textInner">
                {textLines.map((line, i) => (
                  <span className="sm-toggle-line" key={`${line}-${i}`}>
                    {line}
                  </span>
                ))}
              </span>
            </span>
            <span ref={refs.iconRef} className="sm-icon" aria-hidden="true">
              <span ref={refs.plusHRef} className="sm-icon-line" />
              <span ref={refs.plusVRef} className="sm-icon-line sm-icon-line-v" />
            </span>
          </button>
        </div>
      </header>

      <aside
        id="staggered-menu-panel"
        ref={refs.panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
        aria-modal={open}
        inert={!open}
      >
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items.map((item, idx) => (
              <li className="sm-panel-itemWrap" key={item.label}>
                <MenuItemLink item={item} index={idx} onNavigate={closeMenu} />
              </li>
            ))}
          </ul>
          {socials.length > 0 ? (
            <div className="sm-socials">
              {socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  className="sm-social"
                  aria-label={social.label}
                  onClick={closeMenu}
                >
                  <SocialGlyph icon={social.icon} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
};

const MenuItemLink = ({
  item,
  index,
  onNavigate,
}: {
  item: StaggeredMenuItem;
  index: number;
  onNavigate: () => void;
}) => {
  const className = "sm-panel-item";
  const label = <span className="sm-panel-itemLabel">{item.label}</span>;
  if (isInternal(item.link)) {
    return (
      <Link
        href={item.link}
        className={className}
        aria-label={item.ariaLabel}
        data-index={index + 1}
        onClick={onNavigate}
      >
        {label}
      </Link>
    );
  }
  return (
    <a href={item.link} className={className} aria-label={item.ariaLabel} data-index={index + 1} onClick={onNavigate}>
      {label}
    </a>
  );
};

const SocialGlyph = ({ icon }: { icon: StaggeredMenuSocial["icon"] }) => {
  if (icon === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75Zm1.8.75 6.55 4.36a1 1 0 0 0 1.1 0L19.2 7.5H4.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3.25A8.75 8.75 0 1 0 20.75 12 8.76 8.76 0 0 0 12 3.25Zm0 1.5a7.23 7.23 0 0 1 4.55 1.6c-.7.56-1.66 1.05-2.8 1.4A14.4 14.4 0 0 0 12 4.75Zm-1.5 0c-.4 1.05-.7 2.22-.88 3.5H5.7A7.26 7.26 0 0 1 10.5 4.75ZM5.32 9.75h4.12c-.08.8-.12 1.63-.12 2.25s.04 1.45.12 2.25H5.32A7.2 7.2 0 0 1 5 12a7.2 7.2 0 0 1 .32-2.25Zm.38 6h4.3c.18 1.28.48 2.45.88 3.5A7.26 7.26 0 0 1 5.7 15.75Zm6.3 3.5c.4-1.05.7-2.22.88-3.5h3.92A7.26 7.26 0 0 1 12 19.25Zm1.5-5c.08-.8.12-1.63.12-2.25s-.04-1.45-.12-2.25h4.12A7.2 7.2 0 0 1 19 12a7.2 7.2 0 0 1-.32 2.25H13.5Zm2.75-6.5c-1.14-.35-2.1-.84-2.8-1.4A7.23 7.23 0 0 1 18 6.35c-.7.56-1.5.95-2.75 1.4Z" />
    </svg>
  );
};
