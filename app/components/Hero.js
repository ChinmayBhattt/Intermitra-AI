"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Hero() {
  const diamondsRef = useRef([]);
  const dotsRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      diamondsRef.current.forEach((d, i) => {
        if (d) {
          const speed = (i + 1) * 8;
          d.style.transform = `rotate(45deg) translate(${x * speed}px, ${y * speed}px)`;
        }
      });

      if (dotsRef.current) {
        dotsRef.current.style.transform = `translate(${x * 5}px, ${y * 5}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-grid-pattern"></div>
        <div
          className="hero-diamond hero-diamond-1"
          ref={(el) => (diamondsRef.current[0] = el)}
        ></div>
        <div
          className="hero-diamond hero-diamond-2"
          ref={(el) => (diamondsRef.current[1] = el)}
        ></div>
        <div className="hero-dots" ref={dotsRef}></div>
      </div>
      <div className="container hero-content">
        <div className="hero-text">
          <h1>Build and scale a cyber workforce in the AI era</h1>
          <p className="hero-subtitle">
            Equip threat-ready cyber teams for an AI-accelerated landscape with
            hands-on labs, assessments, and pathways that build top performing
            teams.
          </p>
          <div className="hero-cta">
            <Link href="#" className="btn btn-primary btn-lg">For business</Link>
            <Link href="#" className="btn btn-outline btn-lg">For individuals</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-mosaic">
            <div className="mosaic-piece mosaic-1"></div>
            <div className="mosaic-piece mosaic-2"></div>
            <div className="mosaic-piece mosaic-3"></div>
            <div className="mosaic-overlay"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
