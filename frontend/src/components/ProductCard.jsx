import "../styles/ProductCard.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function ProductCard({
  product,
  addToCart,
  toggleWishlist,
  compareProducts,
  handleCompare,
}) {
  const navigate = useNavigate();

  return (
    <div className="product-card">
      <div className="discount">-{product.discount}%</div>

      <div
        className="wishlist"
        onClick={() => toggleWishlist(product)}
      >
        {product.favorite ? (
          <FaHeart color="red" />
        ) : (
          <FaRegHeart />
        )}
      </div>

      <img
        src={product.image}
        alt={product.name}
        onClick={() => navigate(`/product/${product.id}`)}
        style={{ cursor: "pointer" }}
      />

      {product.ai && (
        <span className="ai-tag">🤖 AI Pick</span>
      )}

      <h3>{product.name}</h3>

      <p>
        ⭐ {product.rating}
        <span className="reviews">
          ({product.reviews})
        </span>
      </p>

      <div className="price">
        <span className="new">
          ₹{product.price}
        </span>

        <span className="old">
          ₹{product.oldPrice}
        </span>
      </div>

      <div className="buttons">
        <button
          className="cart"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>

        <button
          className="view"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          View Details
        </button>
      </div>

      <button
        className="compare-btn"
        onClick={() => handleCompare(product)}
      >
        {compareProducts.find((p) => p.id === product.id)
          ? "✓ Selected"
          : "Compare"}
      </button>
    </div>
  );
}

export default ProductCard;