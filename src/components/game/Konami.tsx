import { useEffect } from "react";
import { useGame } from "@/game/store";
import { sfx } from "@/game/sfx";
import { burst, reducedMotion } from "@/game/confetti";

const CODE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

/** Listens for the Konami code. Renders nothing. */
export default function Konami() {
  const triggerKonami = useGame((s) => s.triggerKonami);

  useEffect(() => {
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0;
      if (pos < CODE.length) return;
      pos = 0;
      triggerKonami();
      sfx.win();
      burst({ particleCount: 160, spread: 120, origin: { y: 0.5 } });
      if (!reducedMotion()) {
        document.documentElement.animate(
          [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
          { duration: 1100, easing: "cubic-bezier(.4,0,.2,1)" }
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerKonami]);

  return null;
}
