import { opps } from "./Apply";

export default function Resources() {
  const topThree = [...opps]
    .sort(
      (a, b) =>
        new Date(a.deadline || "2999-12-31") -
        new Date(b.deadline || "2999-12-31")
    )
    .slice(0, 3);

  return (
    <section className="mx-auto max-w-4xl px-6 pb-24">
      {/* Header */}
      <div className="mx-auto max-w-prose text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#492201]">
          Resources
        </h1>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#492201]/80" />
        <p className="mt-3 text-sm text-gray-500">
          Curated tools for founders
        </p>
      </div>

      {/* Top 3 from Apply */}
      <h2 className="mt-10 text-xl font-semibold text-[#492201]">
        Upcoming founder events
      </h2>
      <div className="space-y-4 mt-4">
        {topThree.map((o) => (
          <div
            key={o.title}
            className="flex justify-between items-center bg-white border rounded-xl px-4 py-3"
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {o.tag}
              </div>
              <div className="font-medium">{o.title}</div>
              <div className="text-sm text-gray-500">{o.where}</div>
              <div className="text-sm text-gray-500">{o.dateLabel}</div>
            </div>

            <a
              href={o.href}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 text-sm rounded-md bg-[#492201] text-white hover:bg-[#492201]/90 transition"
            >
              Apply
            </a>
          </div>
        ))}
      </div>

      {/* link to full list */}
      <div className="text-center pt-3">
        <a href="/apply" className="text-[#492201] hover:underline">
          View all →
        </a>
      </div>
    </section>
  );
}