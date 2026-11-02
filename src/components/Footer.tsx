import Link from "next/link";
import { site, whatsappLink } from "@/content/site";
import { Wordmark } from "./Bits";
import { NewsletterForm } from "./Forms";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Wordmark className="footer-mark" />
          <p>A soda-based probiotic beverage brand with a playful personality.</p>
        </div>
        <nav aria-label="Explore" className="footer-col">
          <h2>Explore</h2>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/products">Products</Link>
          <Link href="/quiz">Quiz</Link>
          <Link href="/testimonials">Testimonials</Link>
          <Link href="/team">Team</Link>
          <Link href="/faq">FAQ</Link>
        </nav>
        <div className="footer-col">
          <h2>Contact</h2>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={whatsappLink("Hi Kwirky!")} target="_blank" rel="noopener noreferrer">WhatsApp {site.whatsappDisplay}</a>
          <Link href="/contact">Send a message</Link>
          {site.social.instagram ? (
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          ) : (
            <span className="muted">Instagram link coming soon</span>
          )}
        </div>
        <div className="footer-col footer-news">
          <h2>Get the news first</h2>
          <NewsletterForm />
        </div>
      </div>
      <div className="wrap footer-base">
        <span>© {new Date().getFullYear()} Kwirky</span>
        <span className="footer-legal">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms and Conditions</Link>
        </span>
      </div>
    </footer>
  );
}
