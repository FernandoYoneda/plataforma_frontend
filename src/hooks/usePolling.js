import { useEffect, useRef } from "react";

export default function usePolling(fn, ms = 5000, deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        await fn();
      } catch {}
      if (!cancelled) ref.current = setTimeout(tick, ms);
    };
    tick();
    return () => {
      cancelled = true;
      if (ref.current) clearTimeout(ref.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
