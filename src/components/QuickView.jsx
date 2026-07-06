import "../styles/QuickView.css";

function QuickView({ product, close, addToCart }) {
  if (!product) return null;

  return (
    <div className="overlay">
      <div className="modal">
        <button className="close-btn" onClick={close}>
          ✖
        </button>

        <img src={product.image} alt={product.name} />

        <h2>{product.name}</h2>

        <p>⭐ {product.rating}</p>

        <h3>₹{product.price}</h3>

        <p>AI Recommendation Score: 95%</p>

        <button
          className="buy-btn"
          onClick={() => {
            addToCart();

            close();
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default QuickView;
