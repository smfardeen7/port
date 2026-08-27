import { motion } from "framer-motion";
import { BookOpen, GraduationCap, MapPin } from "lucide-react";
import { EDUCATION_LIST } from "@/constants";

export default function Education() {
  return (
    <section id="education" className="section-container">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
        <h2 className="section-title">Education</h2>
        <p className="section-subtitle">Academic background</p>
      </motion.div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {EDUCATION_LIST.map((edu, index) => (
          <motion.article key={edu.id} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: index * 0.12 }} className="glass-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10"><GraduationCap className="h-6 w-6 text-accent" /></div>
              <div><h3 className="text-lg font-bold">{edu.title}</h3><p className="mt-1 text-sm font-medium text-accent">{edu.degree}</p></div>
            </div>
            <div className="mt-5 space-y-2">
              {[edu.content1, edu.content2].map((content) => <div key={content} className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2.5"><BookOpen className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{content}</span></div>)}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{edu.location}</span><span>{edu.duration}</span></div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
