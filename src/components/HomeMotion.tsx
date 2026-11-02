"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { products } from "@/content/products";
import { fontsReady } from "@/lib/three/can";
import { canSupport3D, KwirkyScene, type CanState } from "@/lib/three/scene";

gsap.registerPlugin(ScrollTrigger);

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
    const mobile = window.matchMedia("(max-width: 899px)").matches;
    let scene: KwirkyScene | null = null;
    let stops: Stop[] = [];
    let disposed = false;

    const el = (q: string) => document.querySelector<HTMLElement>(q);
    const top = (q: string) => (el(q)?.getBoundingClientRect().top ?? 0) + window.scrollY;
    const end = (q: string) => top(q) + (el(q)?.offsetHeight ?? 0) - window.innerHeight;

    const measure = () => {
      if (mobile) {
        const a = K(0.4, -0.5, 0.5, 0.1, 0.24, 0.45);
        stops = [
          { y: 0, s: K(0, 0.14, 0.7, 0.05, -0.12, 1, 0.8) },
          { y: end("#hero-wrap"), s: a },
          { y: top("#difference") - window.innerHeight * 0.75, s: a },
          { y: top("#difference") - window.innerHeight * 0.15, s: K(0.4, -2.4, 0.5, 0.1, 0.24, 0) },
        ];
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

      // Products: horizontal travel on desktop, the can stays centre stage.
      if (!mobile && !reduced) {
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

    const onResize = () => {
      scene?.resize();
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
