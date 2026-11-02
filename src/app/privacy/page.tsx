import type { Metadata } from "next";
import { PageHero, Sticker } from "@/components/Bits";
import { site } from "@/content/site";
export const metadata: Metadata = { title: "Privacy Policy" };
export default function Page() {
  return (
    <>
      <PageHero title="PRIVACY POLICY" tone="lime"><Sticker>Draft, needs legal review before launch</Sticker></PageHero>
      <section className="section tone-cream"><div className="wrap prose">
        <h2>What this website stores</h2>
        <p>Your cart is saved in your own browser so it's still there when you return. It isn't sent to us unless you choose to send an order enquiry.</p>
        <h2>What you choose to send us</h2>
        <p>The contact, newsletter and order forms open your email or WhatsApp app with your message written. We receive your details only when you press send there. Your use of those apps is covered by their own privacy policies.</p>
        <h2>How we use it</h2>
        <p>We use what you send to reply to you, handle your enquiry or send the news you asked for. Ask us at any time to correct or delete your details.</p>
        <h2>Contact</h2>
        <p>Email <a href={`mailto:${site.email}`}>{site.email}</a> with any privacy question.</p>
      </div></section>
    </>
  );
}
