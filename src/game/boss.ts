/**
 * Boss quiz rules. Pure; the question bank restates facts already shown on
 * the site so nothing here is a new claim.
 */
export interface BankQuestion {
  id: string;
  prompt: string;
  answer: string;
  distractors: [string, string, string];
}

export interface RoundQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
}

export interface BossState {
  /** Index of the next question to ask. */
  index: number;
  /** Questions in the round. */
  total: number;
  bossHp: number;
  hearts: number;
  status: "playing" | "won" | "lost";
}

export const MAX_HEARTS = 3;

export const QUESTION_BANK: BankQuestion[] = [
  {
    id: "ms",
    prompt: "Where is Fardeen pursuing his M.S. in Computer Science?",
    answer: "George Mason University",
    distractors: ["Virginia Tech", "University of Maryland", "Georgia Tech"],
  },
  {
    id: "intern",
    prompt: "Which company hosted Fardeen's Cloud AI Summer Internship?",
    answer: "Quadrant Technologies",
    distractors: ["Pratham USA", "Ethnus Codemithra", "IEEE Computer Society"],
  },
  {
    id: "autism",
    prompt: "What accuracy did the Autism Detection CNN/LSTM system reach?",
    answer: "91%",
    distractors: ["82%", "88.7%", "98%"],
  },
  {
    id: "springer",
    prompt: "Where was the Parkinson's Freezing-of-Gait research published?",
    answer: "Springer Nature (LNEE)",
    distractors: ["IEEE Access", "ACM Computing Surveys", "Nature Machine Intelligence"],
  },
  {
    id: "airflow",
    prompt: "Which orchestrator runs the Invoice Intelligence NLP pipelines?",
    answer: "Apache Airflow",
    distractors: ["Jenkins", "Kubernetes", "Terraform"],
  },
  {
    id: "invoices",
    prompt: "How many invoices a year does the Invoice Intelligence pipeline process?",
    answer: "150,000+",
    distractors: ["15,000+", "1,500+", "1.5 million+"],
  },
  {
    id: "k8s",
    prompt: "The CI/CD project ran its Kubernetes cluster on which cloud?",
    answer: "AWS",
    distractors: ["Google Cloud", "Azure", "DigitalOcean"],
  },
  {
    id: "xai",
    prompt: "Which explainability tools does the Loan Default app use?",
    answer: "SHAP and LIME",
    distractors: ["Grad-CAM and saliency maps", "Attention rollout", "Partial dependence only"],
  },
  {
    id: "ieee",
    prompt: "How many students took part in the IEEE events Fardeen led?",
    answer: "700+",
    distractors: ["70+", "350+", "7,000+"],
  },
  {
    id: "anthropic",
    prompt: "Which certification did Fardeen earn from Anthropic?",
    answer: "Claude with the Anthropic API",
    distractors: ["Prompt Engineering for Everyone", "Building with Gemini", "Azure AI Fundamentals"],
  },
  {
    id: "ethnus",
    prompt: "By how much did the automated reminder system at Ethnus cut missed appointments?",
    answer: "45%",
    distractors: ["15%", "25%", "80%"],
  },
  {
    id: "gala",
    prompt: "How many attendees did the Pratham USA gala Fardeen coordinated have?",
    answer: "350+",
    distractors: ["100+", "700+", "1,000+"],
  },
  {
    id: "fxair",
    prompt: "Which provider powers FXAir's Google / Apple / Facebook sign-in?",
    answer: "Firebase Auth",
    distractors: ["Auth0", "Okta", "AWS Cognito"],
  },
  {
    id: "btech",
    prompt: "Where did Fardeen complete his B.Tech?",
    answer: "Vellore Institute of Technology",
    distractors: ["IIT Madras", "BITS Pilani", "NIT Trichy"],
  },
];

/** Small seedable PRNG so rounds are reproducible in tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function createRound(rng: () => number, count = 5): RoundQuestion[] {
  return shuffle(QUESTION_BANK, rng)
    .slice(0, count)
    .map((q) => {
      const options = shuffle([q.answer, ...q.distractors], rng);
      return {
        id: q.id,
        prompt: q.prompt,
        options,
        answerIndex: options.indexOf(q.answer),
      };
    });
}

export function initialBoss(count: number): BossState {
  return { index: 0, total: count, bossHp: count, hearts: MAX_HEARTS, status: "playing" };
}

export function answer(s: BossState, correct: boolean): BossState {
  if (s.status !== "playing") return s;
  const bossHp = correct ? s.bossHp - 1 : s.bossHp;
  const hearts = correct ? s.hearts : s.hearts - 1;
  const index = s.index + 1;
  let status: BossState["status"] = "playing";
  if (bossHp <= 0) status = "won";
  else if (hearts <= 0 || index >= s.total) status = "lost";
  return { index, total: s.total, bossHp, hearts, status };
}
