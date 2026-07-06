import "../styles/Hero.css";

function Hero({ openAI }) {
  return (
    <section className="hero">

      <div className="hero-left">

        <h1>
          Shop Smarter with Artificial Intelligence
        </h1>

        <p>
          Discover products with intelligent recommendations,
          compare items, and experience the future of shopping.
        </p>

        <button onClick={openAI}>
          🤖 Ask AI Assistant
        </button>

      </div>

      <div className="hero-right">

        <img
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700"
          alt="shopping"
        />

      </div>

    </section>
  );
}

export default Hero;