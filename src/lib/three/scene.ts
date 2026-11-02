import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { Colorway } from "@/lib/commerce/types";
import { citrusTexture, createCan, palettes, type CanObject } from "./can";

export interface CanState {
  /** x, y are fractions of the half-viewport; s is relative can size. */
  x: number;
  y: number;
  s: number;
  rx: number;
  rz: number;
  /** 0 to 1 amount of bubbles, citrus and liquid. */
  fx: number;
  liquid: number;
}

export function makeRenderer(canvas: HTMLCanvasElement, maxDpr: number, antialias = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1;
  return renderer;
}

export function studio(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;
  pmrem.dispose();
  const key = new THREE.DirectionalLight("#fff4df", 0.9);
  key.position.set(3, 4, 6);
  const rim = new THREE.DirectionalLight("#ffe4cc", 1.1);
  rim.position.set(-5, 2, -3);
  scene.add(key, rim);
  return env;
}

/** The fixed, scroll-driven homepage scene. */
export class KwirkyScene {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  can: CanObject;
  rig = new THREE.Group();
  fxRoot = new THREE.Group();
  target: CanState;
  now: CanState;
  spin = 0;
  mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  private bubbles: THREE.InstancedMesh;
  private bubbleData: { x: number; y: number; z: number; r: number; v: number; p: number }[] = [];
  private citrus: { mesh: THREE.Mesh; home: THREE.Vector3; sx: number; sy: number }[] = [];
  private crown: THREE.Mesh;
  private crownMat: THREE.MeshPhysicalMaterial;
  private crownSegs: { u: number; v: number };
  private spray: THREE.InstancedMesh;
  private last = 0;
  private elapsed = 0;
  private raf = 0;
  private running = false;
  private colorway: Colorway = "orange";
  private swap = 0;
  private pending: Colorway | null = null;
  private dummy = new THREE.Object3D();
  private frames = 0;
  private slowFrames = 0;
  private liquidTick = 0;
  width = 1;
  height = 1;
  scrollSpin = 0;

  constructor(canvas: HTMLCanvasElement, initial: CanState, private mobile: boolean) {
    this.target = { ...initial };
    this.now = { ...initial };
    this.renderer = makeRenderer(canvas, mobile ? 1.5 : 2, !mobile);
    studio(this.scene, this.renderer);
    this.camera.position.z = 9;

    this.can = createCan("orange", { droplets: mobile ? 170 : 460, anisotropy: mobile ? 4 : 8 });
    this.rig.add(this.can.group);
    this.scene.add(this.rig, this.fxRoot);

    const count = mobile ? 26 : 80;
    this.bubbles = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, mobile ? 10 : 18, mobile ? 8 : 14),
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.34,
        roughness: 0.04,
        clearcoat: 1,
        envMapIntensity: 2.2,
      }),
      count,
    );
    this.bubbles.frustumCulled = false;
    for (let i = 0; i < count; i++) {
      this.bubbleData.push({
        x: (Math.random() - 0.5) * 7,
        y: (Math.random() - 0.5) * 6,
        z: -1.5 + Math.random() * 3,
        r: 0.025 + Math.pow(Math.random(), 2.4) * 0.17,
        v: 0.14 + Math.random() * 0.34,
        p: Math.random() * 6.28,
      });
    }
    this.fxRoot.add(this.bubbles);

    const citrusTex = citrusTexture();
    const side = new THREE.MeshStandardMaterial({ color: "#ff5a12", roughness: 0.45 });
    const face = new THREE.MeshPhysicalMaterial({ map: citrusTex, roughness: 0.28, clearcoat: 0.8 });
    const homes = mobile
      ? [[-1.3, 1.3, 0.4], [1.3, -1.1, 0.5]]
      : [[-2.3, 1.15, 0.2], [2.25, 1.35, -0.2], [-1.75, -1.3, 0.6], [2.5, -1.05, 0.3], [1.3, 2, -1]];
    homes.forEach(([x, y, z], i) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.07, 40), [side, face, face]);
      this.citrus.push({
        mesh,
        home: new THREE.Vector3(x, y, z),
        sx: 0.3 + i * 0.07,
        sy: 0.22 + i * 0.05,
      });
      this.fxRoot.add(mesh);
    });

    // Soda splash: a glossy crown of liquid around the base, with thrown droplets.
    this.crownSegs = mobile ? { u: 110, v: 14 } : { u: 160, v: 22 };
    this.crownMat = new THREE.MeshPhysicalMaterial({
      color: "#ff4d00",
      roughness: 0.16,
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
      envMapIntensity: 0.4,
      side: THREE.DoubleSide,
    });
    this.crown = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, this.crownSegs.u, this.crownSegs.v), this.crownMat);
    this.crown.frustumCulled = false;
    this.spray = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), this.crownMat, mobile ? 8 : 16);
    this.spray.frustumCulled = false;
    this.scene.add(this.crown, this.spray);
    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setColorway(c: Colorway) {
    if (c === this.colorway && !this.pending) return;
    this.pending = c;
  }

  get currentColorway() {
    return this.pending ?? this.colorway;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = () => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private frame() {
    const nowMs = performance.now();
    const dt = Math.min((nowMs - this.last) / 1000, 0.05);
    this.last = nowMs;
    this.elapsed += dt;
    const t = this.elapsed;

    // Automatic quality step-down for devices that struggle.
    if (this.frames++ > 30 && this.frames < 200) {
      if (dt > 0.034) this.slowFrames++;
      if (this.frames === 199 && this.slowFrames > 90) this.lowerQuality();
    }

    const k = 1 - Math.pow(0.0015, dt);
    (Object.keys(this.target) as (keyof CanState)[]).forEach((key) => {
      this.now[key] += (this.target[key] - this.now[key]) * k;
    });
    this.mouse.sx += (this.mouse.x - this.mouse.sx) * k * 0.6;
    this.mouse.sy += (this.mouse.y - this.mouse.sy) * k * 0.6;

    const halfH = Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    const halfW = halfH * this.camera.aspect;
    const fit = Math.min(1, this.camera.aspect / 0.62);
    const { x, y, s, rx, rz, fx, liquid } = this.now;

    this.spin += dt * 0.42;
    // A label change happens inside a quick extra spin, so it reads as a flip.
    if (this.pending) {
      this.swap += dt * 3.4;
      if (this.swap >= 0.5 && this.pending !== this.colorway) {
        this.colorway = this.pending;
        this.can.setColorway(this.colorway);
      }
      if (this.swap >= 1) {
        this.swap = 0;
        this.pending = null;
      }
    }
    const swapTurn = this.swap > 0 ? Math.sin(this.swap * Math.PI) * 1.4 : 0;

    this.rig.position.set(x * halfW + this.mouse.sx * 0.12, y * halfH + this.mouse.sy * 0.08 + Math.sin(t * 0.9) * 0.05, 0);
    this.rig.scale.setScalar(Math.max(0.0001, s * fit));
    this.rig.rotation.set(rx + this.mouse.sy * 0.08, this.spin + this.scrollSpin + swapTurn + this.mouse.sx * 0.25, rz);

    // Bubbles rise and wrap around the viewport.
    const size = fx;
    this.bubbleData.forEach((b, i) => {
      b.y += b.v * dt;
      if (b.y > 3.2) b.y = -3.2;
      this.dummy.position.set(b.x + Math.sin(t * 0.8 + b.p) * 0.1, b.y, b.z);
      this.dummy.scale.setScalar(Math.max(0.0001, b.r * size));
      this.dummy.updateMatrix();
      this.bubbles.setMatrixAt(i, this.dummy.matrix);
    });
    this.bubbles.instanceMatrix.needsUpdate = true;
    this.bubbles.visible = size > 0.01;
    this.fxRoot.position.x = this.mouse.sx * -0.1;
    this.fxRoot.position.y = this.mouse.sy * -0.06;

    this.citrus.forEach((c, i) => {
      const citrusSize = Math.max(0, (size - 0.5) * 2);
      c.mesh.visible = citrusSize > 0.02;
      c.mesh.scale.setScalar(Math.max(0.0001, citrusSize));
      const spread = 1.45 - citrusSize * 0.45;
      c.mesh.position.set(c.home.x * spread, c.home.y * spread + Math.sin(t * c.sy + i) * 0.1, c.home.z);
      c.mesh.rotation.set(1.2 + t * c.sx * 0.5, t * c.sy, 0.5 + i);
    });

    const wet = liquid > 0.02;
    this.crown.visible = wet;
    this.spray.visible = wet;
    if (wet) {
      const baseY = this.rig.position.y - 1.32 * this.rig.scale.y;
      if (this.liquidTick++ % (this.mobile ? 2 : 1) === 0) this.updateSplash(t, liquid, this.rig.position.x, baseY, this.rig.scale.x);
    }

    this.renderer.render(this.scene, this.camera);
  }

  /** Deforms a grid into a puddle that rises into a spiked liquid crown. */
  private updateSplash(t: number, amount: number, cx: number, cy: number, scale: number) {
    const pos = this.crown.geometry.attributes.position as THREE.BufferAttribute;
    const { u: nu, v: nv } = this.crownSegs;
    const peak = (a: number) =>
      0.3 + 0.36 * Math.pow(Math.abs(Math.sin(a * 3.5 + 0.4 + Math.sin(t * 0.35) * 0.5)), 2.4) * (0.72 + 0.28 * Math.sin(t * 1.4 + a * 5)) + 0.07 * Math.sin(a * 9 - t * 2.2);
    let i = 0;
    for (let iv = 0; iv <= nv; iv++) {
      const v = iv / nv;
      for (let iu = 0; iu <= nu; iu++) {
        const a = (iu / nu) * Math.PI * 2;
        const rise = Math.pow(Math.max(0, (v - 0.3) / 0.7), 1.7);
        const ripple = 0.028 * Math.sin(a * 6 + t * 1.8);
        const r = 0.55 + v * 0.5 + rise * 0.32 + ripple;
        pos.setXYZ(i++, Math.cos(a) * r * scale + cx, cy + rise * peak(a) * amount * scale * 1.05, Math.sin(a) * r * scale * 0.9);
      }
    }
    pos.needsUpdate = true;
    this.crown.geometry.computeVertexNormals();
    this.crown.geometry.computeBoundingSphere();

    const n = this.spray.count;
    for (let k = 0; k < n; k++) {
      const a = ((k + 0.5) / 7) * Math.PI * 2 - 0.35;
      const life = (t * 0.28 + k * 0.37) % 1;
      const r = (0.98 + life * 0.42 + (k % 3) * 0.05) * scale;
      const lift = Math.sin(life * Math.PI) * (0.95 + (k % 4) * 0.2) * scale;
      const size = (0.022 + (k % 4) * 0.012) * amount * scale * (1 - life * 0.3);
      this.dummy.position.set(Math.cos(a) * r + cx, cy + 0.25 * scale + lift, Math.sin(a) * r * 0.9);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.scale.set(size, size * 1.25, size);
      this.dummy.updateMatrix();
      this.spray.setMatrixAt(k, this.dummy.matrix);
    }
    this.spray.instanceMatrix.needsUpdate = true;
  }

  private lowerQuality() {
    this.renderer.setPixelRatio(1);
    this.resize();
  }

  dispose() {
    this.stop();
    this.can.dispose();
    this.bubbles.geometry.dispose();
    (this.bubbles.material as THREE.Material).dispose();
    this.citrus.forEach((c) => c.mesh.geometry.dispose());
    this.crown.geometry.dispose();
    this.spray.geometry.dispose();
    this.crownMat.dispose();
    this.scene.environment?.dispose();
    this.renderer.dispose();
  }
}

export { palettes };
export function canSupport3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
