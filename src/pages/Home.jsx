import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import CompareProducts from "../components/CompareProducts";
import AiAssistant from "../components/AiAssistant";
import QuickView from "../components/QuickView";
import Footer from "../components/Footer";

function Home({
  addToCart,
  toggleWishlist,
  selectedCategory,
  setSelectedCategory,
  filteredProducts,
  showAI,
  setShowAI,
  selectedProduct,
  setSelectedProduct,
  compareProducts,
  handleCompare,
}) {
  return (
    <>
      <Hero openAI={() => setShowAI(true)} />

      <Categories
        selected={selectedCategory}
        setSelected={setSelectedCategory}
      />

      <FeaturedProducts
        products={filteredProducts}
        addToCart={addToCart}
        toggleWishlist={toggleWishlist}
        setSelectedProduct={setSelectedProduct}
        compareProducts={compareProducts}
        handleCompare={handleCompare}
      />

      <CompareProducts products={compareProducts} />

      {showAI && <AiAssistant close={() => setShowAI(false)} />}

      <QuickView
        product={selectedProduct}
        close={() => setSelectedProduct(null)}
        addToCart={addToCart}
      />

      <Footer />
    </>
  );
}

export default Home;
