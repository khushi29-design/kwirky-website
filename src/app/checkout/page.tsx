import type { Metadata } from "next";
import { CheckoutView } from "@/components/CartView";
import { PageHero } from "@/components/Bits";
export const metadata: Metadata = { title: "Order enquiry", robots: { index: false } };
export default function Page() { return (<><PageHero title="ORDER ENQUIRY" tone="orange" /><section className="section tone-cream"><div className="wrap narrow"><CheckoutView /></div></section></>); }
