"use client";

import { useState } from "react";
import Link from "next/link";

const tabsData = {
  validate: {
    title: "Emulate Real Threats. Validate Readiness.",
    desc: "Validate cybersecurity capabilities and operational readiness against real-world threats by replicating adversarial behaviors or attacks in threat emulation programs, so your teams are confident, capable, and prepared from day zero.",
    features: [
      { title: "Enterprise attack simulation training", desc: "Real-world attack simulations and live-fire team exercises." },
      { title: "Purple-minded scenarios", desc: "Replicate complex multi-stage threats because modern breaches exploit entire networks." },
      { title: "Break the mold of traditional training", desc: "Real-time, hands-on, offensive & defensive content releases on latest vectors and vulnerabilities." },
    ],
    cta: "Get hands-on readiness",
    illustration: "person",
  },
  develop: {
    title: "Develop Skills That Matter.",
    desc: "Build role-specific learning paths that close skill gaps across your security organization. From SOC analysts to penetration testers, develop expertise that translates directly to operational effectiveness.",
    features: [
      { title: "Role-based learning paths", desc: "Structured curricula aligned to NICE framework roles and real job requirements." },
      { title: "Skill assessments & benchmarking", desc: "Measure and track your team's capabilities against industry standards." },
      { title: "Continuous content updates", desc: "Stay current with the latest threats, tools, and techniques in the cyber landscape." },
    ],
    cta: "Develop your team",
    illustration: "chart",
  },
  achieve: {
    title: "Achieve True Cyber Resilience.",
    desc: "Transform your organization's security posture through continuous assessment, training, and validation. Build teams that are ready for any threat, any time.",
    features: [
      { title: "Operational readiness programs", desc: "Comprehensive programs that test and validate your entire security operation." },
      { title: "Executive reporting & insights", desc: "Data-driven insights that communicate cyber risk in business terms." },
      { title: "Compliance & governance alignment", desc: "Map training outcomes to regulatory requirements and industry frameworks." },
    ],
    cta: "Build resilience",
    illustration: "shield",
  },
};

function TabIllustration({ type }) {
  if (type === "person") {
    return (
      <div className="tab-illustration">
        <div className="illus-person">
          <div className="illus-head"></div>
          <div className="illus-body"></div>
          <div className="illus-glasses"></div>
        </div>
        <div className="illus-screen"></div>
      </div>
    );
  }
  if (type === "chart") {
    return (
      <div className="tab-illustration develop-illus">
        <div className="illus-chart-bar bar-1"></div>
        <div className="illus-chart-bar bar-2"></div>
        <div className="illus-chart-bar bar-3"></div>
        <div className="illus-chart-bar bar-4"></div>
      </div>
    );
  }
  return (
    <div className="tab-illustration achieve-illus">
      <div className="illus-shield"></div>
      <div className="illus-check"></div>
    </div>
  );
}

export default function TabsSection() {
  const [activeTab, setActiveTab] = useState("validate");

  const tabs = [
    { key: "validate", label: "Validate Your Readiness" },
    { key: "develop", label: "Develop Your Workforce" },
    { key: "achieve", label: "Achieve Cyber Resilience" },
  ];

  const data = tabsData[activeTab];

  return (
    <section className="tabs-section" id="tabs-section">
      <div className="container">
        <div className="tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? " active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content active" key={activeTab}>
          <div className="tab-inner">
            <div className="tab-text">
              <h2>{data.title}</h2>
              <p className="tab-desc">{data.desc}</p>
              <div className="feature-cards">
                {data.features.map((f, i) => (
                  <div className="feature-card" key={i}>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="#" className="btn btn-primary">{data.cta}</Link>
            </div>
            <div className="tab-visual">
              <TabIllustration type={data.illustration} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
