// hooks/useCountUp.ts
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo for a nice "roll up" feel
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, start]);

  return count;
}