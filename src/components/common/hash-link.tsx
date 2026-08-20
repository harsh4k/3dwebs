"use client";

import type { ReactNode } from "react";

import { scrollTo } from "@/utils/scroll-to";

export const HashLink = ({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) => {
  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        const next = `${window.location.pathname}${window.location.search}#${id}`;
        window.history.pushState(null, "", next);
        scrollTo(id, false);
      }}
    >
      {children}
    </a>
  );
};
