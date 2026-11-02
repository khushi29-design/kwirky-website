import type { MetadataRoute } from "next";
export const dynamic = "force-static";
import { products } from "@/content/products";
import { site } from "@/content/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/products", ...products.map((p) => `/products/${p.slug}`), "/testimonials", "/contact", "/faq", "/team", "/quiz", "/privacy", "/terms"].map((p) => ({ url: `${site.url}${p}` }));
}
