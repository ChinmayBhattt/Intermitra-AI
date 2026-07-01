"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    document.body.style.overflow = !menuOpen ? "hidden" : "";
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
      <Link href="#" className="nav-logo" aria-label="Hack The Box Home">
        <svg className="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="36" height="36" rx="6" stroke="#9fef00" strokeWidth="2.5" fill="none" />
          <path d="M20 8L28 13V23L20 28L12 23V13L20 8Z" stroke="#9fef00" strokeWidth="2" fill="none" />
          <path d="M20 18L28 13M20 18L12 13M20 18V28" stroke="#9fef00" strokeWidth="1.5" />
        </svg>
        <span className="logo-text"><strong>HACK</strong>THEBOX</span>
      </Link>

      <button
        className={`hamburger${menuOpen ? " active" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span><span></span><span></span>
      </button>

      <div className={`nav-menu${menuOpen ? " open" : ""}`}>
        <div className="nav-menu-inner">
          {["Platform", "For Business", "For Individuals", "Resources", "About"].map((item) => (
            <Link key={item} href="#" className="nav-link" onClick={closeMenu}>
              {item}
            </Link>
          ))}
          <div className="nav-actions">
            <Link href="#" className="btn btn-outline-light">Log In</Link>
            <Link href="#" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
