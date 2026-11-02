import * as THREE from "three";
import type { Colorway } from "@/lib/commerce/types";

export const palettes: Record<Colorway, { base: string; ink: string; accent: string }> = {
  orange: { base: "#ff4d00", ink: "#fff1c9", accent: "#c6f432" },
  lime: { base: "#c6f432", ink: "#2a0a3a", accent: "#ff4d00" },
  coral: { base: "#ff6b6b", ink: "#2a0a3a", accent: "#fff1c9" },
  plum: { base: "#3a0f50", ink: "#fff1c9", accent: "#ff6b6b" },
};

const FONT = '"Bricolage Grotesque Variable", system-ui, sans-serif';

export function labelTexture(c: Colorway, anisotropy = 8) {
  const p = palettes[c];
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const g = canvas.getContext("2d")!;
  g.fillStyle = p.base;
  g.fillRect(0, 0, 2048, 1024);

  // Fizz rising from a wave along the bottom of the label.
  g.fillStyle = p.accent;
  g.beginPath();
  g.moveTo(0, 1024);
  for (let x = 0; x <= 2048; x += 8) g.lineTo(x, 815 + Math.sin((x / 2048) * Math.PI * 6) * 42);
  g.lineTo(2048, 1024);
  g.fill();
  [[160,700,38],[300,610,20],[700,740,28],[900,650,14],[1180,720,34],[1330,600,18],[1760,710,30],[1900,620,16]].forEach(([x, y, r]) => {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  });

  // The wordmark appears twice so it is always readable as the can turns.
  [512, 1536].forEach((cx) => {
    g.save();
    g.translate(cx, 400);
    g.fillStyle = p.ink;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `800 215px ${FONT}`;
    const letters = "KWIRKY".split("");
    const tilt = [-0.07, 0.05, -0.04, 0.08, -0.05, 0.07];
    const widths = letters.map((l) => g.measureText(l).width * 0.93);
    let x = -widths.reduce((a, b) => a + b, 0) / 2;
    letters.forEach((l, i) => {
      g.save();
      g.translate(x + widths[i] / 2, i % 2 ? -8 : 8);
      g.rotate(tilt[i]);
      g.fillText(l, 0, 0);
      g.restore();
      x += widths[i];
    });
    g.font = `600 44px ${FONT}`;
    g.fillText("Probiotic soda", 0, 170);
    g.restore();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.offset.x = 0.25; // centres a wordmark on the front of the can
  tex.anisotropy = anisotropy;
  return tex;
}

const lathe = (pts: number[][]) =>
  new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 72);

export interface CanObject {
  group: THREE.Group;
  setColorway: (c: Colorway) => void;
  dispose: () => void;
}

export function createCan(colorway: Colorway, opts: { droplets?: number; anisotropy?: number } = {}): CanObject {
  const group = new THREE.Group();
  const cache = new Map<Colorway, THREE.Texture>();
  const tex = (c: Colorway) => {
    if (!cache.has(c)) cache.set(c, labelTexture(c, opts.anisotropy));
    return cache.get(c)!;
  };

  const skin = new THREE.MeshPhysicalMaterial({
    map: tex(colorway),
    metalness: 0.12,
    roughness: 0.34,
    clearcoat: 0.7,
    clearcoatRoughness: 0.16,
    envMapIntensity: 0.42,
  });
  const wallGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.3, 96, 1, true);
  const wall = new THREE.Mesh(wallGeo, skin);
  wall.position.y = -0.03;
  group.add(wall);

  const alu = new THREE.MeshStandardMaterial({ color: "#dfe1e4", metalness: 1, roughness: 0.26 });
  const top = new THREE.Mesh(
    lathe([[0.7,1.12],[0.695,1.17],[0.57,1.42],[0.57,1.46],[0.595,1.49],[0.58,1.52],[0.54,1.5],[0.525,1.42],[0,1.41]]),
    alu,
  );
  const bottom = new THREE.Mesh(
    lathe([[0,-1.3],[0.38,-1.36],[0.52,-1.46],[0.6,-1.45],[0.7,-1.24],[0.7,-1.18]]),
    alu,
  );
  [top, bottom].forEach((m) => {
    (m.material as THREE.Material).side = THREE.DoubleSide;
    group.add(m);
  });

  // Ring-pull: tab with a finger hole, plus the rivet.
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 0.17, 0.26, 0, Math.PI * 2);
  const hole = new THREE.Path();
  hole.absellipse(0, -0.09, 0.09, 0.1, 0, Math.PI * 2);
  shape.holes.push(hole);
  const tab = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2 }),
    alu,
  );
  tab.rotation.x = -Math.PI / 2;
  tab.position.set(0, 1.44, 0.04);
  group.add(tab);
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.03, 16), alu);
  rivet.position.set(0, 1.455, -0.06);
  group.add(rivet);

  // Condensation: flattened glassy beads resting on the can wall.
  const count = opts.droplets ?? 420;
  let droplets: THREE.InstancedMesh | null = null;
  if (count > 0) {
    droplets = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 10, 8),
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.2,
        roughness: 0.03,
        metalness: 0,
        clearcoat: 1,
        envMapIntensity: 1.8,
      }),
      count,
    );
    const m = new THREE.Object3D();
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const y = -1.15 + rnd() * 2.25;
      const big = rnd() > 0.96;
      const r = big ? 0.018 + rnd() * 0.012 : 0.005 + rnd() * 0.008;
      m.position.set(Math.sin(a) * 0.703, y, Math.cos(a) * 0.703);
      m.rotation.set(0, a, 0);
      m.scale.set(r, big ? r * 1.35 : r, r * 0.42);
      m.updateMatrix();
      droplets.setMatrixAt(i, m.matrix);
    }
    group.add(droplets);
  }

  return {
    group,
    setColorway(c) {
      skin.map = tex(c);
      skin.needsUpdate = true;
    },
    dispose() {
      cache.forEach((t) => t.dispose());
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.Material | undefined;
        mat?.dispose?.();
      });
    },
  };
}

export function citrusTexture(flesh = "#ff8a1f", rind = "#ff4d00") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const g = canvas.getContext("2d")!;
  g.fillStyle = rind;
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#fff1c9";
  g.beginPath();
  g.arc(256, 256, 232, 0, Math.PI * 2);
  g.fill();
  const seg = 9;
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2 + 0.05;
    const a1 = ((i + 1) / seg) * Math.PI * 2 - 0.05;
    g.fillStyle = flesh;
    g.beginPath();
    g.moveTo(256 + Math.cos((a0 + a1) / 2) * 20, 256 + Math.sin((a0 + a1) / 2) * 20);
    g.arc(256, 256, 210, a0, a1);
    g.closePath();
    g.fill();
  }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export async function fontsReady() {
  try {
    await document.fonts.load(`800 200px "Bricolage Grotesque Variable"`);
  } catch {}
}
