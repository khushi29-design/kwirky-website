import type { Metadata } from "next";
import { PageHero } from "@/components/Bits";
import { ContactForm } from "@/components/Forms";
import { site, whatsappLink } from "@/content/site";
export const metadata: Metadata = { title: "Contact us", description: "Email or WhatsApp the Kwirky team." };
export default function Page() {
  return (
    <>
      <PageHero title="SAY HELLO" intro="Stockists, collaborations or a simple hello are all welcome." tone="lime" />
      <section className="section tone-cream">
        <div className="wrap split">
          <div className="contact-links big">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={whatsappLink("Hi Kwirky!")} target="_blank" rel="noopener noreferrer">WhatsApp {site.whatsappDisplay}</a>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
