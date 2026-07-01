import Link from "next/link";

export default function NewsSection() {
  return (
    <section className="news-section">
      <div className="container">
        <div className="news-card">
          <span className="news-label">LATEST PRODUCT NEWS</span>
          <h2>Hack The Box launches the world&apos;s first AI Range</h2>
          <p>
            The world&apos;s first controlled AI cyber range built to test and
            benchmark the safety, limits and capabilities of autonomous AI
            security agents. HTB AI Range replicates live, high-stakes cyber
            battlegrounds, tailored for enterprise readiness, where AI agents
            and human operators are evaluated side-by-side.
          </p>
          <Link href="#" className="btn btn-primary">Learn more</Link>
        </div>
      </div>
    </section>
  );
}
