import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { API_BASE_URL, apiFetch } from "./utils/api";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";

function ProductDetailsWrapper({ products, addToCart, toggleWishlist }) {
  const { id } = useParams();
  return (
    <ProductDetails
      key={id}
      products={products}
      addToCart={addToCart}
      toggleWishlist={toggleWishlist}
    />
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("smartcommerce_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error("Failed to restore cart from localStorage:", err);
    }
    return [];
  });

  const [showAI, setShowAI] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [compareProducts, setCompareProducts] = useState([]);

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem("smartcommerce_wishlist");
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error("Failed to restore wishlist from localStorage:", err);
    }
    return [];
  });

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    try {
      localStorage.setItem("smartcommerce_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem("smartcommerce_wishlist", JSON.stringify(wishlistItems));
    } catch (err) {
      console.error("Failed to save wishlist to localStorage:", err);
    }
  }, [wishlistItems]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch("/api/products");
        const savedWishlistStr = localStorage.getItem("smartcommerce_wishlist");
        let currentWishlist = [];
        try {
          if (savedWishlistStr) currentWishlist = JSON.parse(savedWishlistStr) || [];
        } catch {
          currentWishlist = [];
        }
        const syncedProducts = data.map((p) => ({
          ...p,
          favorite: currentWishlist.some((w) => w.id === p.id),
        }));
        setProducts(syncedProducts);
      } catch (err) {
        console.error(err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      p.id === product.id ? { ...p, favorite: !exists } : p,
    );

    setProducts(updated);
  }

  function handleCompare(product) {
    const exists = compareProducts.find((p) => p.id === product.id);

    if (exists) {
      setCompareProducts(compareProducts.filter((p) => p.id !== product.id));
      return;
    }

    if (compareProducts.length >= 2) {
      showToast("You can compare only two products at a time.");
      return;
    }
    setCompareProducts([...compareProducts, product]);
  }

  const filteredProducts = products.filter((product) => {
    const searchMatch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All" || product.category === selectedCategory;
    return searchMatch && categoryMatch;
  });

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "20px",
          fontWeight: "500",
          color: "#2563eb",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        🛍️ Loading SmartCommerce products...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          gap: "14px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h2 style={{ color: "#ef4444" }}>⚠️ {error}</h2>
        <p style={{ color: "#666" }}>
          Ensure the backend server is running at <code>{API_BASE_URL}</code>.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 24px",
            background: "#2563eb",
            color: "white",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#1e293b",
            color: "white",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 9999,
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ℹ️ {toastMessage}
        </div>
      )}
      <Navbar
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
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
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/product/:id"
          element={
            <ProductDetailsWrapper
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
