import Link from "next/link";

export default function ForresterSection() {
  return (
    <section className="forrester-section">
      <div className="container">
        <div className="forrester-card">
          <div className="forrester-text">
            <h2>
              Hack The Box named a Leader in The Forrester Wave™ for
              Cybersecurity Skills and Training Platforms
            </h2>
            <p>
              Explore Forrester&apos;s objective evaluation of cybersecurity training
              platforms, with a spotlight on the capabilities that set leaders
              apart.
            </p>
            <Link href="#" className="btn btn-primary">Read the report</Link>
          </div>
          <div className="forrester-chart">
            <div className="chart-placeholder">
              <div className="chart-title">THE FORRESTER WAVE™</div>
              <div className="chart-subtitle">Cybersecurity Skills And Training Platforms</div>
              <div className="chart-year">Q1 2026</div>
              <div className="chart-grid">
                <div className="chart-quadrant">
                  <span className="q-label q-contenders">Contenders</span>
                  <span className="q-label q-performers">Strong Performers</span>
                  <span className="q-label q-leaders">Leaders</span>
                </div>
                <div className="chart-dot htb-dot">
                  <span className="dot-label">Hack The Box</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
