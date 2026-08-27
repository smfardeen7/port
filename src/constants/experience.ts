import type { IconType } from "react-icons";
import { SiFastapi, SiJavascript, SiPostman, SiPython, SiReact } from "react-icons/si";

export interface TechItem { id: string; icon: IconType; name: string; }
export interface Position { title: string; duration: string; content?: { text: string; link?: string; tech?: TechItem[] }[]; }
export interface Experience { organisation: string; logo?: string; link: string; positions: Position[]; }

export const EXPERIENCES: Experience[] = [
  {
    organisation: "Quadrant Technologies",
    link: "https://www.quadranttechnologies.com/",
    positions: [{ title: "Cloud AI Intern · Redmond, WA", duration: "Jun 2026 — Aug 2026", content: [
      { text: "Developed an explainable candidate-ranking system using semantic search and LLMs, with adjustable scoring weights and a transparent blind-review workflow.", tech: [
        { id: "qt-1", icon: SiPython, name: "Python" }, { id: "qt-2", icon: SiReact, name: "React" }, { id: "qt-3", icon: SiFastapi, name: "FastAPI" },
      ] },
      { text: "Built a screening assistant with React, FastAPI, Azure AI Document Intelligence, and Azure OpenAI to automate resume parsing and reduce manual screening time." },
    ] }],
  },
  {
    organisation: "Ethnus Codemithra",
    link: "https://ethnus.com/",
    positions: [{ title: "Full-Stack Developer Intern", duration: "Aug 2023 — Nov 2023", content: [
      { text: "Refactored reusable React components and optimized state management, increasing user engagement by 15%; added automated tests and API monitoring to reach 80% test coverage.", tech: [
        { id: "ec-1", icon: SiJavascript, name: "JavaScript" }, { id: "ec-2", icon: SiReact, name: "React" }, { id: "ec-3", icon: SiPostman, name: "Postman" },
      ] },
    ] }],
  },
];
