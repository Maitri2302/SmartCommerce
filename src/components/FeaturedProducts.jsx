import ProductCard from "./ProductCard";
import "../styles/FeaturedProducts.css";

function FeaturedProducts({
  products,
  addToCart,
  toggleWishlist,
  setSelectedProduct,
  compareProducts,
  handleCompare,
}) {
  return (
    <section className="featured">
      <h1>🔥 Featured Products</h1>

      <div className="products-grid">
        {products.length === 0 ? (
          <h2>No products found.</h2>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              setSelectedProduct={setSelectedProduct}
              compareProducts={compareProducts}
              handleCompare={handleCompare}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
