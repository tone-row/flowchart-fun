import { useEffect, useRef, useState } from "react";

export function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return {
    ref,
    className: isVisible
      ? "opacity-100 translate-y-0 transition-all duration-500 ease-out"
      : "opacity-0 translate-y-3",
  };
}
