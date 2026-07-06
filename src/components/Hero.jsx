import "../styles/Hero.css";

function Hero({ openAI }) {
  return (
    <section className="hero">
      <h1>Shop Smarter with AI</h1>

      <p>Discover products faster using intelligent recommendations.</p>

      <div className="hero-buttons">
        <button>Explore Products</button>

        <button onClick={openAI}>Ask AI</button>
      </div>
    </section>
  );
}

export default Hero;
