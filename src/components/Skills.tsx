import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SKILLS_LIST } from "@/constants";
import { SKILL_TOTAL } from "@/game/data";
import { useGame } from "@/game/store";
import { sfx } from "@/game/sfx";
import SkillTree from "./game/SkillTree";

export default function Skills() {
  const unlocked = useGame((s) => s.skills.length);
  const unlockSkills = useGame((s) => s.unlockSkills);
  const allDone = unlocked >= SKILL_TOTAL;

  const unlockEverything = () => {
    if (allDone) {
      sfx.blip();
      return;
    }
    unlockSkills(SKILLS_LIST.flatMap((g) => g.items.map((i) => i.id)));
    sfx.unlock();
  };

  return (
    <section id="skills" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <span className="eyebrow">skills</span>
          <h2 className="section-title">Skill Forge</h2>
          <p className="section-subtitle">
            Click a node to unlock it, or hit a core to light up the whole branch.
          </p>
        </div>
        <button
          type="button"
          onClick={unlockEverything}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
            allDone
              ? "border-accent/50 bg-accent/10 text-accent"
              : "border-border bg-card/50 text-muted-foreground hover:border-accent/40 hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {allDone ? "Forge complete" : "Unlock all"}
          <span className="font-mono text-[10px] opacity-70">
            {unlocked}/{SKILL_TOTAL}
          </span>
        </button>
      </motion.div>

      <SkillTree />
    </section>
  );
}
