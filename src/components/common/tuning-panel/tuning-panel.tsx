// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { useEffect, useState } from "react";

import { tuning } from "@/components/common/scene";

/**
 * **Dev tuning panel** — live sliders for the pink bloom particles (colour + glow) and the bloom pass
 * (threshold / strength / radius). It writes straight into the shared `tuning` store, which the scene
 * reads **every frame**, so edits are instant (runtime-only, not persisted). **Only mounts when the
 * URL has `?tune`** — it's a dev tool, not product UI, hence the plain inline styling. Open
 * `…/?tune` to reveal it.
 */

interface Row {
  label: string;
  min: number;
  max: number;
  step: number;
  get: () => number;
  set: (v: number) => void;
}

const ROWS: Row[] = [
  { label: "Pink glow", min: 0, max: 12, step: 0.1, get: () => tuning.pink.glow, set: (v) => { tuning.pink.glow = v; } },
  { label: "Bloom threshold", min: 0, max: 8, step: 0.05, get: () => tuning.bloom.threshold, set: (v) => { tuning.bloom.threshold = v; } },
  { label: "Bloom strength", min: 0, max: 4, step: 0.05, get: () => tuning.bloom.strength, set: (v) => { tuning.bloom.strength = v; } },
  { label: "Bloom radius", min: 0, max: 6, step: 0.1, get: () => tuning.bloom.radius, set: (v) => { tuning.bloom.radius = v; } },
];

export const TuningPanel = () => {
  const [mounted, setMounted] = useState(false);
  const [, force] = useState(0);
  useEffect(() => {
    setMounted(new URLSearchParams(window.location.search).has("tune"));
  }, []);
  if (!mounted) return null;
  const rerender = () => force((n) => n + 1);

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 30,
        width: 244,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 14,
        borderRadius: 10,
        background: "rgba(12,14,18,0.82)",
        color: "#e8eaed",
        font: "12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <strong style={{ fontSize: 11, letterSpacing: 0.6, opacity: 0.65 }}>PINK PARTICLES · BLOOM</strong>

      <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>Pink colour</span>
        <input
          type="color"
          value={tuning.pink.color}
          onChange={(e) => {
            tuning.pink.color = e.target.value;
            rerender();
          }}
          style={{ width: 40, height: 22, border: "none", background: "none", padding: 0 }}
        />
      </label>

      {ROWS.map((row) => (
        <label key={row.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{row.label}</span>
            <span style={{ opacity: 0.65 }}>{row.get().toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={row.min}
            max={row.max}
            step={row.step}
            value={row.get()}
            onChange={(e) => {
              row.set(parseFloat(e.target.value));
              rerender();
            }}
            style={{ width: "100%" }}
          />
        </label>
      ))}
    </div>
  );
};
