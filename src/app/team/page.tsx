import type { Metadata } from "next";
import { CanImage, PageHero, Sticker } from "@/components/Bits";
import { team } from "@/content/people";
export const metadata: Metadata = { title: "Team", description: "The people behind Kwirky." };
const slots = ["orange", "lime", "coral"] as const;
export default function Page() {
  return (
    <>
      <PageHero title="THE PEOPLE BEHIND THE FIZZ" tone="coral" />
      <section className="section tone-cream">
        <div className="wrap team">
          {team.length
            ? team.map((m) => <figure key={m.name} className="member">{/* eslint-disable-next-line @next/next/no-img-element */}{m.photo && <img src={m.photo} alt={m.name} />}<figcaption><strong>{m.name}</strong><span>{m.role}</span></figcaption></figure>)
            : slots.map((c) => <figure key={c} className={`member member-${c}`}><CanImage colorway={c} /><figcaption><Sticker>Team profile to be added</Sticker></figcaption></figure>)}
        </div>
      </section>
    </>
  );
}
