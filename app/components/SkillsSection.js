"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const cards = [
  {
    title: "For Individuals",
    imgClass: "card-img-individuals",
    desc: "Learn, refine and master your cyber skills",
    cta: "Begin your journey",
  },
  {
    title: "For Businesses",
    imgClass: "card-img-business",
    desc: "Build and scale threat-ready enterprise cyber teams",
    cta: "Scale your team",
  },
  {
    title: "For Public Sector",
    imgClass: "card-img-public",
    desc: "Cyber career development designed specifically for the public sector",
    cta: "Learn more",
  },
];

export default function SkillsSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    const elements = sectionRef.current?.querySelectorAll(".reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="skills-section" ref={sectionRef}>
      <div className="container">
        <h2>Cybersecurity skills proven in practice</h2>
        <p className="section-subtitle">
          New to cyber, seasoned pro, or leading a national program, get
          hands-on training and exercises that keep people sharp, teams ready,
          and missions resilient.
        </p>
        <div className="cards-grid">
          {cards.map((card, i) => (
            <div
              className="audience-card reveal"
              key={i}
              style={{ "--card-index": i }}
            >
              <h3>{card.title}</h3>
              <div className={`card-image ${card.imgClass}`}></div>
              <p>{card.desc}</p>
              <Link href="#" className="btn btn-outline">{card.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
