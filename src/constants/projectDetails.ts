/**
 * Extra detail for the project modal, keyed by the Project id in projects.ts.
 * Everything here is a restatement of facts already shown on the card — no new
 * claims. `category` drives the filter chips in the Projects section.
 */

export type ProjectCategory = "AI & ML" | "Full-Stack" | "DevOps" | "Research";

export interface ProjectDetail {
  category: ProjectCategory;
  /** One or two sentences expanding on the card blurb. */
  summary: string;
  /** Short, scannable points — the "what mattered" list. */
  highlights: string[];
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  "invoice-intelligence": {
    category: "AI & ML",
    summary:
      "Production NLP pipelines that turn unstructured contract invoices into clean, validated records at scale.",
    highlights: [
      "Extracts and enriches data from 150,000+ invoices annually",
      "Holds 98% field-level accuracy on unstructured documents",
      "Orchestrated with Airflow, with automated validation gates",
    ],
  },
  recommendations: {
    category: "AI & ML",
    summary:
      "A multi-model recommendation platform pairing classic collaborative filtering with customer segmentation, served through an API and dashboard.",
    highlights: [
      "Matrix factorization, KMeans clustering, and RFM segmentation",
      "FastAPI backend serving ranked results",
      "Interactive React dashboard for exploring recommendations",
    ],
  },
  "loan-default": {
    category: "AI & ML",
    summary:
      "An explainable lending-risk tool that keeps every prediction auditable for reviewers.",
    highlights: [
      "PyTorch neural network combined with XGBoost",
      "SHAP and LIME explanations for each decision",
      "Audit-friendly Streamlit interface",
    ],
  },
  "autism-detection": {
    category: "AI & ML",
    summary:
      "A deep-learning screening system built on a labeled clinical dataset with a lightweight inference backend.",
    highlights: [
      "CNN/LSTM architecture at 91% accuracy",
      "Trained and evaluated on 1,500+ labeled samples",
      "Flask and MySQL inference backend",
    ],
  },
  parkinsons: {
    category: "Research",
    summary:
      "A hybrid classical-ML approach to early Parkinson's detection, published as a research contribution.",
    highlights: [
      "Random Forest + SVM ensemble at 88.7% accuracy",
      "Evaluated on the UCI Parkinson's dataset",
      "Presented at Springer 2024",
    ],
  },
  mazepay: {
    category: "Full-Stack",
    summary:
      "A full-stack MERN payments application designed around a clear, responsive flow.",
    highlights: [
      "MongoDB, Express, React, and Node stack",
      "Responsive, focused checkout experience",
    ],
  },
  "blood-bank": {
    category: "Full-Stack",
    summary:
      "A cloud-hosted system for blood donor registration and inventory, with search and request tracking in real time.",
    highlights: [
      "React, FastAPI, and MySQL, deployed on Google Cloud Platform",
      "Real-time availability search and request tracking",
      "Cloud Storage for documents; query tuning cut latency 40%",
    ],
  },
  "cicd-k8s": {
    category: "DevOps",
    summary:
      "An end-to-end delivery pipeline that takes a containerized app from commit to a running Kubernetes cluster.",
    highlights: [
      "Dockerized app on a Kubernetes cluster via Rancher on AWS EC2",
      "Jenkins build-test-deploy pipeline",
      "Triggered automatically by GitHub webhooks",
    ],
  },
  "infant-cry": {
    category: "AI & ML",
    summary:
      "An audio ML pipeline that classifies infant cries from their acoustic features.",
    highlights: [
      "82% accuracy with a Random Forest model",
      "Librosa for audio-feature extraction",
      "Flask and MySQL backend",
    ],
  },
  fxair: {
    category: "Full-Stack",
    summary:
      "A cross-border money-transfer platform combining a MERN product with Python ML services.",
    highlights: [
      "Firebase Auth with Google, Apple, and Facebook SSO",
      "Python ML for fraud detection and FX-rate prediction",
      "Automated KYC, a live fee calculator, and a JWT-secured API",
    ],
  },
  "ai-sql-writer": {
    category: "AI & ML",
    summary:
      "An AI-assisted tool that turns plain-language questions into working SQL queries.",
    highlights: [
      "Natural-language to SQL translation",
      "Aimed at making databases queryable without SQL fluency",
    ],
  },
};

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "AI & ML",
  "Full-Stack",
  "DevOps",
  "Research",
];
