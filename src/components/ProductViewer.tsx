"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createCan, fontsReady } from "@/lib/three/can";
import { canSupport3D, makeRenderer, studio } from "@/lib/three/scene";
import type { Colorway } from "@/lib/commerce/types";
import { CanImage } from "./Bits";

/** Drag-to-rotate product can. Falls back to the still image without WebGL. */
export function ProductViewer({ colorway, alt }: { colorway: Colorway; alt: string }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!canSupport3D() || !canvas.current || !host.current) return;
    let alive = true;
    let cleanup = () => {};
    (async () => {
      await fontsReady();
      if (!alive) return;
      const el = canvas.current!;
      const box = host.current!;
      const renderer = makeRenderer(el, 2);
      const scene = new THREE.Scene();
      studio(scene, renderer);
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
      camera.position.z = 8.4;
      const can = createCan(colorway, { droplets: 300 });
      scene.add(can.group);
      can.group.rotation.z = -0.08;
      const size = () => {
        const { width, height } = box.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = camera.aspect < 0.72 ? 8.4 * (0.72 / camera.aspect) : 8.4;
        camera.updateProjectionMatrix();
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(box);

      let velocity = 0.45;
      let dragging = false;
      let lastX = 0;
      const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; el.setPointerCapture(e.pointerId); };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        can.group.rotation.y += dx * 0.012;
        velocity = dx * 0.5;
      };
      const up = () => { dragging = false; };
      const key = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") { can.group.rotation.y -= 0.25; e.preventDefault(); }
        if (e.key === "ArrowRight") { can.group.rotation.y += 0.25; e.preventDefault(); }
      };
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
      el.addEventListener("keydown", key);

      let last = performance.now();
      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(box);
      let raf = 0;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        const n = performance.now();
        const dt = Math.min((n - last) / 1000, 0.05);
        last = n;
        if (!visible) return;
        if (!dragging) {
          velocity += (0.45 - velocity) * Math.min(1, dt * 1.6);
          can.group.rotation.y += velocity * dt;
        }
        renderer.render(scene, camera);
      };
      loop();
      setLive(true);
      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        can.dispose();
        scene.environment?.dispose();
        renderer.dispose();
      };
    })();
    return () => { alive = false; cleanup(); };
  }, [colorway]);

  return (
    <div className={`viewer ${live ? "is-live" : ""}`} ref={host}>
      <span className="viewer-disc" aria-hidden="true" />
      <CanImage colorway={colorway} alt={alt} eager className="viewer-img" />
      <canvas ref={canvas} tabIndex={live ? 0 : -1} role="img" aria-label={`${alt}. Drag or use the arrow keys to rotate.`} />
      {live && <p className="viewer-hint">Drag to rotate</p>}
    </div>
  );
}
