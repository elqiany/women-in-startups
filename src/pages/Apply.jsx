export const opps = [
  {
    title: "Berkeley SkyDeck — Batch 21",
    desc: "6-month accelerator with UC Berkeley.",
    deadline: "2025-08-28",
    dateLabel: "Apply by Aug 28, 2025",
    where: "Berkeley, CA (hybrid)",
    tag: "Accelerator",
    href: "https://skydeck.berkeley.edu/apply/"
  },
  {
    title: "Techstars New York City Accelerator",
    desc: "3-month accelerator; in-person NYC.",
    deadline: "2025-09-08",
    dateLabel: "Final deadline Sep 8, 2025",
    where: "New York, NY",
    tag: "Accelerator",
    href: "https://www.techstars.com/accelerators/nyc"
  },
  {
    title: "Alchemist Accelerator (Enterprise)",
    desc: "B2B/enterprise-focused accelerator.",
    deadline: "2025-09-12",
    dateLabel: "Apply by Sep 12, 2025",
    where: "SF Bay Area + Remote",
    tag: "Accelerator",
    href: "https://www.alchemistaccelerator.com/program"
  },
  {
    title: "Heilbronn Slush’D — Pitch Competition",
    desc: "Live pitch; main award up to €100k (convertible).",
    deadline: "2025-09-23",
    dateLabel: "Apply by Sep 23, 2025",
    where: "Heilbronn, Germany",
    tag: "Competition",
    href: "https://heilbronnslushd.com/pitch-competition"
  },
  {
    title: "500 Global — Flagship Accelerator (Batch 37)",
    desc: "Seed accelerator in Silicon Valley.",
    deadline: "2025-10-17",
    dateLabel: "Apply by Oct 17, 2025",
    where: "Palo Alto, CA",
    tag: "Accelerator",
    href: "https://flagship.aplica.500.co/en/sites/flagship"
  },
  {
    title: "Founder Institute — New York (Fall 2025)",
    desc: "Evening pre-seed program; hybrid.",
    deadline: "2025-10-21",
    dateLabel: "NYC final deadline Oct 21, 2025",
    where: "New York, NY (hybrid)",
    tag: "Accelerator",
    href: "https://fi.co/enrolling"
  },
  {
    title: "SXSW Pitch (2026)",
    desc: "Flagship startup pitch at SXSW.",
    deadline: "2025-11-07",
    dateLabel: "Apply by Nov 7, 2025",
    where: "Austin, TX",
    tag: "Competition",
    href: "https://www.sxsw.com/pitch/"
  },
  {
    title: "Techstars Anywhere (Remote)",
    desc: "Remote accelerator; North America timezones.",
    deadline: "2025-11-19",
    dateLabel: "Final deadline Nov 19, 2025",
    where: "Remote (global)",
    tag: "Accelerator",
    href: "https://www.techstars.com/accelerators/anywhere"
  },
  {
    title: "Web Summit — PITCH (via Startup Programme)",
    desc: "Apply to Startup Programme to qualify for PITCH.",
    deadline: null,
    dateLabel: "Apply now (Lisbon, Nov 10–13, 2025)",
    where: "Lisbon, Portugal",
    tag: "Competition",
    href: "https://websummit.com/startups/pitch/"
  },
  {
    title: "Startup World Cup — Regional Qualifiers",
    desc: "Compete regionally; winners go to $1M Grand Finale.",
    deadline: null,
    dateLabel: "Rolling by region",
    where: "Global",
    tag: "Competition",
    href: "https://www.startupworldcup.io/applynow"
  }
];

// default component
export default function Apply() {
  // sort a copy so opps stays untouched
  const sortedOpps = [...opps].sort(
    (a, b) =>
      new Date(a.deadline || "2999-12-31") - new Date(b.deadline || "2999-12-31")
  );

  return (
    <section className="mx-auto max-w-4xl px-6 pb-24">
      {/* Header */}
      <div className="mx-auto max-w-prose text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#492201]">
          Apply
        </h1>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#492201]/80" />
        <p className="mt-3 text-sm text-gray-500">
          Open pitch comps, grants & accelerators for founders
        </p>
      </div>

      {/* Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedOpps.map((o) => (
          <div
            key={o.title}
            className="rounded-2xl border border-black/10 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide rounded-full px-2 py-0.5 bg-[#492201]/10 text-[#492201]">
                {o.tag}
              </span>
              <span className="text-xs text-gray-500">{o.dateLabel}</span>
            </div>

            <h3 className="mt-2 text-lg font-semibold text-gray-900">{o.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{o.desc}</p>
            <p className="mt-1 text-xs text-gray-500">{o.where}</p>

            <div className="mt-3">
              <a
                href={o.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl bg-[#492201] px-4 py-2 text-white text-sm font-medium hover:bg-[#492201]/90"
                aria-label={`Apply: ${o.title}`}
              >
                Apply
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}