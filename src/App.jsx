import { useState } from "react";
import Navbar from "./components/Navbar";
import productsData from "./data/products";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  const [products, setProducts] = useState(productsData);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [showAI, setShowAI] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [compareProducts, setCompareProducts] = useState([]);

  function addToCart() {
    setCartCount((prev) => prev + 1);
  }

  function toggleWishlist(id) {
    const updated = products.map((product) =>
      product.id === id
        ? { ...product, favorite: !product.favorite }
        : product
    );

    setProducts(updated);
  }

  function handleCompare(product) {
    const exists = compareProducts.find((p) => p.id === product.id);

    if (exists) {
      setCompareProducts(compareProducts.filter((p) => p.id !== product.id));
      return;
    }

    if (compareProducts.length < 2) {
      setCompareProducts([...compareProducts, product]);
    }
  }

  const filteredProducts = products.filter((product) => {
    const searchMatch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return searchMatch && categoryMatch;
  });

  return (
    <BrowserRouter>
      <Navbar
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              products={products}
              filteredProducts={filteredProducts}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              showAI={showAI}
              setShowAI={setShowAI}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              compareProducts={compareProducts}
              handleCompare={handleCompare}
            />
          }
        />

        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;