import { motion, useScroll, useSpring } from "framer-motion";

/** Thin accent bar pinned to the top edge, tracking page scroll progress. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-accent"
      aria-hidden="true"
    />
  );
}
