/**
 * The Journey: Fardeen's story as six game chapters, told in first person.
 * Every fact here also appears elsewhere on the site (experience, education,
 * publications, certifications); the narration only adds the voice.
 */
export interface Chapter {
  id: string;
  number: number;
  title: string;
  /** Where and when, shown as the chapter's subtitle. */
  setting: string;
  /** First-person narration, typed out in the dialogue box. */
  text: string;
  /** Stats the chapter "grants", shown as pills. */
  gains: string[];
  /** Optional in-page link at the end of the chapter. */
  link?: { label: string; href: string };
}

export const CHAPTERS: Chapter[] = [
  {
    id: "spark",
    number: 1,
    title: "The Spark",
    setting: "India, growing up",
    text:
      "I was the kid who wanted to know what happened inside the computer, not just on the screen. Games first, then \"why does this work\", then the first small programs. Nobody around me called it a career. It was just the thing I couldn't stop poking at.",
    gains: ["Curiosity"],
  },
  {
    id: "vellore",
    number: 2,
    title: "Vellore",
    setting: "VIT Vellore, B.Tech in Computer Science, 2021 to 2025",
    text:
      "Computer Science at VIT turned the poking into a discipline: data structures, algorithms, databases, and my first real machine-learning models. A research idea became a published paper on detecting Parkinson's disease from freezing-of-gait, presented at Springer in 2024. That was the first time something I built mattered outside my own laptop.",
    gains: ["Algorithms", "Machine Learning", "Research"],
  },
  {
    id: "first-quests",
    number: 3,
    title: "First Quests",
    setting: "Ethnus Codemithra internship and IEEE Computer Society, 2022 to 2024",
    text:
      "My first internship was in India, at Ethnus Codemithra: a full-stack scheduling platform on the MERN stack with Google Calendar and Stripe wired in, tested to 80% coverage. It wasn't easy and it wasn't glamorous, and I'm proud of it. At the same time I was Events Head for the IEEE Computer Society chapter, running hackathons and technical events for more than 700 students. Shipping software and organizing people turned out to be the same skill in different clothes.",
    gains: ["Full-Stack", "Leadership"],
  },
  {
    id: "crossing",
    number: 4,
    title: "Crossing Over",
    setting: "George Mason University, Virginia, from August 2025",
    text:
      "In August 2025 I moved to the United States for an M.S. in Computer Science at George Mason. New country, new systems, no safety net, and honestly, it was hard. I filled the gaps the only way I knew: by building. Projects, cloud and MLOps skills, and volunteering to coordinate a 350-guest fundraising gala for Pratham USA so I'd stop living inside my own head. Somewhere in there, \"struggling\" quietly became \"learning\".",
    gains: ["Resilience", "Cloud", "Community"],
  },
  {
    id: "quadrant",
    number: 5,
    title: "Quadrant",
    setting: "Quadrant Technologies, Cloud AI Summer Intern, summer 2026",
    text:
      "Summer 2026: a Cloud AI internship at Quadrant Technologies. I built an explainable candidate-ranking system with semantic search and LLMs, with adjustable scoring weights and a blind-review workflow, and a screening assistant on React, FastAPI, Azure AI Document Intelligence, and Azure OpenAI. Real users, real deadlines, real feedback. The best kind.",
    gains: ["LLMs", "Azure", "Explainable AI"],
  },
  {
    id: "now",
    number: 6,
    title: "Now",
    setting: "Fairfax, Virginia, today",
    text:
      "Today I build AI systems that can explain themselves, and the software around them. I'm finishing my M.S., and I'm ready for the team where the next chapter happens. If you're reading this, you might be it.",
    gains: ["Ready"],
    link: { label: "Say hello", href: "#contact" },
  },
];

export const CHAPTER_TOTAL = CHAPTERS.length;
