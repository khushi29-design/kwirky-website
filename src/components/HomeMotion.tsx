"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { products } from "@/content/products";
import { fontsReady } from "@/lib/three/can";
import { canSupport3D, KwirkyScene, type CanState } from "@/lib/three/scene";

gsap.registerPlugin(ScrollTrigger);
// Phones show/hide the address bar while scrolling; don't recalculate every animation when that happens.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Scale that makes the can (about 2.64 units tall, camera fov 30 at z 9) roughly `px` pixels tall on screen. */
const canScaleFor = (px: number) => {
  const w = window.innerWidth, h = window.innerHeight;
  const fit = Math.min(1, w / h / 0.62);
  return px / (0.5474 * fit * h);
};

type Stop = { y: number; s: CanState };
const K = (x: number, y: number, s: number, rx: number, rz: number, fx: number, liquid = 0): CanState => ({ x, y, s, rx, rz, fx, liquid });

/** Mounts the fixed can canvas and all homepage scroll choreography. */
export function HomeMotion() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const has3D = canSupport3D();
    if (!has3D) root.classList.add("no3d");
    const mq = window.matchMedia("(max-width: 899px)");
    let mobile = mq.matches;
    let scene: KwirkyScene | null = null;
    let stops: Stop[] = [];
    let disposed = false;

    const el = (q: string) => document.querySelector<HTMLElement>(q);
    const top = (q: string) => (el(q)?.getBoundingClientRect().top ?? 0) + window.scrollY;
    const end = (q: string) => top(q) + (el(q)?.offsetHeight ?? 0) - window.innerHeight;

    const measure = () => {
      if (mobile) {
        const vh = window.innerHeight;
        const a = K(0.4, -0.5, 0.5, 0.1, 0.24, 0.45);
        // Products: centre the can in the empty band between each panel's title and its details.
        const left = el(".show-panel .show-left"), right = el(".show-panel .show-right");
        let show = K(0, 0, 0.5, 0.06, 0, 0.25);
        if (left && right) {
          const from = left.offsetTop + left.offsetHeight, to = right.offsetTop;
          if (to - from > 120) show = K(0, 1 - (from + to) / vh, Math.min(0.75, canScaleFor((to - from) * 0.86)), 0.06, 0, 0.25);
          else show = K(0, -0.14, canScaleFor(vh * 0.5), 0.06, 0, 0.25); // phone on its side: columns, can in the middle
        }
        const story = K(0.42, 0.06, Math.min(0.6, canScaleFor(vh * 0.34)), 0.08, 0.16, 0.45);
        stops = [
          { y: 0, s: K(0, 0.14, 0.7, 0.05, -0.12, 1, 0.8) },
          { y: end("#hero-wrap"), s: a },
          { y: top("#difference") - vh * 0.75, s: a },
          { y: top("#difference") - vh * 0.15, s: K(0.4, -2.4, 0.5, 0.1, 0.24, 0) },
          { y: top("#products") - vh * 0.6, s: { ...show, y: -2.4, fx: 0 } },
          { y: top("#products"), s: show },
          { y: end("#products"), s: show },
          { y: top("#quiz"), s: { ...show, y: 2.4, rx: 0.3, fx: 0 } },
          { y: top("#story") - vh, s: { ...story, y: -2.4, fx: 0 } },
          { y: top("#story"), s: story },
          { y: end("#story"), s: story },
          { y: top("#love"), s: { ...story, y: 2.4, rx: 0.3, fx: 0 } },
        ];
        stops.sort((p, q) => p.y - q.y);
      } else {
        const intro = K(0.52, -0.02, 1.22, 0.12, 0.22, 0.45);
        const diff = K(-0.56, 0, 1.02, -0.05, -0.18, 0.45);
        const show = K(0, -0.02, 0.98, 0.06, 0, 0.25);
        const story = K(0.58, 0, 0.92, 0.08, 0.16, 0.45);
        stops = [
          { y: 0, s: K(0, -0.04, 1, 0.05, -0.16, 1, 1) },
          { y: end("#hero-wrap"), s: intro },
          { y: end("#intro"), s: intro },
          { y: top("#difference"), s: diff },
          { y: end("#difference"), s: diff },
          { y: top("#products"), s: show },
          { y: end("#products"), s: show },
          { y: top("#quiz"), s: K(0, 2.4, 0.9, 0.3, 0, 0) },
          { y: top("#story") - window.innerHeight, s: K(0.58, -2.4, 0.92, 0, 0.16, 0) },
          { y: top("#story"), s: story },
          { y: end("#story"), s: story },
          { y: top("#love"), s: K(0.58, 2.4, 0.92, 0.3, 0.16, 0) },
        ];
      }
    };

    const apply = () => {
      if (!scene || !stops.length) return;
      const y = window.scrollY;
      let i = stops.findIndex((s) => s.y > y);
      let state: CanState;
      if (i === -1) state = stops[stops.length - 1].s;
      else if (i === 0) state = stops[0].s;
      else {
        const a = stops[i - 1];
        const b = stops[i];
        const p = gsap.parseEase("power2.inOut")((y - a.y) / Math.max(1, b.y - a.y));
        state = {} as CanState;
        (Object.keys(a.s) as (keyof CanState)[]).forEach((k) => (state[k] = a.s[k] + (b.s[k] - a.s[k]) * p));
      }
      scene.target = state;
      scene.scrollSpin = y * 0.0024;
      // Only render while the can can actually be seen.
      const onScreen = Math.abs(state.y) < 1.9 || Math.abs(scene.now.y) < 1.9;
      if (onScreen && !document.hidden) scene.start();
      else scene.stop();
      if (canvas.current) canvas.current.style.visibility = onScreen ? "visible" : "hidden";
      if (y < (stops[1]?.y ?? 0) && scene.currentColorway !== "orange") scene.setColorway("orange");
    };

    const ctx = gsap.context(() => {
      // Hero: the lime disc behind the can floods the whole screen.
      if (!reduced) {
        const disc = el(".flood");
        if (disc) {
          const fill = () => (Math.hypot(window.innerWidth, window.innerHeight) * 1.08) / disc.offsetWidth;
          gsap.fromTo(disc, { scale: 1 }, {
            scale: fill, ease: "none",
            scrollTrigger: { trigger: "#hero-wrap", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
          });
          gsap.to(".hero-copy, .hero-word", {
            autoAlpha: 0, y: -40, ease: "none",
            scrollTrigger: { trigger: "#hero-wrap", start: "12% top", end: "55% bottom", scrub: true },
          });
        }
        gsap.from(".hero-word .wordmark-l", { yPercent: 70, opacity: 0, duration: 0.9, stagger: 0.06, ease: "back.out(1.8)", delay: 0.25 });
        gsap.from(".hero-copy > *", { y: 24, opacity: 0, duration: 0.7, stagger: 0.1, delay: 0.7, ease: "power3.out" });

        // Intro: the headline darkens word by word as you read.
        gsap.fromTo("#intro .scrub-word", { opacity: 0.14 }, {
          opacity: 1, stagger: 0.3, ease: "none",
          scrollTrigger: { trigger: "#intro", start: "top top", end: "bottom bottom", scrub: true },
        });

        // Story: type slides past in opposite directions over the bubbles.
        gsap.fromTo(".story-a", { xPercent: 26 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: "#story", start: "top bottom", end: "bottom top", scrub: true } });
        gsap.fromTo(".story-b", { xPercent: -36 }, { xPercent: 18, ease: "none", scrollTrigger: { trigger: "#story", start: "top bottom", end: "bottom top", scrub: true } });
        gsap.utils.toArray<HTMLElement>(".story-disc").forEach((d, i) => {
          gsap.fromTo(d, { y: 120 + i * 120 }, { y: -(120 + i * 140), ease: "none", scrollTrigger: { trigger: "#story", start: "top bottom", end: "bottom top", scrub: true } });
        });
      }

      // Products: horizontal travel on every screen size, the can stays centre stage.
      if (!reduced) {
        const track = el(".show-track");
        if (track) {
          gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
              trigger: "#products",
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (st) => {
                const i = Math.round(st.progress * (products.length - 1));
                scene?.setColorway(products[i].colorway);
              },
            },
          });
        }
      }
    });

    // Only re-measure when the width changes (rotation, window resize), not when a phone's address bar moves.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      scene?.resize();
      if (window.innerWidth === lastWidth) { apply(); return; }
      lastWidth = window.innerWidth;
      mobile = mq.matches;
      ScrollTrigger.refresh();
    };
    const onScroll = () => apply();
    const onRefresh = () => { measure(); apply(); };
    const onMouse = (e: PointerEvent) => {
      if (!scene) return;
      scene.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      scene.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onVisible = () => { if (document.hidden) scene?.stop(); else apply(); };

    (async () => {
      if (has3D && canvas.current) {
        await Promise.race([fontsReady(), new Promise((r) => setTimeout(r, 1800))]);
        if (disposed) return;
        try {
          measure();
          scene = new KwirkyScene(canvas.current, stops[0].s, mobile);
          (window as unknown as { __kwirkyScene?: KwirkyScene }).__kwirkyScene = scene;
          apply();
        } catch (err) {
          console.warn("3D scene unavailable, using still images.", err);
          root.classList.add("no3d");
        }
      }
      if (!disposed) {
        setLoading(false);
        ScrollTrigger.refresh();
      }
    })();

    ScrollTrigger.addEventListener("refresh", onRefresh);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMouse, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    const failSafe = setTimeout(() => setLoading(false), 4000);
    const lateRefresh = setTimeout(() => ScrollTrigger.refresh(), 700);

    return () => {
      disposed = true;
      clearTimeout(failSafe);
      clearTimeout(lateRefresh);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMouse);
      document.removeEventListener("visibilitychange", onVisible);
      ctx.revert();
      scene?.dispose();
      delete (window as unknown as { __kwirkyScene?: KwirkyScene }).__kwirkyScene;
      root.classList.remove("no3d");
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="can-stage" aria-hidden="true" />
      <div className={`loader ${loading ? "" : "is-done"}`} aria-hidden="true">
        <span /><span /><span />
      </div>
    </>
  );
}
