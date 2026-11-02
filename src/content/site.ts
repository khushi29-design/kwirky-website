/**
 * Single source of truth for brand facts.
 * Only the email, WhatsApp number, domain and category came from the brand brief.
 * Fill in `null` values when the brand confirms them; the UI adapts automatically.
 */
export const site = {
  name: "Kwirky",
  domain: "www.drinkkwirky.com",
  url: "https://www.drinkkwirky.com",
  category: "Soda-based probiotic beverage",
  description: "Meet Kwirky. A refreshingly different take on soda.",
  email: "drinkkwirky@gmail.com",
  whatsappDisplay: "+91 80878 06310",
  whatsappNumber: "918087806310",
  social: {
    instagram: null as string | null, // e.g. "https://instagram.com/yourhandle"
    facebook: null as string | null,
    youtube: null as string | null,
  },
  /** Set a form endpoint (Formspree, your API…) to receive forms directly. */
  contactEndpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || null,
  newsletterEndpoint: process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT || null,
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/quiz", label: "Quiz" },
  { href: "/contact", label: "Contact" },
];

export const whatsappLink = (text: string) =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;

export const mailLink = (subject: string, body = "") =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
