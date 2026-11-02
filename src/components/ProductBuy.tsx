"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/commerce/cart";

export function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(value - 1)}>−</button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export function ProductBuy({ slug, name }: { slug: string; name: string }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  return (
    <div className="buy">
      <Stepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(99, n)))} label={name} />
      <button className="btn" onClick={() => { add(slug, qty); setAdded(true); }}>Add to cart</button>
      <p className="buy-status" role="status">
        {added && <>Added to your cart. <Link href="/cart">View cart</Link></>}
      </p>
    </div>
  );
}
