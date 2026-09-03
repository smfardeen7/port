import { motion } from "framer-motion";
import CareerMap from "./game/CareerMap";

export default function Experience() {
  return (
    <section id="experience" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <span className="eyebrow">experience</span>
        <h2 className="section-title">Career Road</h2>
        <p className="section-subtitle">
          Roles, teams, and what I shipped. Scroll and the runner follows.
        </p>
      </motion.div>

      <CareerMap />
    </section>
  );
}
