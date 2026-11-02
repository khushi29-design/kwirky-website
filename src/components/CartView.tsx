"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formatPrice, getProduct } from "@/content/products";
import { useCart } from "@/lib/commerce/cart";
import { checkoutProvider } from "@/lib/commerce/provider";
import { CanImage } from "./Bits";
import { Stepper } from "./ProductBuy";

export function CartView() {
  const { lines, setQuantity, remove } = useCart();
  if (!lines.length) {
    return (
      <div className="empty">
        <p className="lede">Your cart is empty. Pick a can to get started.</p>
        <Link href="/products" className="btn">Browse the cans</Link>
      </div>
    );
  }
  return (
    <div className="cart">
      <ul className="cart-lines">
        {lines.map((l) => {
          const p = getProduct(l.slug);
          if (!p) return null;
          return (
            <li key={l.slug} className="cart-line">
              <Link href={`/products/${p.slug}`}><CanImage colorway={p.colorway} alt="" /></Link>
              <div>
                <Link href={`/products/${p.slug}`} className="cart-name">{p.name}</Link>
                <p className="muted">{formatPrice(p.pricePaise)}</p>
              </div>
              <Stepper value={l.quantity} onChange={(n) => setQuantity(l.slug, n)} label={p.name} />
              <button className="text-btn" onClick={() => remove(l.slug)}>Remove<span className="sr"> {p.name}</span></button>
            </li>
          );
        })}
      </ul>
      <div className="cart-side">
        <p>Prices and delivery will be confirmed with your order, as online payment isn't live yet.</p>
        <Link href="/checkout" className="btn">Continue to order enquiry</Link>
      </div>
    </div>
  );
}

export function CheckoutView() {
  const { lines, clear } = useCart();
  const [v, setV] = useState({ name: "", phone: "", city: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);

  if (sent) {
    return (
      <div className="form-result" role="status">
        <h2>WhatsApp is opening</h2>
        <p>Your order enquiry is written and ready. Press send there to reach us. No payment has been taken.</p>
        <div className="row">
          <a className="btn" href={sent} target="_blank" rel="noopener noreferrer">Open WhatsApp again</a>
          <button className="btn btn-ghost" onClick={clear}>Clear my cart</button>
        </div>
      </div>
    );
  }
  if (!lines.length) {
    return (
      <div className="empty">
        <p className="lede">Your cart is empty, so there's nothing to order yet.</p>
        <Link href="/products" className="btn">Browse the cans</Link>
      </div>
    );
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (v.name.trim().length < 2) next.name = "Enter your name.";
    if (!/^\+?[\d\s-]{10,15}$/.test(v.phone.trim())) next.phone = "Enter a phone number with at least 10 digits.";
    if (v.city.trim().length < 2) next.city = "Enter your city.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`order-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    const { redirectUrl } = await checkoutProvider.submit(lines, v);
    setSent(redirectUrl);
    window.open(redirectUrl, "_blank", "noopener");
  };
  const field = (k: "name" | "phone" | "city", label: string, type = "text", auto = "on") => (
    <div className="field">
      <label htmlFor={`order-${k}`}>{label}</label>
      <input id={`order-${k}`} type={type} autoComplete={auto} value={v[k]} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `order-err-${k}` : undefined} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
      {errors[k] && <p className="field-error" id={`order-err-${k}`}>{errors[k]}</p>}
    </div>
  );
  return (
    <div className="checkout">
      <div className="notice">
        <strong>Online payment isn't live yet.</strong> This form sends your order enquiry to Kwirky on WhatsApp. You won't be charged here.
      </div>
      <form className="form" onSubmit={submit} noValidate>
        {field("name", "Your name", "text", "name")}
        {field("phone", "Phone number", "tel", "tel")}
        {field("city", "City", "text", "address-level2")}
        <div className="field">
          <label htmlFor="order-note">Note (optional)</label>
          <textarea id="order-note" rows={3} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} />
        </div>
        <button className="btn">Send enquiry on WhatsApp</button>
      </form>
    </div>
  );
}
