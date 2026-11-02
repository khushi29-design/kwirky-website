import { site } from "./site";

/** `pending: true` answers are holding copy: replace them with confirmed brand information. */
export const faqs: { q: string; a: string; pending?: boolean }[] = [
  {
    q: "What is Kwirky?",
    a: "Kwirky is a soda-based probiotic beverage brand with a playful personality.",
  },
  {
    q: "What are probiotics?",
    a: "The widely used FAO/WHO definition describes probiotics as live microorganisms which, when given in adequate amounts, provide a health benefit to the host. This is a general definition and not a claim about any Kwirky product.",
  },
  { q: "What flavours are available?", a: "The flavour line-up will be published here once it is confirmed.", pending: true },
  { q: "What are the ingredients?", a: "Each product page will list full ingredients once they are confirmed.", pending: true },
  {
    q: "How can I order?",
    a: "Online payment isn't live yet. Add cans to your cart and send your order enquiry to us on WhatsApp.",
  },
  { q: "Where can I purchase Kwirky?", a: "Stockists and delivery areas will be listed here once they are confirmed.", pending: true },
  {
    q: "How can I contact the brand?",
    a: `Email ${site.email} or message us on WhatsApp at ${site.whatsappDisplay}.`,
  },
];
