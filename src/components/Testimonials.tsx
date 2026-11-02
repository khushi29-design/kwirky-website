"use client";
import { useEffect, useRef, useState } from "react";
import { testimonials } from "@/content/people";
import { mailLink } from "@/content/site";

const slots = [
  "The first real review goes here.",
  "Real words from real people only. No made-up praise.",
  "Tried Kwirky? This spot could be yours.",
];

export function Testimonials() {
  const real = testimonials.length > 0;
  const count = real ? testimonials.length : slots.length;
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (n: number) => {
    const next = (n + count) % count;
    setI(next);
    const el = track.current?.children[next] as HTMLElement | undefined;
    if (el && track.current) track.current.scrollTo({ left: el.offsetLeft - track.current.offsetLeft, behavior: "smooth" });
  };
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let timer = 0;
    const on = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const w = (t.children[0] as HTMLElement).offsetWidth + 20;
        setI(Math.min(count - 1, Math.round(t.scrollLeft / w)));
      }, 140);
    };
    t.addEventListener("scroll", on, { passive: true });
    return () => {
      window.clearTimeout(timer);
      t.removeEventListener("scroll", on);
    };
  }, [count]);

  return (
    <div className="voices">
      <div className="voices-track" ref={track} tabIndex={0} role="group" aria-label="Customer reviews">
        {real
          ? testimonials.map((t) => (
              <figure key={t.name + t.quote} className="voice">
                <blockquote>{t.quote}</blockquote>
                <figcaption>{t.name}{t.place ? `, ${t.place}` : ""}</figcaption>
              </figure>
            ))
          : slots.map((s) => (
              <div key={s} className="voice voice-slot">
                <p>{s}</p>
                <span className="sticker">Empty review slot</span>
              </div>
            ))}
      </div>
      <div className="voices-nav">
        <button className="round-btn" aria-label="Previous review" onClick={() => go(i - 1)}>‹</button>
        <span aria-live="polite">{i + 1} of {count}</span>
        <button className="round-btn" aria-label="Next review" onClick={() => go(i + 1)}>›</button>
        <a className="btn" href={mailLink("My Kwirky review", "Here's what I thought of Kwirky:\n\nMy name and city:\n")}>Share your review</a>
      </div>
    </div>
  );
}
