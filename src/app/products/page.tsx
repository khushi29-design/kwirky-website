import type { Metadata } from "next";
import { PageHero, ProductCard, Sticker } from "@/components/Bits";
import { products } from "@/content/products";
export const metadata: Metadata = { title: "Products", description: "The Kwirky range of soda-based probiotic beverages." };
export default function Products() {
  return (
    <>
      <PageHero title="THE CANS" intro="Pick a colour and take a closer look." tone="orange">
        {products.some((p) => !p.confirmed) && <Sticker>Sample designs until the range is confirmed</Sticker>}
      </PageHero>
      <section className="section tone-cream"><div className="wrap product-grid">{products.map((p) => <ProductCard key={p.slug} product={p} />)}</div></section>
    </>
  );
}
