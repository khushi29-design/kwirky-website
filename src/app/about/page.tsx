import Link from "next/link";
import type { Metadata } from "next";
import { CanImage, PageHero, Sticker } from "@/components/Bits";
export const metadata: Metadata = { title: "About", description: "Who Kwirky is and what the brand stands for." };

const traits = [
  ["Playful but sophisticated", "We like a joke. We also care how the can feels in your hand."],
  ["Quirky but premium", "Being odd is no excuse for being careless."],
  ["Energetic and refreshing", "Everything we make should leave you more awake than it found you."],
  ["Bold and memorable", "If you forget us by tomorrow, we've done it wrong."],
];

export default function About() {
  return (
    <>
      <PageHero title="A LITTLE DIFFERENT. A LOT MORE KWIRKY." intro="Kwirky is a soda-based probiotic beverage brand built around flavour and personality." />
      <section className="section tone-cream">
        <div className="wrap traits">
          {traits.map(([t, d]) => <div key={t} className="trait"><h2>{t}</h2><p>{d}</p></div>)}
        </div>
      </section>
      <section className="section tone-orange">
        <div className="wrap split split-center">
          <CanImage colorway="lime" className="about-can" />
          <div>
            <h2 className="display-m">The story so far</h2>
            <p className="lede">The real origin story belongs here, told in the founders' own words.</p>
            <Sticker>Brand story to be added</Sticker>
            <div className="row spaced"><Link className="btn btn-dark" href="/team">Meet the team</Link><Link className="btn btn-ghost" href="/products">See the cans</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
