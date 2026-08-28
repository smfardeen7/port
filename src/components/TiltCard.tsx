import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { getTiltFromPointer } from "@/lib/tilt";

type TiltCardProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  intensity?: number;
  lift?: number;
};

export default function TiltCard({
  children,
  className = "",
  intensity = 7,
  lift = 8,
  onPointerMove,
  onPointerLeave,
  ...props
}: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 });

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (reduceMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const tilt = getTiltFromPointer(
      { x: event.clientX, y: event.clientY },
      { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      intensity
    );
    rotateX.set(tilt.rotateX);
    rotateY.set(tilt.rotateY);
    y.set(-lift);
  };

  const handleLeave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    rotateX.set(0);
    rotateY.set(0);
    y.set(0);
  };

  return (
    <motion.div
      {...props}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, y, transformStyle: "preserve-3d" }}
      className={`tilt-card ${className}`}
    >
      {children}
    </motion.div>
  );
}
