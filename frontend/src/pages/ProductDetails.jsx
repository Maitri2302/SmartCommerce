import { useParams, Link } from "react-router-dom";
import "../styles/ProductDetails.css";
import CustomerReviews from "../components/CustomerReviews";
import { useState } from "react";
import ProductSpecifications from "../components/ProductSpecifications";
import RelatedProducts from "../components/RelatedProducts";

function ProductDetails({ products, addToCart, toggleWishlist }) {
  const { id } = useParams();

  const product = products.find((p) => p.id === Number(id));

  const [userSelectedImage, setUserSelectedImage] = useState(null);
  const [liveRating, setLiveRating] = useState(product?.rating || 0);
  const [liveReviews, setLiveReviews] = useState(product?.reviews || product?.numReviews || 0);

  const handleReviewUpdate = ({ rating, reviews }) => {
    if (rating !== undefined) setLiveRating(rating);
    if (reviews !== undefined) setLiveReviews(reviews);
  };

  const selectedImage =
    userSelectedImage || product?.images?.[0] || product?.image || "";

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h1>⚠️ Product Not Found</h1>
        <p style={{ margin: "16px 0", color: "#64748b" }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <Link to="/products">
          <button
            style={{
              padding: "10px 24px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Browse All Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="details-container">
        <div className="image-section">
          <img className="main-image" src={selectedImage} alt={product.name} />

          <div className="thumbnail-container">
            {(product.images?.length ? product.images : (product.image ? [product.image] : [])).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                onClick={() => setUserSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="info-section">
          <h1>{product.name}</h1>

          <h3>
            ⭐ {liveRating} ({liveReviews} Reviews)
          </h3>

          <h2>₹{product.price}</h2>

          <p className="old-price">₹{product.oldPrice}</p>

          <p className="discount">{product.discount}% OFF</p>

          <div className="ai-box">
            <h3>🤖 AI Recommendation</h3>

            <p>
              Highly recommended based on popularity, customer reviews, and
              value for money.
            </p>
          </div>

          <h3>Description</h3>

          <p>
            Premium quality product built using the latest technology, offering
            outstanding performance, durability, and excellent user experience.
          </p>

          <div className="buttons">
            <button className="cart-btn" onClick={() => addToCart(product)}>
              Add to Cart
            </button>

            <button
              className="wish-btn"
              onClick={() => toggleWishlist(product)}
            >
              Wishlist
            </button>
          </div>
        </div>
      </div>
      <ProductSpecifications specifications={product.specifications || {}} />
      <CustomerReviews productId={product.id || product.productId || product._id} onReviewUpdate={handleReviewUpdate} />
      <RelatedProducts products={products} currentProduct={product} />
    </div>
  );
}

export default ProductDetails;
