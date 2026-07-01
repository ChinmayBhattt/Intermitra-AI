"use client";

import { useState, useEffect, useRef } from "react";

const stats = [
  { number: "4.3M+", label: "Community members" },
  { number: "2,800+", label: "Hands-on labs" },
  { number: "1,500+", label: "Enterprise customers" },
  { number: "90+", label: "Countries served" },
];

function AnimatedStat({ number, label }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(number);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateCounter();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();

    function animateCounter() {
      const match = number.match(/([\d,.]+)/);
      if (!match) return;
      const numStr = match[1];
      const target = parseFloat(numStr.replace(/,/g, ""));
      const suffix = number.replace(numStr, "");
      const hasDecimal = numStr.includes(".");
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;

        if (hasDecimal) {
          setDisplay(current.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix);
        } else {
          setDisplay(Math.floor(current).toLocaleString() + suffix);
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setDisplay(number);
        }
      }
      requestAnimationFrame(update);
    }
  }, [number]);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-number">{display}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function DemoSection() {
  const [formState, setFormState] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState("sending");

    setTimeout(() => {
      setFormState("sent");
      setTimeout(() => {
        setFormState("idle");
        e.target.reset();
      }, 2500);
    }, 1200);
  };

  return (
    <section className="demo-section" id="demo">
      <div className="container">
        <div className="demo-grid">
          <div className="demo-form-wrap">
            <h2>Get a full demo with our team</h2>
            <p>Fill the form to schedule a live product demo and Q&amp;A about our cyber readiness solutions.</p>
            <form className="demo-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input type="text" id="firstName" required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input type="text" id="lastName" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Business Email *</label>
                <input type="email" id="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company *</label>
                <input type="text" id="company" required />
              </div>
              <div className="form-group">
                <label htmlFor="teamSize">Team Size</label>
                <select id="teamSize">
                  <option value="">Select...</option>
                  <option>1–10</option>
                  <option>11–50</option>
                  <option>51–200</option>
                  <option>201–500</option>
                  <option>500+</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={formState !== "idle"}
                style={{
                  opacity: formState !== "idle" ? 0.7 : 1,
                  background: formState === "sent" ? "#2d8a2d" : undefined,
                  borderColor: formState === "sent" ? "#2d8a2d" : undefined,
                }}
              >
                {formState === "sending"
                  ? "Sending..."
                  : formState === "sent"
                  ? "✓ Demo Requested!"
                  : "Get a demo"}
              </button>
            </form>
          </div>
          <div className="demo-info">
            <h2>The #1 platform to build attack-ready teams and organizations</h2>
            <div className="demo-stats">
              {stats.map((s, i) => (
                <AnimatedStat key={i} number={s.number} label={s.label} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
