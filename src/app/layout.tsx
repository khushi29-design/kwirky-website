import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource-variable/instrument-sans/index.css";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header, SmoothScroll } from "@/components/SiteChrome";
import { CartProvider } from "@/lib/commerce/cart";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Kwirky | A refreshingly different take on soda", template: "%s | Kwirky" },
  description: site.description,
  openGraph: { title: "Kwirky", description: site.description, url: site.url, siteName: "Kwirky", type: "website", images: ["/cans/orange.webp"] },
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/favicon.svg` },
};
export const viewport: Viewport = { themeColor: "#fff1c9", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SmoothScroll />
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
