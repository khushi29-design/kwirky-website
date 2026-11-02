"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProduct } from "@/content/products";
import { questions, scoreQuiz, type PersonaId } from "@/content/quiz";
import { CanImage } from "./Bits";

const glyphs = ["M12 3l2.6 5.8L21 9.6l-4.7 4.3 1.3 6.3L12 17l-5.6 3.2 1.3-6.3L3 9.6l6.4-.8Z", "M12 21c5 0 8-3.6 8-8 0-5-4-9-8-10-4 1-8 5-8 10 0 4.4 3 8 8 8Z", "M3 18c3-5 5-7 9-7s6 2 9 7M8 7a2 2 0 1 0 0 .1M16 6a2 2 0 1 0 0 .1", "M12 3v18M3 12h18M6 6l12 12M18 6 6 18"];

export function Quiz({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(questions.map(() => null));
  const [dir, setDir] = useState<"next" | "back">("next");
  const [copied, setCopied] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const done = step === questions.length;
  const Heading = headingLevel === 1 ? "h1" : "h2";

  useEffect(() => {
    if (mounted.current) panel.current?.focus({ preventScroll: true });
    mounted.current = true;
  }, [step]);

  const go = (to: number) => {
    setDir(to > step ? "next" : "back");
    setStep(to);
    setCopied(false);
  };
  const restart = () => {
    setPicks(questions.map(() => null));
    go(0);
    setDir("next");
  };

  const q = questions[step];
  const result = done
    ? scoreQuiz(picks.map((p, i) => questions[i].answers[p!].persona) as PersonaId[])
    : null;
  const match = result?.productSlug ? getProduct(result.productSlug) : null;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`I'm ${result!.name} on the Kwirky quiz. What's your vibe? ${window.location.origin}/quiz`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="quiz" id="quiz-card">
      <div className="quiz-head">
        <Heading className="display-m">WHAT'S YOUR KWIRKY VIBE?</Heading>
        <p className="lede">Let's find the fizz that matches your personality.</p>
      </div>
      <div className="quiz-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={step}>
        {questions.map((_, i) => <span key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />)}
      </div>
      <div key={step} ref={panel} tabIndex={-1} className={`quiz-panel enter-${dir}`}>
        {!done && (
          <fieldset>
            <legend><span className="quiz-count">Question {step + 1} of {questions.length}</span>{q.title}</legend>
            <div className="quiz-answers">
              {q.answers.map((a, i) => (
                <label key={a.label} className={`answer answer-${i} ${picks[step] === i ? "is-picked" : ""}`}>
                  <input type="radio" name={q.id} checked={picks[step] === i} onChange={() => setPicks(picks.map((p, s) => (s === step ? i : p)))} />
                  <svg className="answer-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={glyphs[i]} /></svg>
                  <span>{a.label}</span>
                </label>
              ))}
            </div>
            <div className="quiz-nav">
              <button type="button" className="btn btn-ghost" disabled={step === 0} onClick={() => go(step - 1)}>Back</button>
              <button type="button" className="btn btn-lime" disabled={picks[step] === null} onClick={() => go(step + 1)}>
                {step === questions.length - 1 ? "See my result" : "Next"}
              </button>
            </div>
          </fieldset>
        )}
        {done && result && (
          <div className={`quiz-result can-${result.colorway}`} aria-live="polite">
            <div className="quiz-result-can" aria-hidden="true"><CanImage colorway={result.colorway} eager /></div>
            <div>
              <p className="quiz-count">You are</p>
              <h3 className="display-m">{result.name}</h3>
              <p className="lede">{result.line}</p>
              {match ? (
                <p>Your match: <Link href={`/products/${match.slug}`}>{match.name}</Link></p>
              ) : (
                <p className="quiz-note">Your matching flavour will appear here once the range is confirmed.</p>
              )}
              <div className="row">
                <button className="btn btn-lime" onClick={restart}>Restart quiz</button>
                <Link className="btn btn-ghost" href="/products">See the cans</Link>
                <button className="btn btn-ghost" onClick={share}>{copied ? "Link copied" : "Copy my result"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
