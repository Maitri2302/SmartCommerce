import { useNavigate } from "react-router-dom";
import "../styles/RelatedProducts.css";

function RelatedProducts({ products, currentProduct }) {
  const navigate = useNavigate();

  const related = products
    .filter(
      (product) =>
        product.category === currentProduct.category &&
        product.id !== currentProduct.id
    )
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="related-products">
      <h2>You May Also Like</h2>

      <div className="related-grid">
        {related.map((product) => (
          <div
            key={product.id}
            className="related-card"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <img src={product.images?.[0] || product.image} alt={product.name} />

            <h3>{product.name}</h3>

            <p>₹{product.price}</p>

            <span>⭐ {product.rating}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RelatedProducts;