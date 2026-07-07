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
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  const [products, setProducts] = useState(productsData);
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [compareProducts, setCompareProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  function addToCart(product) {
    const exists = cartItems.find((item) => item.id === product.id);

    if (exists) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }
  }

  function increaseQuantity(id) {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decreaseQuantity(id) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(id) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  function toggleWishlist(product) {
    const exists = wishlistItems.find((item) => item.id === product.id);

    if (exists) {
      setWishlistItems(wishlistItems.filter((item) => item.id !== product.id));
    } else {
      setWishlistItems((prev) => [...prev, product]);
    }

    const updated = products.map((p) =>
      p.id === product.id ? { ...p, favorite: !p.favorite } : p,
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
      setCompareProducts((prev) => [...prev, product]);
    }
  }

  const filteredProducts = products.filter((product) => {
    const searchMatch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All" || product.category === selectedCategory;

    return searchMatch && categoryMatch;
  });

  return (
    <BrowserRouter>
      <Navbar
        search={search}
        setSearch={setSearch}
        cartCount={cartItems.length}
        wishlistCount={wishlistItems.length}
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

        <Route
          path="/products"
          element={
            <Products
              products={filteredProducts}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              compareProducts={compareProducts}
              handleCompare={handleCompare}
              setSelectedProduct={setSelectedProduct}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <Cart
              cartItems={cartItems}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              removeFromCart={removeFromCart}
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <Wishlist
              wishlistItems={wishlistItems}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={products}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={products}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <Checkout cartItems={cartItems} setCartItems={setCartItems} />
          }
        />

        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
