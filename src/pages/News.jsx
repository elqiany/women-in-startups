import { Link } from "react-router-dom";
import useNews from "../hooks/useNews";

export default function News() {
  const {
    items = [],
    status = "idle",
    error = null,
  } = (typeof useNews === "function" ? useNews("/api/news") : {}) || {};

  return (
    <section className="mx-auto max-w-4xl px-6 pb-24">
      <div className="mx-auto max-w-prose text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#492201]">
          News
        </h1>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#492201]/80" />
        <p className="mt-3 text-sm text-gray-500">Updates and founder stories</p>
      </div>

      {status === "loading" && (
        <div className="mx-auto mt-8 max-w-prose text-gray-600">Loading…</div>
      )}
      {status === "error" && (
        <div className="mx-auto mt-8 max-w-prose text-red-600">
          Couldn’t load news: {String(error)}
        </div>
      )}

      <div className="mx-auto mt-6 grid gap-4 max-w-prose md:max-w-3xl">
        {items.map((it, i) => (
          <a
            key={it.id || it.url || it.link || i}
            href={it.url || it.link || "#"}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-gray-200 p-4 hover:bg-[#492201]/5 transition-colors"
          >
            <div className="text-sm text-gray-500">
              {(it.source || "Source")} · {it.date ? new Date(it.date).toLocaleDateString() : "—"}
            </div>
            <div className="mt-1 text-lg font-medium text-[#1a1a1a]">
              {it.title || "Untitled"}
            </div>
          </a>
        ))}
        {items.length === 0 && status !== "loading" && (
          <div className="text-gray-600">No articles right now.</div>
        )}
      </div>

      {/* <div className="mx-auto mt-10 flex items-center justify-center gap-3">
        <Link
          to="/resources"
          className="rounded-xl bg-[#492201] px-4 py-2 text-white font-medium hover:bg-[#492201]/90 transition-colors"
        >
          Explore resources
        </Link>
        <Link
          to="/about"
          className="rounded-xl ring-1 ring-[#492201]/20 px-4 py-2 text-[#492201] hover:bg-[#492201]/10 transition-colors"
        >
          About
        </Link>
      </div> */}
    </section>
  );
}