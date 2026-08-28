import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  type Texture,
} from "three";

import { HELIX_LENGTH, HELIX_SLOPE, PLANE_ASPECT, RISE_PER_RADIAN, helix } from "./design-in-motion.config";
import { PLANE_VERT, RIBBON_FRAG } from "./shaders";

/**
 * The helix train — a row of cards bent around a two-turn spiral that climbs through the camera.
 *
 * **The cards are bent, not tilted.** Each is a `PlaneGeometry` subdivided along its length whose
 * vertices are rewritten every frame from samples along the path, so a card follows the curve
 * instead of being a flat quad rotated to approximate it. That is the whole effect: at the
 * crossing you are looking at a curved surface, and a flat one reads as cardboard.
 *
 * **The frame is built from the path, not from a tuned constant.** At each sample the outward
 * radial gives the card its facing and `cross(tangent, radial)` gives it its up — which comes out
 * near-vertical, tilted by exactly the helix's own pitch, and needs no correction factor. A card
 * therefore faces the camera on the near side of every turn and stays upright the whole way round
 * by construction rather than by adjustment.
 */

/** Arc length of the whole train, nose to tail. */
export const trainSpan = (count: number): number => (count - 1) * helix.cardGap + helix.cardArc;

/** A point on the path at arc length `s`, with the climb centred on the origin. */
const pathPoint = (s: number, out: Vector3): Vector3 => {
  const theta = s / HELIX_SLOPE;
  return out.set(
    helix.radius * Math.cos(theta),
    RISE_PER_RADIAN * theta - helix.rise / 2,
    helix.radius * Math.sin(theta),
  );
};

/** The card's up vector at arc length `s` — perpendicular to both the path and the outward radial. */
const pathUp = (s: number, out: Vector3): Vector3 => {
  const theta = s / HELIX_SLOPE;
  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  /* tangent x radial, expanded. Already unit length once divided by the slope. */
  return out
    .set(RISE_PER_RADIAN * sin, helix.radius, -RISE_PER_RADIAN * cos)
    .divideScalar(HELIX_SLOPE);
};

export interface HelixCard {
  mesh: Mesh;
  geometry: BufferGeometry;
  /** Where this card's nose sits in the train, as an arc offset from the nose of the train. */
  offset: number;
  /** Eased toward `helix.hoverScale` while the pointer is on it. */
  scale: number;
}

export interface HelixTrain {
  group: Group;
  cards: HelixCard[];
  /** Rewrite every card's vertices for a train nose sitting at arc length `nose`. */
  update: (nose: number) => void;
  dispose: () => void;
}

const HALF_WIDTH = (helix.cardArc * PLANE_ASPECT) / 2;

export const createHelixTrain = (textures: Texture[]): HelixTrain => {
  const group = new Group();
  const cards: HelixCard[] = [];

  const point = new Vector3();
  const up = new Vector3();

  textures.forEach((map, index) => {
    /* One segment across, many along — the bend is entirely along the path, so subdividing the
       short axis would multiply the vertex count for nothing. */
    const geometry = new PlaneGeometry(1, 1, helix.cardSegments, 1);
    const material = new ShaderMaterial({
      uniforms: { uMap: { value: map } },
      vertexShader: PLANE_VERT,
      fragmentShader: RIBBON_FRAG,
      side: DoubleSide,
      transparent: false,
    });

    const mesh = new Mesh(geometry, material);
    /* Bounds are meaningless once the CPU rewrites positions each frame, and a stale bounding
       sphere makes the frustum cull cards that are plainly on screen. */
    mesh.frustumCulled = false;
    group.add(mesh);

    cards.push({ mesh, geometry, offset: index * helix.cardGap, scale: 1 });
  });

  const update = (nose: number): void => {
    for (const card of cards) {
      const start = nose + card.offset;
      const positions = card.geometry.getAttribute("position") as BufferAttribute;
      const columns = helix.cardSegments + 1;

      /* A card outside the path's arc range has nothing to sit on. Hiding it is cheaper than
         clamping it, and clamping would pile every off-path card onto the two end points. */
      const visible = start + helix.cardArc > 0 && start < HELIX_LENGTH;
      card.mesh.visible = visible;
      if (!visible) continue;

      const width = HALF_WIDTH * card.scale;

      for (let i = 0; i < columns; i += 1) {
        const s = start + (i / helix.cardSegments) * helix.cardArc;
        const clamped = Math.min(Math.max(s, 0), HELIX_LENGTH);
        pathPoint(clamped, point);
        pathUp(clamped, up);

        /* PlaneGeometry lays out its rows top-first, so row 0 is the card's upper edge and row 1
           its lower one — hence the single `columns` stride between the two writes. */
        positions.setXYZ(
          i,
          point.x + up.x * width,
          point.y + up.y * width,
          point.z + up.z * width,
        );
        positions.setXYZ(
          columns + i,
          point.x - up.x * width,
          point.y - up.y * width,
          point.z - up.z * width,
        );
      }

      positions.needsUpdate = true;
    }
  };

  const dispose = (): void => {
    for (const card of cards) {
      card.geometry.dispose();
      (card.mesh.material as ShaderMaterial).dispose();
    }
  };

  return { group, cards, update, dispose };
};

/* ── Guide lines ───────────────────────────────────────────────────────────
   Two hairlines tracing the edges the cards sweep, drawn as a moving window rather than the whole
   path — a fully drawn spiral tells the reader where the train is going and removes the reason to
   keep watching. The lower line is extended past the start so it enters from off-screen. */

export interface HelixGuides {
  group: Group;
  update: (nose: number) => void;
  dispose: () => void;
}

export const createHelixGuides = (color: string): HelixGuides => {
  const group = new Group();
  const point = new Vector3();
  const up = new Vector3();

  const lines = [1, -1].map((side) => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(helix.guideTrail * 3), 3),
    );
    const material = new LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
    const line = new Line(geometry, material);
    line.frustumCulled = false;
    group.add(line);
    return { geometry, material, side };
  });

  const update = (nose: number): void => {
    for (const line of lines) {
      const positions = line.geometry.getAttribute("position") as BufferAttribute;
      /* The lower edge leads by a fraction of the trail so the two do not arrive together. */
      const head = nose + (line.side < 0 ? helix.cardArc : 0);

      for (let i = 0; i < helix.guideTrail; i += 1) {
        const s = head - (i / helix.guideTrail) * (HELIX_LENGTH / helix.turns / 2);
        const clamped = Math.min(Math.max(s, 0), HELIX_LENGTH);
        pathPoint(clamped, point);
        pathUp(clamped, up);
        positions.setXYZ(
          i,
          point.x + up.x * HALF_WIDTH * line.side,
          point.y + up.y * HALF_WIDTH * line.side,
          point.z + up.z * HALF_WIDTH * line.side,
        );
      }

      positions.needsUpdate = true;
    }
  };

  const dispose = (): void => {
    for (const line of lines) {
      line.geometry.dispose();
      line.material.dispose();
    }
  };

  return { group, update, dispose };
};
