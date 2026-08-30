export interface Certification {
  id: string;
  title: string;
  issuer: string;
  /** Human-readable issue date, optionally with an expiry. */
  date: string;
  credentialId?: string;
  url?: string;
  skills?: string[];
}

export const CERTIFICATIONS: Certification[] = [
  {
    id: "cert-anthropic-claude-api",
    title: "Claude with the Anthropic API",
    issuer: "Anthropic",
    date: "Aug 2026",
    url: "/anthropic-claude-api-certificate.pdf",
    skills: [
      "Anthropic API",
      "Claude",
      "Prompt Engineering",
      "Tool Use",
      "LLM Integration",
      "RAG",
    ],
  },
  {
    id: "cert-quadrant",
    title: "Quadrant Internship Program",
    issuer: "Quadrant Technologies",
    date: "Jul 2026",
    skills: ["Terraform", "Azure DevOps", "RAG", "Document Intelligence"],
  },
  {
    id: "cert-ml-foundations",
    title: "Machine Learning with Python: Foundations",
    issuer: "LinkedIn Learning",
    date: "Nov 2025",
    credentialId:
      "3b57b085816bc25259be209c0f936bcdb16f3c3cdad309ce3265982e69902083",
    skills: ["Machine Learning", "Artificial Intelligence"],
  },
  {
    id: "cert-python-ds-ml",
    title: "Python for Data Science and Machine Learning — Essential Training, Part 1",
    issuer: "LinkedIn Learning",
    date: "Nov 2025",
    skills: ["Machine Learning", "Python"],
  },
  {
    id: "cert-google-gemini",
    title: "Google Gemini",
    issuer: "Google",
    date: "Nov 2025 · Expires Nov 2028",
  },
  {
    id: "cert-mern-ethnus",
    title: "MERN Full-Stack Internship Program",
    issuer: "ETHNUS",
    date: "Dec 2023",
    credentialId: "7QXCB6CH",
    skills: ["JavaScript", "React", "HTML", "CSS"],
  },
  {
    id: "cert-gcp-foundations",
    title: "Google Cloud Computing Foundations Program",
    issuer: "Google",
    date: "Dec 2023",
  },
];
