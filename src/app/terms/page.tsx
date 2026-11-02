import type { Metadata } from "next";
import { PageHero, Sticker } from "@/components/Bits";
import { site } from "@/content/site";
export const metadata: Metadata = { title: "Terms and Conditions" };
export default function Page() {
  return (
    <>
      <PageHero title="TERMS AND CONDITIONS" tone="lime"><Sticker>Draft, needs legal review before launch</Sticker></PageHero>
      <section className="section tone-cream"><div className="wrap prose">
        <h2>Using this website</h2>
        <p>This website introduces the Kwirky brand. Product designs marked as samples aren't available for sale and may change.</p>
        <h2>Orders</h2>
        <p>Online payment isn't available yet. Sending an order enquiry doesn't create a purchase or take payment. Price, availability and delivery are confirmed by Kwirky directly before any sale.</p>
        <h2>Brand content</h2>
        <p>The Kwirky name, designs and content on this website belong to the brand and can't be reused without permission.</p>
        <h2>Contact</h2>
        <p>Email <a href={`mailto:${site.email}`}>{site.email}</a> with any question about these terms.</p>
      </div></section>
    </>
  );
}
