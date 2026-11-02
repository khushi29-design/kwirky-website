import type { Metadata } from "next";
import { PageHero } from "@/components/Bits";
import { Faq } from "@/components/Faq";
export const metadata: Metadata = { title: "FAQ", description: "Answers to common questions about Kwirky." };
export default function Page() {
  return (<><PageHero title="GOOD QUESTIONS" intro="Here's what people ask us most." tone="orange" /><section className="section tone-cream"><div className="wrap narrow"><Faq /></div></section></>);
}
