export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: string;
  url?: string;
  description: string;
}

export const PUBLICATIONS: Publication[] = [
  {
    id: "pub-parkinsons-fog",
    title: "A Hybrid Algorithm to Predict Parkinson's Disease Using Freezing of Gait",
    venue: "Lecture Notes in Electrical Engineering · Springer Nature",
    year: "2024",
    description:
      "A hybrid Random Forest and SVM model that analyzes Freezing-of-Gait events to flag early-stage Parkinson's Disease, reaching 88.7% accuracy on the UCI dataset — a 6–8% improvement over the individual models.",
  },
];
