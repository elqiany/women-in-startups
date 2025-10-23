// src/pages/Home.jsx
import { Typewriter } from "react-simple-typewriter";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import useNews from "../hooks/useNews";
import hero from "../assets/cash-macanaya-X9Cemmq4YjM-unsplash-3.png";

// /* Navbar */
// function Navbar() {
//   return (
//     <nav
//       className="fixed top-4 left-1/2 -translate-x-1/2 z-50
//                  bg-white/60 backdrop-blur-md border border-black/10
//                  rounded-lg px-6 py-2 flex items-center gap-6
//                  text-sm font-medium text-gray-800 shadow-sm"
//     >
//       <a href="#home" className="hover:text-purple-600 transition-colors">Home</a>
//       <a href="#news" className="hover:text-purple-600 transition-colors">News</a>
//       <a href="#about" className="hover:text-purple-600 transition-colors">About</a>
//       <a href="#contact" className="hover:text-purple-600 transition-colors">Contact</a>
//     </nav>
//   );
// }

/* First scroll reveal (no page freeze) */
function FirstScrollReveal({ children, duration = 1200 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const start = (e) => {
      if (visible) return;
      if (e.type === "keydown") {
        const ok = ["Space", "PageDown", "ArrowDown", "ArrowUp", "PageUp"];
        if (!ok.includes(e.code)) return;
      }
      if (e.cancelable) e.preventDefault();
      setVisible(true);

      window.removeEventListener("wheel", start, true);
      window.removeEventListener("touchstart", start, true);
      window.removeEventListener("keydown", start, true);
    };

    window.addEventListener("wheel", start, { passive: false, capture: true });
    window.addEventListener("touchstart", start, { passive: false, capture: true });
    window.addEventListener("keydown", start, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", start, true);
      window.removeEventListener("touchstart", start, true);
      window.removeEventListener("keydown", start, true);
    };
  }, [visible]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
      transition={{ duration: duration / 1000, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-6 right-6 md:bottom-10 md:right-10 pointer-events-none"
    >
      {children}
    </motion.div>
  );
}

function safeFormatDate(input) {
  try {
    if (!input) return "—";
    const t = new Date(input);
    return Number.isNaN(t.getTime()) ? "—" : t.toLocaleDateString();
  } catch {
    return "—";
  }
}

/* News card with image */
/* News card with bigger layout */
function NewsCard({ item }) {
  const href = item.url || "#";
  const when = item.date ? new Date(item.date).toLocaleDateString() : "—";
  const source = item.source || "Source";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group w-80 md:w-96 shrink-0 rounded-2xl border border-black/10
                 bg-white hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-200/60 to-gray-100/60">
        {item.image && (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider text-gray-600">
          <span className="px-2 py-0.5 rounded-full bg-black/5">{source}</span>
          <span>•</span>
          <time>{when}</time>
        </div>
        <h3 className="mt-2 text-base md:text-lg font-semibold leading-snug text-gray-900 group-hover:text-purple-700 line-clamp-3">
          {item.title}
        </h3>
      </div>
    </a>
  );
}

/* Horizontal news row */
function ScrollStage({ id, title, items = [], status = "idle", error = null }) {
  const rowRef = useRef(null);

  const onWheel = (e) => {
    const el = rowRef.current;
    if (!el) return;
    // Only prevent default while inside the row
    e.preventDefault();

    const mostlyHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
    if (mostlyHorizontal) {
      el.scrollLeft += e.deltaX !== 0 ? e.deltaX : e.deltaY;
    } else {
      window.scrollBy({ top: e.deltaY, behavior: "auto" });
    }
  };

  return (
    <section id={id} className="relative py-12">
      <div className="px-6 md:px-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">{title}</h2>
      </div>

      <div className="px-6 md:px-12">
        <div
          ref={rowRef}
          onWheel={onWheel}
          className="news-scroll overflow-x-auto overflow-y-hidden scroll-smooth
                     touch-pan-x [overscroll-behavior-x:contain]"
          style={{ scrollbarGutter: "stable both-edges" }}
        >
          <div className="flex gap-4 md:gap-6 pb-4 pr-4 snap-x snap-mandatory">
            {status === "loading" ? (
              <div className="text-sm text-gray-500 py-4">Loading news…</div>
            ) : status === "error" ? (
              <div className="text-sm text-red-600 py-4">Couldn’t load news: {error}</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-gray-500 py-4">No articles right now.</div>
            ) : (
              items.map((it, idx) => (
                <div key={it.id || it.link || it.url || idx} className="snap-start">
                  <NewsCard item={it} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Page */
export default function Home() {
  // If your hook accepts an endpoint, great; otherwise just call useNews()
  const {
    items: news = [],
    status = "idle",
    error = null,
  } = (typeof useNews === "function" ? useNews("/api/news") : {}) || {};
  


  return (
    <div id="home" className="relative min-h-screen bg-white overflow-hidden">

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center">
        <img
          // src="/cash-macanaya-X9Cemmq4YjM-unsplash-3.png"
          src = {hero}
          alt="Women building the future"
          className="block mx-auto max-w-2xl w-full h-auto"
        />

        {/* top-left typewriter */}
        <div className="absolute top-20 left-10 md:left-40 font-neuehaas text-[#492201]">
          <div className="text-5xl md:text-6xl font-medium">Women are</div>
          <div className="text-5xl md:text-6xl font-medium text-[#6a3e2e] flex items-center gap-1">
            <Typewriter
              words={["founders.", "gmi.", "leaders.", "building.", "funded."]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={90}
              deleteSpeed={60}
              delaySpeed={1200}
            />
          </div>
        </div>

        {/* appears only when you first scroll; no page freeze */}
        <FirstScrollReveal duration={1200}>
          <h1 className="text-right leading-tight font-medium font-neuehaas text-[#492201] text-[8vw] md:text-[5vw]">
            Women are the future<br />of startups.
          </h1>
        </FirstScrollReveal>
      </section>

      {/* ABOUT */}
      <section id="about" className="h-screen flex items-center justify-center p-8 bg-white">
        <div className="max-w-3xl text-3xl leading-relaxed font-neuehaas text-[#1a1a1a] text-center">
          Women in Startup uplifts women who want to build startups<br />One step at a time
        </div>
      </section>

      {/* NEWS */}
      <ScrollStage id="news" title="Latest News" items={news} status={status} error={error} />

      <footer id="contact" className="py-20 text-center text-sm text-gray-500 bg-white">
        © {new Date().getFullYear()} Women in Startups
      </footer>
    </div>
  );
}