import "../styles/Hero.css";
import heroImg from "../assets/hero.jpeg";

function Hero({ openAI }) {
  return (
    <section className="hero">
      <div className="hero-left">
        <h1>The Future of Online Shopping Starts Here.</h1>

        <p>
          Experience AI-powered shopping with personalized recommendations,
          smart comparisons, instant search, and intelligent product discovery.
        </p>

        <div className="hero-buttons">
          <button
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Products
          </button>

          <button onClick={openAI}>🤖 Ask AI</button>
        </div>
      </div>

      <div className="hero-right">
        <img src={heroImg} alt="SmartCommerce Hero" />
      </div>
    </section>
  );
}

export default Hero;
