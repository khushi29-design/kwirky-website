import type { Metadata } from "next";
import { PageHero } from "@/components/Bits";
import { Testimonials } from "@/components/Testimonials";
export const metadata: Metadata = { title: "Testimonials", description: "What people say about Kwirky." };
export default function Page() {
  return (<><PageHero title="WHY PEOPLE LOVE KWIRKY" intro="Only real customer words will appear on this page." tone="coral" /><section className="section tone-cream"><div className="wrap"><Testimonials /></div></section></>);
}
