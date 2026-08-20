"use client";

import { useEffect } from "react";

import Link from "next/link";

import { useStaggeredMenu } from "./use-staggered-menu";

import type { MenuPosition, StaggeredMenuItem, StaggeredMenuSocialItem } from "./types";
import type { CSSProperties } from "react";

import "./staggered-menu.css";

type StaggeredMenuProps = {
  position?: MenuPosition;
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoLabel: string;
  logoHref?: string;
  accentColor?: string;
  isFixed?: boolean;
  closeOnClickAway?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
};

const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

export const StaggeredMenu = ({
  position = "right",
  colors = ["var(--foam)", "var(--cream)"],
  items = [],
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = true,
  className,
  logoLabel,
  logoHref = "/",
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

  const layers = (colors.length ? colors.slice(0, 4) : ["var(--foam)", "var(--cream)"]).filter(
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
          {logoLabel}
        </Link>
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
          {displaySocials && socialItems.length > 0 ? (
            <div className="sm-socials" aria-label="Social links">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((social) => (
                  <li key={social.label} className="sm-socials-item">
                    <a
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
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
