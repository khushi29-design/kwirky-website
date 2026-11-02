import { getProduct } from "@/content/products";
import { whatsappLink } from "@/content/site";
import type { CheckoutProvider } from "./types";

/** No payment gateway is confirmed, so checkout sends an order enquiry on WhatsApp. */
export const checkoutProvider: CheckoutProvider = {
  mode: "enquiry",
  async submit(lines, d) {
    const items = lines
      .map((l) => `- ${l.quantity} x ${getProduct(l.slug)?.name ?? l.slug}`)
      .join("\n");
    const text = `Hi Kwirky, I'd like to order:\n${items}\n\nName: ${d.name}\nPhone: ${d.phone}\nCity: ${d.city}${
      d.note ? `\nNote: ${d.note}` : ""
    }`;
    return { redirectUrl: whatsappLink(text) };
  },
};
