import type { IconType } from "react-icons";
import { AiFillGithub } from "react-icons/ai";
import {
  SiAnthropic, SiApacheairflow, SiBootstrap, SiC, SiClaude, SiCplusplus, SiCss3, SiDocker, SiExpress,
  SiFastapi, SiFirebase, SiFlask, SiFlutter, SiGit, SiGithubactions,
  SiGooglecloud, SiGraphql, SiHtml5, SiIntellijidea, SiJavascript, SiJenkins,
  SiJest, SiJquery, SiJupyter, SiKubernetes, SiLinux, SiMysql, SiNetlify,
  SiNumpy, SiOpenjdk, SiPandas, SiPostman, SiPytorch, SiPython, SiR, SiReact,
  SiRedux, SiScikitlearn, SiSpringboot, SiStreamlit, SiTailwindcss,
  SiTensorflow, SiTerraform, SiTypescript, SiVite,
} from "react-icons/si";
import { VscAzure, VscCode } from "react-icons/vsc";
import { FaAws, FaTerminal } from "react-icons/fa6";

export interface Skill { id: string; icon: IconType; name: string; }
export interface SkillGroup { title: string; items: Skill[]; }

export const SKILLS_LIST: SkillGroup[] = [
  { title: "Programming Languages", items: [
    { id: "pl-1", icon: SiPython, name: "Python" }, { id: "pl-2", icon: SiJavascript, name: "JavaScript" },
    { id: "pl-3", icon: SiTypescript, name: "TypeScript" }, { id: "pl-4", icon: SiOpenjdk, name: "Java" },
    { id: "pl-5", icon: SiCplusplus, name: "C++" }, { id: "pl-11", icon: SiC, name: "C" },
    { id: "pl-6", icon: SiMysql, name: "SQL" }, { id: "pl-7", icon: SiR, name: "R" },
    { id: "pl-8", icon: FaTerminal, name: "Bash" },
    { id: "pl-9", icon: SiHtml5, name: "HTML" }, { id: "pl-10", icon: SiCss3, name: "CSS" },
  ] },
  { title: "AI & Machine Learning", items: [
    { id: "ai-7", icon: SiAnthropic, name: "Anthropic API" }, { id: "ai-8", icon: SiClaude, name: "Claude" },
    { id: "ai-1", icon: SiTensorflow, name: "TensorFlow" }, { id: "ai-2", icon: SiPytorch, name: "PyTorch" },
    { id: "ai-3", icon: SiScikitlearn, name: "Scikit-learn" }, { id: "ai-4", icon: SiPandas, name: "Pandas" },
    { id: "ai-5", icon: SiNumpy, name: "NumPy" }, { id: "ai-6", icon: SiJupyter, name: "Jupyter" },
  ] },
  { title: "Frameworks, Libraries & Data", items: [
    { id: "wd-1", icon: SiReact, name: "React" }, { id: "wd-2", icon: SiFastapi, name: "FastAPI" },
    { id: "wd-3", icon: SiFlask, name: "Flask" }, { id: "wd-4", icon: SiStreamlit, name: "Streamlit" },
    { id: "wd-5", icon: SiMysql, name: "MySQL" }, { id: "wd-6", icon: SiApacheairflow, name: "Airflow" },
    { id: "wd-7", icon: SiRedux, name: "Redux" }, { id: "wd-8", icon: SiBootstrap, name: "Bootstrap" },
    { id: "wd-9", icon: SiTailwindcss, name: "Tailwind CSS" }, { id: "wd-10", icon: SiJquery, name: "jQuery" },
    { id: "wd-11", icon: SiExpress, name: "Express" }, { id: "wd-12", icon: SiGraphql, name: "GraphQL" },
    { id: "wd-13", icon: SiFlutter, name: "Flutter" }, { id: "wd-14", icon: SiSpringboot, name: "Spring Boot" },
    { id: "wd-15", icon: SiFirebase, name: "Firebase" },
  ] },
  { title: "Tools & Platforms", items: [
    { id: "tp-1", icon: SiGit, name: "Git" }, { id: "tp-2", icon: AiFillGithub, name: "GitHub" },
    { id: "tp-3", icon: VscCode, name: "VS Code" }, { id: "tp-4", icon: SiLinux, name: "Linux" },
    { id: "tp-5", icon: SiDocker, name: "Docker" }, { id: "tp-6", icon: SiGithubactions, name: "GitHub Actions" },
    { id: "tp-7", icon: SiPostman, name: "Postman" }, { id: "tp-8", icon: SiJest, name: "Jest" },
    { id: "tp-9", icon: VscAzure, name: "Microsoft Azure" }, { id: "tp-10", icon: SiGooglecloud, name: "Google Cloud" },
    { id: "tp-16", icon: FaAws, name: "AWS" }, { id: "tp-11", icon: SiPython, name: "Azure OpenAI" },
    { id: "tp-17", icon: SiTerraform, name: "Terraform" }, { id: "tp-18", icon: SiJenkins, name: "Jenkins" },
    { id: "tp-12", icon: SiNetlify, name: "Netlify" }, { id: "tp-13", icon: SiVite, name: "Vite" },
    { id: "tp-14", icon: SiIntellijidea, name: "IntelliJ IDEA" }, { id: "tp-15", icon: SiKubernetes, name: "Kubernetes" },
  ] },
];
