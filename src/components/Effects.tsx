"use client";

import { useEffect } from "react";

/**
 * The one small script behind the site's motion: parallax scroll vars,
 * scroll-triggered reveals, counting stats, card tilt, and the occasional
 * shooting star. Does nothing at all when the visitor prefers reduced
 * motion — in that case <html> never gets the `js` class, so every
 * reveal/tilt style stays inert and content is simply visible.
 */
export function Effects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("js");

    // Parallax + rocket progress
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty("--scroll-y", String(window.scrollY));
        root.style.setProperty(
          "--scroll-progress",
          String(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
        );
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Scroll-triggered reveals
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "-40px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    // Counting stats: <span data-count="194">194</span> counts up on view
    const countObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        countObserver.unobserve(el);
        const target = Number(el.dataset.count ?? "0");
        if (!Number.isFinite(target) || target <= 0) continue;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / 900, 1);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

    // A shooting star every so often, top third of the viewport
    const spawnStar = () => {
      if (document.hidden) return;
      const star = document.createElement("span");
      star.className = "shooting-star";
      star.style.top = `${Math.random() * 30}vh`;
      star.style.left = `${25 + Math.random() * 70}vw`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 1300);
    };
    const starTimer = setInterval(spawnStar, 9000 + Math.random() * 5000);
    setTimeout(spawnStar, 2500);

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
      countObserver.disconnect();
      clearInterval(starTimer);
    };
  }, []);

  return (
    <span aria-hidden className="scroll-rocket hidden md:block">
      🚀
    </span>
  );
}
