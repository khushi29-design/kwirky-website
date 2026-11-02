import Link from "next/link";
import type { ReactNode } from "react";
import type { Product } from "@/lib/commerce/types";

const tilts = [-7, 5, -3, 8, -5, 6];

/** Text wordmark standing in until the brand supplies its real logo file. */
export function Wordmark({ className = "", label = "Kwirky" }: { className?: string; label?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label={label} role="img">
      {"KWIRKY".split("").map((l, i) => (
        <span key={i} aria-hidden="true" className="wordmark-l" style={{ transform: `rotate(${tilts[i]}deg)` }}>
          {l}
        </span>
      ))}
    </span>
  );
}

export function Sticker({ children }: { children: ReactNode }) {
  return <span className="sticker">{children}</span>;
}

export function PageHero({ title, intro, tone = "lime", children }: { title: string; intro?: string; tone?: string; children?: ReactNode }) {
  return (
    <header className={`page-hero tone-${tone}`}>
      <div className="wrap">
        <h1 className="display-l">{title}</h1>
        {intro && <p className="lede">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

export function CanImage({ colorway, alt = "", className = "", eager = false }: { colorway: string; alt?: string; className?: string; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/cans/${colorway}.webp`} alt={alt} width={800} height={1200} loading={eager ? "eager" : "lazy"} className={className} />;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className={`product-card can-${product.colorway}`}>
      <span className="product-card-disc" aria-hidden="true" />
      <CanImage colorway={product.colorway} alt={`${product.name} design`} />
      <span className="product-card-name">{product.name}</span>
      <span className="product-card-meta">{product.confirmed ? product.flavour : "Sample design, flavour to be confirmed"}</span>
    </Link>
  );
}
