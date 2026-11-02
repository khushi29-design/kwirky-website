export type Colorway = "orange" | "lime" | "coral" | "plum";

export interface Product {
  slug: string;
  /** false shows a visible placeholder sticker wherever the product appears. */
  confirmed: boolean;
  name: string;
  colorway: Colorway;
  flavour: string | null;
  description: string;
  ingredients: string | null;
  specs: { label: string; value: string }[];
  pricePaise: number | null;
}

export interface CartLine {
  slug: string;
  quantity: number;
}

export interface OrderDetails {
  name: string;
  phone: string;
  city: string;
  note?: string;
}

/**
 * Implement this for Razorpay, Stripe, Shopify and so on, then swap it in
 * `provider.ts`. Pages only talk to this interface, so nothing else needs rebuilding.
 */
export interface CheckoutProvider {
  /** "enquiry" takes no payment; "payment" means money is really collected. */
  mode: "enquiry" | "payment";
  submit(lines: CartLine[], details: OrderDetails): Promise<{ redirectUrl: string }>;
}

/** Reserved for user accounts once an auth backend is chosen. */
export interface Customer {
  id: string;
  name: string;
  email: string;
}
