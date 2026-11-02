import Link from "next/link";
import { CanImage, Sticker, Wordmark } from "@/components/Bits";
import { Difference } from "@/components/Difference";
import { Faq } from "@/components/Faq";
import { ContactForm } from "@/components/Forms";
import { HomeMotion } from "@/components/HomeMotion";
import { Quiz } from "@/components/Quiz";
import { Testimonials } from "@/components/Testimonials";
import { formatPrice, products } from "@/content/products";
import { site, whatsappLink } from "@/content/site";

const intro = "NOT YOUR ORDINARY SODA.".split(" ");

export default function Home() {
  return (
    <>
      <HomeMotion />

      <div id="hero-wrap" className="hero-wrap">
        <section className="hero" aria-label="Welcome to Kwirky">
          <span className="flood" aria-hidden="true" />
          <Wordmark className="hero-word" label="Kwirky" />
          <CanImage colorway="orange" eager className="can-fallback hero-fallback" />
          <div className="hero-copy">
            <h1>POP OPEN YOUR QUIRKY SIDE.</h1>
            <div className="hero-side">
              <p>Meet Kwirky. A refreshingly different take on soda.</p>
              <div className="row">
                <a href="#products" className="btn">EXPLORE THE FIZZ</a>
                <a href="#intro" className="btn btn-ghost">DISCOVER KWIRKY</a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="intro" className="intro">
        <div className="intro-stage">
          <div className="wrap">
            <h2 className="display-xl">
              {intro.map((w) => <span key={w} className="scrub-word">{w} </span>)}
            </h2>
            <p className="lede">Kwirky is a soda-based probiotic beverage with a personality of its own: playful, a little odd and very sure of itself.</p>
          </div>
        </div>
      </section>

      <section id="difference" className="difference">
        <div className="wrap diff-layout">
          <div className="diff-spacer" aria-hidden="true" />
          <div>
            <h2 className="display-l">THE KWIRKY DIFFERENCE</h2>
            <Difference />
          </div>
        </div>
      </section>

      <section id="products" className="showcase" aria-label="Products">
        <div className="show-stage">
          <div className="show-track">
            {products.map((p) => (
              <article key={p.slug} className={`show-panel panel-${p.colorway}`}>
                <div className="show-left">
                  <h2 className="display-l">{p.name}</h2>
                  <p>{p.description}</p>
                </div>
                <CanImage colorway={p.colorway} className="show-img" alt={`${p.name} design`} />
                <div className="show-right">
                  {!p.confirmed && <Sticker>Sample design, not a real flavour yet</Sticker>}
                  <dl>
                    <div><dt>Flavour</dt><dd>{p.flavour ?? "To be confirmed"}</dd></div>
                    <div><dt>Ingredients</dt><dd>{p.ingredients ?? "To be confirmed"}</dd></div>
                    <div><dt>Price</dt><dd>{formatPrice(p.pricePaise)}</dd></div>
                  </dl>
                  <Link href={`/products/${p.slug}`} className="btn">Shop now<span className="sr"> for {p.name}</span></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="quiz" className="quiz-section"><div className="wrap"><Quiz /></div></section>

      <section id="story" className="story">
        <div className="story-stage">
          <span className="story-disc d1" aria-hidden="true" />
          <span className="story-disc d2" aria-hidden="true" />
          <span className="story-disc d3" aria-hidden="true" />
          <h2 className="story-type">
            <span className="story-a">A LITTLE DIFFERENT.</span>
            <span className="story-b">A LOT MORE KWIRKY.</span>
          </h2>
          <CanImage colorway="orange" className="can-fallback story-fallback" />
          <div className="story-note">
            <p>Playful but sophisticated. Quirky but premium. That's the idea behind every can.</p>
            <Sticker>Founder story to be added</Sticker>
          </div>
        </div>
      </section>

      <section id="love" className="love">
        <div className="wrap">
          <h2 className="display-l">WHY PEOPLE LOVE KWIRKY</h2>
          <Testimonials />
        </div>
      </section>

      <section id="community" className="community">
        <div className="wrap">
          <div className="community-head">
            <h2 className="display-l">STAY A LITTLE KWIRKY.</h2>
            <div>
              <p className="lede">Show us how you crack yours open. The best moments from the community will live here.</p>
              {site.social.instagram
                ? <a className="btn" href={site.social.instagram} target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
                : <a className="btn" href={whatsappLink("Hi Kwirky! I'd like to hear when you launch on Instagram.")} target="_blank" rel="noopener noreferrer">Join us on WhatsApp</a>}
            </div>
          </div>
          <div className="gallery">
            {(["lime", "plum", "orange", "coral"] as const).map((c, i) => (
              <figure key={c} className={`tile tile-${i}`}><CanImage colorway={c} /></figure>
            ))}
            <figure className="tile tile-4"><Sticker>Community photos go here</Sticker></figure>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="wrap split">
          <h2 className="display-l">GOOD QUESTIONS</h2>
          <Faq />
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="wrap split">
          <div>
            <h2 className="display-l">SAY HELLO</h2>
            <p className="lede">Stockists, collaborations or a simple hello are all welcome.</p>
            <p className="contact-links">
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a href={whatsappLink("Hi Kwirky!")} target="_blank" rel="noopener noreferrer">WhatsApp {site.whatsappDisplay}</a>
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
