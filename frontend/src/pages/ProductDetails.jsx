import { useParams } from "react-router-dom";
import "../styles/ProductDetails.css";
import CustomerReviews from "../components/CustomerReviews";
import { useState } from "react";
import ProductSpecifications from "../components/ProductSpecifications";
import RelatedProducts from "../components/RelatedProducts";

function ProductDetails({ products, addToCart, toggleWishlist }) {
  const { id } = useParams();

  const product = products.find((p) => p.id === Number(id));

  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || product?.image || "",
  );

  if (!product) {
    return <h1>Product not found.</h1>;
  }

  return (
    <div className="details-page">
      <div className="details-container">
        <div className="image-section">
          <img className="main-image" src={selectedImage} alt={product.name} />

          <div className="thumbnail-container">
            {(product.images ?? [product.image]).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`thumbnail ${selectedImage === img ? "active" : ""}`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="info-section">
          <h1>{product.name}</h1>

          <h3>
            ⭐ {product.rating} ({product.reviews} Reviews)
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
      <CustomerReviews />
      <RelatedProducts products={products} currentProduct={product} />
    </div>
  );
}

export default ProductDetails;
