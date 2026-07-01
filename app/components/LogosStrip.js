export default function LogosStrip() {
  const brands = [
    "EA SPORTS", "TOYOTA", "PUMA", "AUTODESK", "CONTEXT",
    "NVISO", "BOOKING", "SIEMENS",
  ];

  return (
    <section className="logos-section">
      <div className="logos-track">
        <div className="logos-slide">
          {/* Duplicate for seamless infinite scroll */}
          {[...brands, ...brands].map((brand, i) => (
            <span className="logo-brand" key={i}>{brand}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
