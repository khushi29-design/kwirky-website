import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { PageHero } from "@/components/Bits";
export const metadata: Metadata = { title: "Cart", robots: { index: false } };
export default function Page() { return (<><PageHero title="YOUR CART" tone="lime" /><section className="section tone-cream"><div className="wrap"><CartView /></div></section></>); }
