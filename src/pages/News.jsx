import useNews from "../hooks/useNews";

export default function News() {
  const { items, status, error } = useNews();

  // First-time loading: show a clean loading state
  if (status === "loading" && items.length === 0) {
    return (
      <section className="px-6 py-10 min-h-[50vh]">
        <h1 className="text-3xl font-semibold mb-4">Latest News</h1>
        <p className="text-gray-500">Loading…</p>
      </section>
    );
  }

  // Error before first data
  if (status === "error" && items.length === 0) {
    return (
      <section className="px-6 py-10 min-h-[50vh]">
        <h1 className="text-3xl font-semibold mb-4">Latest News</h1>
        <p className="text-red-600">Couldn’t load articles. Try refresh.</p>
      </section>
    );
  }

  // Success or refetch (we keep items on screen)
  return (
    <section className="px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Latest News</h1>
        {status === "loading" && items.length > 0 && (
          <span className="text-sm text-gray-400">Refreshing…</span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">No articles right now.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-6">
          {items.map((n, i) => (
            <li key={i} className="border rounded-2xl p-4 shadow-sm">
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {n.title}
              </a>
              <div className="text-sm text-gray-500 mt-1">
                {(n.source || "").trim()} {n.date ? `• ${new Date(n.date).toLocaleDateString()}` : ""}
              </div>
              {n.summary && (
                <p className="mt-2 text-gray-700 line-clamp-3">{n.summary}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}