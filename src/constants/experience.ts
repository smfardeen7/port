import type { IconType } from "react-icons";
import {
  SiExpress,
  SiFastapi,
  SiJavascript,
  SiMongodb,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiStripe,
} from "react-icons/si";

export interface TechItem { id: string; icon: IconType; name: string; }
export interface Position { title: string; duration: string; content?: { text: string; link?: string; tech?: TechItem[] }[]; }
export interface Experience { organisation: string; badge?: string; logo?: string; link: string; positions: Position[]; }

export const EXPERIENCES: Experience[] = [
  {
    organisation: "Ethnus Codemithra",
    link: "https://ethnus.com/",
    positions: [{ title: "Full-Stack Developer Intern", duration: "Aug 2023 — Nov 2023", content: [
      { text: "Engineered a full-stack scheduling platform on the MERN stack, integrating the Google Calendar and Stripe APIs to automate appointment booking and payment processing.", tech: [
        { id: "ec-1", icon: SiReact, name: "React" }, { id: "ec-2", icon: SiNodedotjs, name: "Node.js" }, { id: "ec-3", icon: SiExpress, name: "Express" }, { id: "ec-4", icon: SiMongodb, name: "MongoDB" }, { id: "ec-5", icon: SiStripe, name: "Stripe API" },
      ] },
      { text: "Reached 80% unit-test coverage with Jest and Mocha, and cut missed appointments by 45% through an automated reminder system and real-time calendar sync." },
    ] }],
  },
  {
    organisation: "IEEE Computer Society",
    badge: "IEEE",
    link: "https://www.computer.org/",
    positions: [{ title: "Events Head", duration: "Mar 2022 — Dec 2024", content: [
      { text: "Led large-scale technical events and hackathons with participation exceeding 700 students." },
    ] }],
  },
  {
    organisation: "Pratham USA",
    link: "https://www.prathamusa.org/",
    positions: [{ title: "Event Coordinator (Volunteer) · Washington, DC", duration: "Nov 2025 — Dec 2025", content: [
      { text: "Coordinated the annual fundraising gala for 350+ attendees, managing vendor relationships, logistics, and stakeholder communications." },
      { text: "Led cross-functional coordination and project management in a high-stakes nonprofit environment supporting education for underprivileged children." },
    ] }],
  },
  {
    organisation: "Quadrant Technologies",
    link: "https://www.quadranttechnologies.com/",
    positions: [{ title: "Cloud AI Summer Intern · United States (Hybrid)", duration: "Jul 2026 — Aug 2026", content: [
      { text: "Developed an explainable candidate-ranking system using semantic search and LLMs, with adjustable scoring weights and a transparent blind-review workflow.", tech: [
        { id: "qt-1", icon: SiPython, name: "Python" }, { id: "qt-2", icon: SiReact, name: "React" }, { id: "qt-3", icon: SiFastapi, name: "FastAPI" },
      ] },
      { text: "Built a screening assistant with React, FastAPI, Azure AI Document Intelligence, and Azure OpenAI to automate resume parsing and reduce manual screening time." },
    ] }],
  },
];
