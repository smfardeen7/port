import type { IconType } from "react-icons";
import {
  SiApacheairflow, SiDocker, SiFastapi, SiFirebase, SiFlask, SiGooglecloud,
  SiJavascript, SiJenkins, SiKubernetes, SiMysql, SiNodedotjs, SiPytorch,
  SiPython, SiReact, SiScikitlearn, SiStreamlit, SiTensorflow,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";

export interface TechIcon { id: string; icon: IconType; name: string; }
export interface Project { id: string; title: string; github: string; link?: string; image?: string; content: string; stack: TechIcon[]; }
const github = "https://github.com/smfardeen7";

export const PROJECTS: Project[] = [
  { id: "invoice-intelligence", title: "AI Contract Invoice Intelligence", github, content: "Scalable NLP pipelines that extract and enrich data from 150,000+ unstructured invoices annually at 98% accuracy, with Airflow orchestration and automated validation.", stack: [
    { id: "ii-1", icon: SiPython, name: "Python" }, { id: "ii-2", icon: SiTensorflow, name: "TensorFlow" }, { id: "ii-3", icon: SiApacheairflow, name: "Airflow" },
  ] },
  { id: "recommendations", title: "Personalized Recommendation System", github, content: "Multi-model recommendation platform using matrix factorization, KMeans, RFM segmentation, a FastAPI backend, and an interactive React dashboard.", stack: [
    { id: "rec-1", icon: SiPython, name: "Python" }, { id: "rec-2", icon: SiFastapi, name: "FastAPI" }, { id: "rec-3", icon: SiReact, name: "React" }, { id: "rec-4", icon: SiScikitlearn, name: "Scikit-learn" },
  ] },
  { id: "loan-default", title: "Loan Default Prediction", github: "https://github.com/smfardeen7/cooperative-bank-loan-default", content: "Explainable lending-risk application combining PyTorch neural networks and XGBoost with SHAP/LIME explanations and an audit-friendly Streamlit interface.", stack: [
    { id: "loan-1", icon: SiPytorch, name: "PyTorch" }, { id: "loan-2", icon: SiPython, name: "XGBoost" }, { id: "loan-3", icon: SiStreamlit, name: "Streamlit" },
  ] },
  { id: "autism-detection", title: "Autism Detection", github, content: "CNN/LSTM screening system achieving 91% accuracy on 1,500+ labeled samples, supported by a Flask and MySQL inference backend.", stack: [
    { id: "aut-1", icon: SiTensorflow, name: "TensorFlow" }, { id: "aut-2", icon: SiFlask, name: "Flask" }, { id: "aut-3", icon: SiMysql, name: "MySQL" },
  ] },
  { id: "parkinsons", title: "Parkinson's Prediction Research", github, content: "Hybrid Random Forest and SVM model reaching 88.7% accuracy on the UCI Parkinson's dataset; presented at Springer 2024.", stack: [
    { id: "par-1", icon: SiPython, name: "Python" }, { id: "par-2", icon: SiScikitlearn, name: "Scikit-learn" }, { id: "par-3", icon: SiMysql, name: "SQL" },
  ] },
  { id: "blood-bank", title: "Blood Bank Management System", github, content: "Full-stack donor-registration and blood-inventory platform on Google Cloud Platform, with real-time availability search, request tracking, and Cloud Storage document handling; query tuning cut latency 40%.", stack: [
    { id: "bb-1", icon: SiReact, name: "React" }, { id: "bb-2", icon: SiFastapi, name: "FastAPI" }, { id: "bb-3", icon: SiMysql, name: "MySQL" }, { id: "bb-4", icon: SiGooglecloud, name: "GCP" },
  ] },
  { id: "cicd-k8s", title: "CI/CD Pipeline — Kubernetes on AWS", github, content: "Containerized a web app with Docker and deployed it to a Kubernetes cluster via Rancher on AWS EC2, with a Jenkins build-test-deploy pipeline triggered by GitHub webhooks.", stack: [
    { id: "cd-1", icon: SiDocker, name: "Docker" }, { id: "cd-2", icon: SiKubernetes, name: "Kubernetes" }, { id: "cd-3", icon: SiJenkins, name: "Jenkins" }, { id: "cd-4", icon: FaAws, name: "AWS" },
  ] },
  { id: "infant-cry", title: "Infant Cry Analysis", github, content: "ML pipeline that classifies infant cries at 82% accuracy using Librosa audio-feature extraction and a Random Forest model, served from a Flask and MySQL backend.", stack: [
    { id: "ic-1", icon: SiPython, name: "Python" }, { id: "ic-2", icon: SiScikitlearn, name: "Scikit-learn" }, { id: "ic-3", icon: SiFlask, name: "Flask" },
  ] },
  { id: "fxair", title: "FXAir — Cross-Border Money Transfer", github: "https://github.com/smfardeen7/fxair", content: "A fintech platform for international transfers: MERN stack, Firebase Auth with Google/Apple/Facebook SSO, Python ML for fraud detection and FX-rate prediction, automated KYC, a live fee calculator, and a JWT-secured API.", stack: [
    { id: "fx-1", icon: SiReact, name: "React" }, { id: "fx-2", icon: SiNodedotjs, name: "Node.js" }, { id: "fx-3", icon: SiFirebase, name: "Firebase" }, { id: "fx-4", icon: SiPython, name: "Python" },
  ] },
  { id: "mazepay", title: "MazePay", github: "https://github.com/smfardeen7/mazepy", content: "A full-stack MERN payment application designed around a clear, responsive user experience.", stack: [
    { id: "maze-1", icon: SiJavascript, name: "JavaScript" }, { id: "maze-2", icon: SiReact, name: "React" },
  ] },
  { id: "ai-sql-writer", title: "AI SQL Writer", github: "https://github.com/smfardeen7/AI-SQL-writer", content: "An AI-assisted tool that translates natural-language questions into useful SQL queries.", stack: [
    { id: "sql-1", icon: SiPython, name: "Python" }, { id: "sql-2", icon: SiMysql, name: "SQL" },
  ] },
];
