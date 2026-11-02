import type { Colorway } from "@/lib/commerce/types";

export type PersonaId = "bold" | "sunshine" | "chill" | "wild";

export interface Persona {
  id: PersonaId;
  name: string;
  line: string;
  colorway: Colorway;
  /** Set to a product slug once flavours are confirmed. */
  productSlug: string | null;
}

export const personas: Record<PersonaId, Persona> = {
  bold: {
    id: "bold",
    name: "The Bold Explorer",
    line: "You take the unmarked trail, then tell everyone about it. Plans are more of a suggestion.",
    colorway: "orange",
    productSlug: null,
  },
  sunshine: {
    id: "sunshine",
    name: "The Sunshine Soul",
    line: "You walk in and the room gets warmer. You also know the best place for lunch, always.",
    colorway: "coral",
    productSlug: null,
  },
  chill: {
    id: "chill",
    name: "The Chill Creator",
    line: "Quiet on the outside, a hundred ideas on the inside. Your best work starts on the sofa.",
    colorway: "plum",
    productSlug: null,
  },
  wild: {
    id: "wild",
    name: "The Wild Card",
    line: "Nobody can guess your next move, including you. That is exactly how you like it.",
    colorway: "lime",
    productSlug: null,
  },
};

export const questions: { id: string; title: string; answers: { label: string; persona: PersonaId }[] }[] = [
  {
    id: "personality",
    title: "What describes your personality?",
    answers: [
      { label: "Bold and adventurous", persona: "bold" },
      { label: "Sweet and cheerful", persona: "sunshine" },
      { label: "Chill and relaxed", persona: "chill" },
      { label: "Curious and creative", persona: "wild" },
    ],
  },
  {
    id: "vibe",
    title: "What's your ideal vibe?",
    answers: [
      { label: "Beach and sunshine", persona: "sunshine" },
      { label: "Music and dancing", persona: "wild" },
      { label: "Mountains and adventures", persona: "bold" },
      { label: "Cozy and relaxing", persona: "chill" },
    ],
  },
  {
    id: "flavour",
    title: "Pick your flavour mood.",
    answers: [
      { label: "Fruity", persona: "sunshine" },
      { label: "Citrusy", persona: "bold" },
      { label: "Tangy", persona: "chill" },
      { label: "Something unexpected", persona: "wild" },
    ],
  },
  {
    id: "matters",
    title: "What matters most when choosing a drink?",
    answers: [
      { label: "Taste", persona: "sunshine" },
      { label: "Refreshment", persona: "bold" },
      { label: "Ingredients", persona: "chill" },
      { label: "Trying something different", persona: "wild" },
    ],
  },
];

/** Most-picked persona wins; a tie goes to whichever tied persona was picked last. */
export function scoreQuiz(picks: PersonaId[]): Persona {
  const tally: Partial<Record<PersonaId, number>> = {};
  picks.forEach((p) => (tally[p] = (tally[p] ?? 0) + 1));
  const top = Math.max(...Object.values(tally).map(Number));
  const winner = [...picks].reverse().find((p) => tally[p] === top)!;
  return personas[winner];
}
