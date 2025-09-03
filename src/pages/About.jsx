export default function About() {
    return (
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="mx-auto max-w-prose text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#492201]">
            About
          </h1>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#492201]/80" />
          <p className="mt-3 text-sm text-gray-500">Why I built Women in Startups</p>
        </div>
  
        <div className="mx-auto mt-8 max-w-prose text-lg leading-8 text-gray-800 [text-wrap:balance]">
          <p>
            I made this website as a fun project. My two closest friends are both startup founders,
            and whether I liked it or not, they pulled me into the world of startups. I noticed the
            lack of women in startup culture. After watching my favorite movie as a kid, <em>Barbie and
            the Three Musketeers</em>, again, I realized I've always been passionate about women taking
            on roles in male-dominated spaces.
          </p>
          <p className="mt-5">
            I created this so when people think of founders, they think of women.
          </p>
        </div>
  
        {/* <div className="mx-auto mt-10 flex items-center justify-center gap-3">
          <a
            href="/resources"
            className="rounded-xl bg-[#492201] px-4 py-2 text-white font-medium hover:bg-[#492201]/90 transition-colors"
          >
            Explore resources
          </a>
          <a
            href="/news"
            className="rounded-xl ring-1 ring-[#492201]/20 px-4 py-2 text-[#492201] hover:bg-[#492201]/10 transition-colors"
          >
            Read news
          </a>
        </div> */}
      </section>
    );
  }