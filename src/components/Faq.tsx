"use client";
import { useState } from "react";
import { faqs } from "@/content/faq";
import { Sticker } from "./Bits";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq">
      {faqs.map((f, i) => (
        <div key={f.q} className={`faq-item ${open === i ? "is-open" : ""}`}>
          <h3>
            <button aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <span className="faq-plus" aria-hidden="true" />
            </button>
          </h3>
          <div id={`faq-${i}`} className="faq-a" role="region" inert={open !== i}>
            <div>
              <p>{f.a}</p>
              {f.pending && <Sticker>Holding answer</Sticker>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
