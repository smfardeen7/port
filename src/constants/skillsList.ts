import type { IconType } from "react-icons";
import { AiFillGithub } from "react-icons/ai";
import {
  SiApacheairflow, SiCplusplus, SiCss3, SiDocker, SiFastapi,
  SiFlask, SiGit, SiGithubactions, SiGooglecloud, SiHtml5, SiJavascript,
  SiJest, SiJupyter, SiLinux, SiMysql, SiNumpy,
  SiOpenjdk, SiPandas, SiPostman, SiPytorch, SiPython, SiR, SiReact,
  SiScikitlearn, SiStreamlit, SiTensorflow, SiTypescript,
} from "react-icons/si";
import { VscAzure, VscCode } from "react-icons/vsc";
import { FaTerminal } from "react-icons/fa6";

export interface Skill { id: string; icon: IconType; name: string; }
export interface SkillGroup { title: string; items: Skill[]; }

export const SKILLS_LIST: SkillGroup[] = [
  { title: "Programming Languages", items: [
    { id: "pl-1", icon: SiPython, name: "Python" }, { id: "pl-2", icon: SiJavascript, name: "JavaScript" },
    { id: "pl-3", icon: SiTypescript, name: "TypeScript" }, { id: "pl-4", icon: SiOpenjdk, name: "Java" },
    { id: "pl-5", icon: SiCplusplus, name: "C++" }, { id: "pl-6", icon: SiMysql, name: "SQL" },
    { id: "pl-7", icon: SiR, name: "R" }, { id: "pl-8", icon: FaTerminal, name: "Bash" },
    { id: "pl-9", icon: SiHtml5, name: "HTML" }, { id: "pl-10", icon: SiCss3, name: "CSS" },
  ] },
  { title: "AI & Machine Learning", items: [
    { id: "ai-1", icon: SiTensorflow, name: "TensorFlow" }, { id: "ai-2", icon: SiPytorch, name: "PyTorch" },
    { id: "ai-3", icon: SiScikitlearn, name: "Scikit-learn" }, { id: "ai-4", icon: SiPandas, name: "Pandas" },
    { id: "ai-5", icon: SiNumpy, name: "NumPy" }, { id: "ai-6", icon: SiJupyter, name: "Jupyter" },
  ] },
  { title: "Web & Data", items: [
    { id: "wd-1", icon: SiReact, name: "React" }, { id: "wd-2", icon: SiFastapi, name: "FastAPI" },
    { id: "wd-3", icon: SiFlask, name: "Flask" }, { id: "wd-4", icon: SiStreamlit, name: "Streamlit" },
    { id: "wd-5", icon: SiMysql, name: "MySQL" }, { id: "wd-6", icon: SiApacheairflow, name: "Airflow" },
  ] },
  { title: "Tools & Platforms", items: [
    { id: "tp-1", icon: SiGit, name: "Git" }, { id: "tp-2", icon: AiFillGithub, name: "GitHub" },
    { id: "tp-3", icon: VscCode, name: "VS Code" }, { id: "tp-4", icon: SiLinux, name: "Linux" },
    { id: "tp-5", icon: SiDocker, name: "Docker" }, { id: "tp-6", icon: SiGithubactions, name: "GitHub Actions" },
    { id: "tp-7", icon: SiPostman, name: "Postman" }, { id: "tp-8", icon: SiJest, name: "Jest" },
    { id: "tp-9", icon: VscAzure, name: "Microsoft Azure" }, { id: "tp-10", icon: SiGooglecloud, name: "Google Cloud" },
    { id: "tp-11", icon: SiPython, name: "Azure OpenAI" },
  ] },
];
