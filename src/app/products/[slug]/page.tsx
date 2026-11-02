import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard, Sticker } from "@/components/Bits";
import { ProductBuy } from "@/components/ProductBuy";
import { ProductViewer } from "@/components/ProductViewer";
import { formatPrice, getProduct, products } from "@/content/products";

type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: p.name, description: p.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const specs = [
    { label: "Flavour", value: p.flavour ?? "To be confirmed" },
    { label: "Ingredients", value: p.ingredients ?? "To be confirmed" },
    ...(p.specs.length ? p.specs : [{ label: "Specifications", value: "To be confirmed" }]),
  ];
  return (
    <>
      <section className={`pdp panel-${p.colorway}`}>
        <div className="wrap pdp-grid">
          <ProductViewer colorway={p.colorway} alt={`${p.name} design`} />
          <div className="pdp-info">
            <nav aria-label="Breadcrumb" className="crumb"><Link href="/products">All products</Link></nav>
            <h1 className="display-l">{p.name}</h1>
            {!p.confirmed && <Sticker>Sample design, not a real flavour yet</Sticker>}
            <p className="lede">{p.description}</p>
            <p className="pdp-price">{formatPrice(p.pricePaise)}</p>
            <ProductBuy slug={p.slug} name={p.name} />
            <dl className="specs">{specs.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>
          </div>
        </div>
      </section>
      <section className="section tone-cream">
        <div className="wrap">
          <h2 className="display-m">More cans</h2>
          <div className="product-grid three">{products.filter((o) => o.slug !== p.slug).map((o) => <ProductCard key={o.slug} product={o} />)}</div>
        </div>
      </section>
    </>
  );
}
