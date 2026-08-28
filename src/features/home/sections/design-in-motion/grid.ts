import {
  BufferAttribute,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  type Texture,
} from "three";

import { PLANE_ASPECT, grid } from "./design-in-motion.config";
import { GRID_FRAG, PLANE_VERT } from "./shaders";

/**
 * The grid — six planes that fly in from off-screen and settle into rows, rippling as they travel
 * and going still as they land.
 *
 * **Each plane enters from the edge it is nearest.** Top-row planes drop in from above, bottom-row
 * planes rise from below, and the outer columns come in sideways. The alternative — everything
 * arriving from one direction — reads as a list being pushed on screen; entering from the nearest
 * edge reads as six things converging, which is the point of the shot.
 *
 * **The ripple is what makes them objects rather than images.** A plane carries a travelling sine
 * wave whose amplitude climbs while it is moving and decays once it has parked, so it arrives
 * like something with mass settling rather than a picture snapping into position. The phase field
 * runs diagonally on the corner planes and vertically on the rest, so neighbours do not ripple in
 * lockstep.
 */

/** Standard cubic ease-out. */
const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);
const clamp01 = (value: number): number => (value < 0 ? 0 : value > 1 ? 1 : value);

interface GridPlane {
  mesh: Mesh;
  geometry: PlaneGeometry;
  material: ShaderMaterial;
  column: number;
  row: number;
  /** Where it comes from, in world units, relative to its resting place. */
  fromX: number;
  fromY: number;
  /** Order in the stagger. */
  index: number;
  /** Ripple amplitude, integrated frame to frame. */
  wave: number;
  /** True once the phase field should run corner-to-corner rather than top-to-bottom. */
  diagonal: boolean;
  restX: number;
  restY: number;
}

export interface GridScene {
  group: Group;
  /** Re-lay the grid for a frame of `width` x `height` world units. */
  layout: (width: number, height: number, mobile: boolean, pixelsPerUnit: number) => void;
  /** `progress` 0..1 across the grid's own phase; `dt` in seconds. */
  update: (progress: number, dt: number) => void;
  dispose: () => void;
}

const RIPPLE_SEGMENTS = 24;

export const createGrid = (textures: Texture[]): GridScene => {
  const group = new Group();
  const planes: GridPlane[] = [];

  textures.slice(0, grid.count).forEach((map, index) => {
    const geometry = new PlaneGeometry(1, 1, RIPPLE_SEGMENTS, RIPPLE_SEGMENTS);
    const material = new ShaderMaterial({
      uniforms: {
        uMap: { value: map },
        uSize: { value: new Vector2(1, 1) },
        uRadius: { value: grid.cornerRadiusPx },
      },
      vertexShader: PLANE_VERT,
      fragmentShader: GRID_FRAG,
      transparent: true,
    });

    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    group.add(mesh);

    planes.push({
      mesh,
      geometry,
      material,
      column: 0,
      row: 0,
      fromX: 0,
      fromY: 0,
      index,
      wave: 0,
      diagonal: false,
      restX: 0,
      restY: 0,
    });
  });

  /** Flat copy of each plane's undisplaced vertex positions, so the ripple is never cumulative. */
  const rest = planes.map((plane) => {
    const attr = plane.geometry.getAttribute("position") as BufferAttribute;
    return Float32Array.from(attr.array as Float32Array);
  });

  const layout = (
    width: number,
    height: number,
    mobile: boolean,
    pixelsPerUnit: number,
  ): void => {
    const columns = mobile ? grid.columns.mobile : grid.columns.desktop;
    const rows = mobile ? grid.rows.mobile : grid.rows.desktop;
    const gapX = (mobile ? grid.gap.x.mobile : grid.gap.x.desktop);
    const gapY = (mobile ? grid.gap.y.mobile : grid.gap.y.desktop);

    /* Cells divide the frame; the plane then fits inside its cell at the imagery's own aspect,
       so a wide still is never stretched to fill a squarer cell. */
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    const planeWidth = cellWidth * (1 - gapX);
    const planeHeight = Math.min(cellHeight * (1 - gapY), planeWidth * PLANE_ASPECT);

    planes.forEach((plane, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      plane.column = column;
      plane.row = row;

      plane.restX = (column - (columns - 1) / 2) * cellWidth;
      plane.restY = ((rows - 1) / 2 - row) * cellHeight;

      const outerColumn = column === 0 || column === columns - 1;
      const topRow = row === 0;
      plane.diagonal = outerColumn && (topRow || row === rows - 1);

      /* Off-screen start, one full frame away on the axis it enters along. */
      plane.fromX = outerColumn ? (column === 0 ? -width : width) : 0;
      plane.fromY = outerColumn ? 0 : topRow ? height : -height;

      plane.mesh.scale.set(planeWidth, planeHeight, 1);
      (plane.material.uniforms.uSize.value as Vector2).set(
        planeWidth * pixelsPerUnit,
        planeHeight * pixelsPerUnit,
      );
    });
  };

  const update = (progress: number, dt: number): void => {
    planes.forEach((plane, index) => {
      /* Each plane runs the same arrival, offset in the stagger. The tail plane still finishes by
         progress 1, so the divisor shortens every plane's window rather than overrunning. */
      const span = Math.max(1e-3, 1 - grid.stagger * (planes.length - 1));
      const local = clamp01((progress - grid.stagger * plane.index) / span);
      const eased = easeOut(local);

      plane.mesh.position.x = plane.restX + plane.fromX * (1 - eased);
      plane.mesh.position.y = plane.restY + plane.fromY * (1 - eased);
      plane.mesh.visible = local > 0;

      /* Amplitude climbs while it is travelling and decays once parked — the plane is agitated by
         its own arrival and settles out of it. */
      const arriving = local > 0 && local < 1;
      plane.wave = Math.max(
        0,
        plane.wave + (arriving ? grid.rippleRise : -grid.rippleFall) * dt,
      );
      const amplitude = Math.min(plane.wave, 1) * 0.12 * (1 - eased);

      const attr = plane.geometry.getAttribute("position") as BufferAttribute;
      const base = rest[index];
      if (amplitude <= 1e-4) {
        /* Nothing to displace — restore once and skip the loop entirely while it is at rest. */
        if (attr.needsUpdate || plane.wave > 0) {
          (attr.array as Float32Array).set(base);
          attr.needsUpdate = true;
        }
        return;
      }

      for (let v = 0; v < attr.count; v += 1) {
        const x = base[v * 3];
        const y = base[v * 3 + 1];
        const field = plane.diagonal ? x + y : y;
        attr.setZ(v, Math.sin(field * 12 + plane.wave * 6) * amplitude);
      }
      attr.needsUpdate = true;
    });
  };

  const dispose = (): void => {
    for (const plane of planes) {
      plane.geometry.dispose();
      plane.material.dispose();
    }
  };

  return { group, layout, update, dispose };
};
