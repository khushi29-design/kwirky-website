import type { Product } from "@/lib/commerce/types";

/**
 * PLACEHOLDER CATALOGUE. The brand has not confirmed flavours, ingredients,
 * specifications or prices. Replace these entries and set `confirmed: true`;
 * placeholder stickers disappear and "Add to cart" pricing appears on its own.
 */
export const products: Product[] = [
  {
    slug: "orange-can",
    confirmed: false,
    name: "Orange can",
    colorway: "orange",
    flavour: null,
    description: "A sample can design showing where your first flavour will live.",
    ingredients: null,
    specs: [],
    pricePaise: null,
  },
  {
    slug: "lime-can",
    confirmed: false,
    name: "Lime can",
    colorway: "lime",
    flavour: null,
    description: "A sample can design showing where your second flavour will live.",
    ingredients: null,
    specs: [],
    pricePaise: null,
  },
  {
    slug: "coral-can",
    confirmed: false,
    name: "Coral can",
    colorway: "coral",
    flavour: null,
    description: "A sample can design showing where your third flavour will live.",
    ingredients: null,
    specs: [],
    pricePaise: null,
  },
  {
    slug: "plum-can",
    confirmed: false,
    name: "Plum can",
    colorway: "plum",
    flavour: null,
    description: "A sample can design showing where your fourth flavour will live.",
    ingredients: null,
    specs: [],
    pricePaise: null,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (paise: number | null) =>
  paise === null
    ? "Price to be announced"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
