export interface Education {
  id: string;
  title: string;
  degree: string;
  duration: string;
  location: string;
  content1: string;
  content2: string;
}

export const EDUCATION_LIST: Education[] = [
  { id: "education-1", title: "George Mason University", degree: "M.S. Computer Science", duration: "Aug 2025 — May 2027", location: "Fairfax, Virginia", content1: "Artificial Intelligence & Algorithms", content2: "Software Engineering & Systems" },
  { id: "education-2", title: "Vellore Institute of Technology", degree: "B.Tech. Computer Science and Engineering", duration: "Sep 2021 — May 2025", location: "Vellore, India", content1: "Data Structures & Algorithms", content2: "AI, Machine Learning & Databases" },
];
