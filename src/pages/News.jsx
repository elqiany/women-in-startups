import useNews from "../hooks/useNews";

export default function News() {
  const { items } = useNews();

  return (
    <section className="px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">Latest News</h1>

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
                {(n.source || "").trim()}{" "}
                {n.date ? `• ${new Date(n.date).toLocaleDateString()}` : ""}
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