"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Position = { x: number; y: number };
type AnimationName = "idle" | "running" | "waving";
type Direction = "left" | "right";

// Codex Pets use a fixed 1536×1872 atlas: 8 columns, 9 rows, 192×208 cells.
// Swap the public URL at deploy time to install any compatible pet.
const CONFIG = {
  spriteSheet:
    process.env.NEXT_PUBLIC_PET_SPRITESHEET_URL ??
    "https://codexpets.org/pets/noir-webling/spritesheet.webp",
  columns: 8,
  rows: 9,
  // Exact quarter-scale preserves the 192:208 cell ratio and prevents
  // transparent pixels from adjacent frames bleeding into the animation.
  renderedWidth: 48,
  renderedHeight: 52,
  walkSpeed: 0.6,
  minIdleMs: 1200,
  maxIdleMs: 3500,
  edgePadding: 8,
} as const;

const ANIMATION_DURATION: Record<AnimationName, number> = {
  idle: 1.4,
  running: 0.75,
  waving: 1.2,
};

function animationRow(animation: AnimationName, direction: Direction) {
  if (animation === "running") return direction === "right" ? 1 : 2;
  return animation === "waving" ? 3 : 0;
}

function randomTarget(width: number, height: number): Position {
  const w = Math.max(1, width - CONFIG.renderedWidth - CONFIG.edgePadding * 2);
  const h = Math.max(
    1,
    height - CONFIG.renderedHeight - CONFIG.edgePadding * 2,
  );
  return {
    x: CONFIG.edgePadding + Math.random() * w,
    y: CONFIG.edgePadding + Math.random() * h,
  };
}

export default function PetCompanionCore({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [bounds, setBounds] = useState<{ w: number; h: number } | null>(null);
  const [position, setPosition] = useState<Position>({ x: 16, y: 16 });
  const [target, setTarget] = useState<Position>({ x: 16, y: 16 });
  const [animation, setAnimation] = useState<AnimationName>("idle");
  const [direction, setDirection] = useState<Direction>("right");

  const targetRef = useRef(target);
  const reachedRef = useRef(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const boundsRef = useRef(bounds);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => {
      const rect = element.getBoundingClientRect();
      setBounds({ w: rect.width, h: rect.height });
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef]);

  const scheduleIdleWander = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    const delay =
      CONFIG.minIdleMs + Math.random() * (CONFIG.maxIdleMs - CONFIG.minIdleMs);
    idleTimerRef.current = setTimeout(() => {
      const currentBounds = boundsRef.current;
      if (!currentBounds) return;
      setTarget(randomTarget(currentBounds.w, currentBounds.h));
      reachedRef.current = false;
      setAnimation("running");
    }, delay);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const onClick = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      setTarget({
        x: Math.max(
          CONFIG.edgePadding,
          Math.min(
            rect.width - CONFIG.renderedWidth - CONFIG.edgePadding,
            event.clientX - rect.left - CONFIG.renderedWidth / 2,
          ),
        ),
        y: Math.max(
          CONFIG.edgePadding,
          Math.min(
            rect.height - CONFIG.renderedHeight - CONFIG.edgePadding,
            event.clientY - rect.top - CONFIG.renderedHeight / 2,
          ),
        ),
      });
      reachedRef.current = false;
      setAnimation("running");
    };

    element.addEventListener("click", onClick);
    return () => element.removeEventListener("click", onClick);
  }, [containerRef]);

  useEffect(() => {
    const tick = () => {
      setPosition((current) => {
        const destination = targetRef.current;
        const dx = destination.x - current.x;
        const dy = destination.y - current.y;
        const distance = Math.hypot(dx, dy);

        if (distance < CONFIG.walkSpeed) {
          if (!reachedRef.current) {
            reachedRef.current = true;
            queueMicrotask(() => {
              setAnimation(Math.random() > 0.65 ? "waving" : "idle");
              scheduleIdleWander();
            });
          }
          return current;
        }

        if (Math.abs(dx) > 0.5) {
          queueMicrotask(() => setDirection(dx > 0 ? "right" : "left"));
        }

        const ratio = CONFIG.walkSpeed / distance;
        return {
          x: current.x + dx * ratio,
          y: current.y + dy * ratio,
        };
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleIdleWander]);

  useEffect(() => {
    if (bounds && reachedRef.current) scheduleIdleWander();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [bounds, scheduleIdleWander]);

  if (!bounds) return null;

  const row = animationRow(animation, direction);
  const style: React.CSSProperties & { "--pet-row-y": string } = {
    width: CONFIG.renderedWidth,
    height: CONFIG.renderedHeight,
    backgroundImage: `url(${CONFIG.spriteSheet})`,
    backgroundSize: `${CONFIG.renderedWidth * CONFIG.columns}px ${CONFIG.renderedHeight * CONFIG.rows}px`,
    backgroundPosition: `0 -${row * CONFIG.renderedHeight}px`,
    "--pet-row-y": `-${row * CONFIG.renderedHeight}px`,
    animation: `codex-pet-frames ${ANIMATION_DURATION[animation]}s linear infinite`,
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
  };

  return (
    <div
      className="pet-companion drop-shadow-sm dark:drop-shadow-zinc-300 motion-reduce:!animate-none"
      style={style}
      aria-hidden
    />
  );
}
