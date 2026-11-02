"use client";
import { useState } from "react";

const items = [
  { title: "Refreshing first", text: "A drink should wake you up a little. Every part of Kwirky starts from that feeling." },
  { title: "A probiotic idea", text: "Kwirky is a soda-based probiotic beverage. Verified product details will be shared here as they are confirmed." },
  { title: "Ordinary, it isn't", text: "It is a playful alternative for people who get bored of the usual choices on the shelf." },
  { title: "All personality", text: "Flavour and character sit at the centre of the brand, from the can to the conversation." },
];

export function Difference() {
  const [active, setActive] = useState(0);
  return (
    <div className="diff">
      <div className="diff-orbs" role="tablist" aria-label="What makes Kwirky different">
        {items.map((it, i) => (
          <button key={it.title} id={`diff-tab-${i}`} role="tab" aria-selected={active === i} aria-controls="diff-panel" tabIndex={active === i ? 0 : -1} className={`orb orb-${i} ${active === i ? "is-active" : ""}`} onClick={() => setActive(i)} onMouseEnter={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const n = (i + (e.key === "ArrowRight" ? 1 : items.length - 1)) % items.length;
              setActive(n);
              document.getElementById(`diff-tab-${n}`)?.focus();
            }}>
            {it.title}
          </button>
        ))}
      </div>
      <p id="diff-panel" role="tabpanel" aria-labelledby={`diff-tab-${active}`} className="diff-text" key={active}>{items[active].text}</p>
    </div>
  );
}
