import {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { use3D } from "@/three/support";

export interface SceneProps {
  active: boolean;
}

type Loader = () => Promise<{ default: ComponentType<SceneProps> }>;

interface Props {
  /** Must be a stable function (define it at module scope) so the chunk loads once. */
  load: Loader;
  /** Shown when 3D is off, and under the canvas until the scene has mounted. */
  fallback?: ReactNode;
  className?: string;
  /** How far outside the viewport the scene starts loading and rendering. */
  margin?: string;
}

const lazyCache = new Map<Loader, ComponentType<SceneProps>>();

function Mounted({ onMount }: { onMount: () => void }) {
  useEffect(onMount, [onMount]);
  return null;
}

/**
 * Gate for every 3D scene: code-splits the scene, renders it only when WebGL
 * is available and reduced motion is off, activates it only while near the
 * viewport and the tab is visible, and crossfades from the 2D fallback.
 */
export default function Lazy3D({ load, fallback = null, className = "relative", margin = "400px" }: Props) {
  const ok = use3D();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState === "visible"
  );
  const [ready, setReady] = useState(false);
  const [hideFallback, setHideFallback] = useState(false);

  const Lazy = useMemo(() => {
    let C = lazyCache.get(load);
    if (!C) {
      C = lazy(load);
      lazyCache.set(load, C);
    }
    return C;
  }, [load]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ok) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: margin }
    );
    io.observe(el);
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ok, margin]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setHideFallback(true), 700);
    return () => clearTimeout(t);
  }, [ready]);

  const onMount = useMemo(() => () => setReady(true), []);

  return (
    <div ref={ref} className={className} data-3d={ok ? (ready ? "on" : "loading") : "off"}>
      {!(ok && hideFallback) && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: ok && ready ? 0 : 1 }}
          aria-hidden={ok && ready ? true : undefined}
        >
          {fallback}
        </div>
      )}
      {ok && seen && (
        <Suspense fallback={null}>
          <Lazy active={inView && visible} />
          <Mounted onMount={onMount} />
        </Suspense>
      )}
    </div>
  );
}
