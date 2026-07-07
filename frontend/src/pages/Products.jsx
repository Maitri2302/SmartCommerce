import ProductCard from "../components/ProductCard";
import "../styles/FeaturedProducts.css";

function Products({
  products,
  addToCart,
  toggleWishlist,
  compareProducts,
  handleCompare,
}) {
  return (
    <section className="featured">
      <h1>All Products</h1>

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
              compareProducts={compareProducts}
              handleCompare={handleCompare}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default Products;
