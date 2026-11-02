"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { faqs } from "@/content/faq";
import { products } from "@/content/products";
import { nav } from "@/content/site";
import { useCart } from "@/lib/commerce/cart";
import { Wordmark } from "./Bits";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ lerp: 0.11, anchors: { offset: 0 } });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);
  useEffect(() => {
    if (!window.location.hash) {
      const l = (window as unknown as { __lenis?: Lenis }).__lenis;
      if (l) l.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    const l = (window as unknown as { __lenis?: Lenis }).__lenis;
    document.documentElement.classList.toggle("locked", menu || search);
    if (menu || search) l?.stop();
    else l?.start();
    if (menu) firstLink.current?.focus();
    if (!menu) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [menu, search]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={`site-header ${scrolled || pathname === "/quiz" || pathname.startsWith("/products/") ? "is-solid" : ""} ${menu ? "is-menu" : ""}`}>
        <Link href="/" aria-label="Kwirky home" className="brand"><Wordmark label="Kwirky" /></Link>
        <nav aria-label="Main" className="main-nav">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname === n.href ? "page" : undefined}>{n.label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-btn" aria-label="Search the site" onClick={() => setSearch(true)}>
            <Icon d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4.3-4.3" />
          </button>
          <Link href="/cart" className="icon-btn" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
            <Icon d="M6 7h13l-1.4 8.5a2 2 0 0 1-2 1.5H9.4a2 2 0 0 1-2-1.6L5.2 4H3" />
            {count > 0 && <span className="cart-count" aria-hidden="true">{count}</span>}
          </Link>
          <Link href="/products" className="btn btn-small shop-link">Shop now</Link>
          <button ref={menuBtn} className="icon-btn menu-btn" aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu((m) => !m)}>
            <Icon d={menu ? "M6 6l12 12M18 6 6 18" : "M4 8h16M4 16h16"} />
          </button>
        </div>
      </header>
      <div id="mobile-menu" className={`mobile-menu ${menu ? "is-open" : ""}`} aria-hidden={!menu} inert={!menu}>
        <nav aria-label="Mobile">
          {nav.map((n, i) => (
            <Link key={n.href} ref={i === 0 ? firstLink : undefined} href={n.href} onClick={() => setMenu(false)} style={{ transitionDelay: menu ? `${80 + i * 45}ms` : "0ms" }}>{n.label}</Link>
          ))}
          <Link href="/products" className="btn" onClick={() => setMenu(false)}>Shop now</Link>
        </nav>
      </div>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const previous = useRef<Element | null>(null);

  const index = useMemo(
    () => [
      { href: "/", title: "Home", text: "kwirky soda home" },
      { href: "/about", title: "About Kwirky", text: "brand story about" },
      { href: "/products", title: "All products", text: "shop cans range flavours" },
      { href: "/quiz", title: "What's your Kwirky vibe?", text: "quiz personality" },
      { href: "/testimonials", title: "Why people love Kwirky", text: "reviews testimonials" },
      { href: "/team", title: "Team", text: "people founders" },
      { href: "/faq", title: "FAQ", text: "questions help" },
      { href: "/contact", title: "Contact us", text: "email whatsapp message" },
      { href: "/cart", title: "Your cart", text: "basket order checkout" },
      { href: "/privacy", title: "Privacy Policy", text: "data legal" },
      { href: "/terms", title: "Terms and Conditions", text: "legal" },
      ...products.map((p) => ({ href: `/products/${p.slug}`, title: p.name, text: `product can ${p.flavour ?? ""} ${p.description}` })),
      ...faqs.map((f) => ({ href: "/faq", title: f.q, text: f.a })),
    ],
    [],
  );
  const terms = q.trim().toLowerCase();
  const results = terms ? index.filter((i) => `${i.title} ${i.text}`.toLowerCase().includes(terms)).slice(0, 8) : [];

  useEffect(() => {
    previous.current = document.activeElement;
    dialog.current?.querySelector("input")?.focus();
    return () => (previous.current as HTMLElement | null)?.focus?.();
  }, []);

  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key !== "Tab") return;
    const items = dialog.current!.querySelectorAll<HTMLElement>("input, button, a");
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Search the site" ref={dialog} onKeyDown={keys}>
      <form role="search" onSubmit={(e) => { e.preventDefault(); if (results[0]) { router.push(results[0].href); onClose(); } }}>
        <label htmlFor="site-search">Search Kwirky</label>
        <div className="search-row">
          <input id="site-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try quiz, order or WhatsApp" autoComplete="off" />
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </form>
      <div aria-live="polite">
        {terms && results.length === 0 && <p className="search-empty">No matches for “{q}”. Try another word, or ask us on the contact page.</p>}
        {results.length > 0 && (
          <ul className="search-results">
            {results.map((r, i) => (
              <li key={`${r.href}-${i}`}><Link href={r.href} onClick={onClose}>{r.title}</Link></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
