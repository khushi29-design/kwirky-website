import Link from "next/link";
import { PageHero } from "@/components/Bits";
export default function NotFound() {
  return <PageHero title="THIS PAGE WENT FLAT" intro="The link may be old or mistyped. Head back and try again." tone="coral"><div className="row spaced"><Link href="/" className="btn">Go to the homepage</Link><Link href="/products" className="btn btn-ghost">See the cans</Link></div></PageHero>;
}
