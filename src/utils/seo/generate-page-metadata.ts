/**
 * @fileoverview Standardised metadata + viewport generators for pages.
 *
 * `generateMetadata` builds a Next.js `Metadata` object — basic meta tags,
 * OpenGraph, Twitter cards, canonical URL, icons, robots. `metadataBase` is
 * always set (from `siteConfig`) so relative URLs (OG image, canonical)
 * resolve to absolute — required by social scrapers.
 *
 * `generateViewport` builds the `Viewport` export. `themeColor` lives here, not
 * in `Metadata` — Next deprecated it on the metadata object.
 */

import { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/seo";

interface MetadataProps {
  title?: string;
  description?: string;
  /** Canonical path (e.g. `/about`) or absolute URL for this page. */
  url?: string;
  /**
   * Override the share image with a path under `public/` or an absolute URL. Omit it — the default
   * is the **generated** card at `/opengraph-image`, which file-based metadata wires up itself.
   */
  ogImage?: string;
  twitterHandle?: string | undefined;
  author?: string;
  siteName?: string;
}

export function generateMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  url = "/",
  ogImage,
  twitterHandle,
  author = siteConfig.author,
  siteName = siteConfig.name,
}: MetadataProps = {}): Metadata {
  return {
    // Resolves every relative URL below to an absolute one.
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      // Omitted by default so the **generated** card (`app/opengraph-image.tsx`, 1200×630) wins —
      // file-based metadata sets the tag, its dimensions and its `alt` itself. Only an explicit
      // override lands here, and then it must carry its own real dimensions.
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(twitterHandle ? { site: twitterHandle, creator: twitterHandle } : {}),
      // Same: with no `twitter-image.tsx`, Next points the Twitter card at the OG route.
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    // No `icons` block: `app/icon.tsx` and `app/apple-icon.tsx` are generated from the brand mark and
    // discovered automatically. Declaring paths here would override them with stale files.
    manifest: "/manifest.json",
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateViewport(): Viewport {
  return {
    themeColor: siteConfig.themeColor,
    width: "device-width",
    initialScale: 1,
  };
}
