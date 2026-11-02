import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";
export const metadata: Metadata = { title: "Quiz", description: "What's your Kwirky vibe? Find the fizz that matches your personality." };
export default function Page() {
  return <section className="quiz-section quiz-page"><div className="wrap"><Quiz headingLevel={1} /></div></section>;
}
