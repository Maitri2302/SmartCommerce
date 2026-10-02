import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";

import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
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

function AppRoutes() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [cartItems, setCartItems] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [compareProducts, setCompareProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    const handleLogout = () => {
      setCartItems([]);
      setWishlistItems([]);
      try {
        localStorage.removeItem("smartcommerce_cart");
        localStorage.removeItem("smartcommerce_wishlist");
      } catch (err) {
        console.error("Failed to clear cart/wishlist storage on logout:", err);
      }
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("auth:expired", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("auth:expired", handleLogout);
    };
  }, []);

  // Sync user-specific cart and wishlist from MongoDB upon authentication
  useEffect(() => {
    const loadUserCartAndWishlist = async () => {
      if (!isAuthenticated || !token) {
        setCartItems([]);
        setWishlistItems([]);
        return;
      }
      try {
        const [cartRes, wishRes] = await Promise.all([
          apiFetch("/api/users/cart"),
          apiFetch("/api/users/wishlist"),
        ]);
        setCartItems(cartRes.cart || []);
        setWishlistItems(wishRes.wishlist || []);
      } catch (err) {
        console.error("Failed to load user cart/wishlist from MongoDB:", err);
      }
    };

    loadUserCartAndWishlist();
  }, [token, isAuthenticated]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiFetch("/api/products");
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  async function addToCart(product) {
    if (!isAuthenticated && !token) {
      showToast("Please sign in to add items to your cart.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    try {
      const data = await apiFetch("/api/users/cart", {
        method: "PUT",
        body: JSON.stringify({
          productId: product.id || product.productId || product._id,
          quantity: 1,
          action: "add",
        }),
      });
      setCartItems(data.cart || []);
      showToast(`Added ${product.name} to cart`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      showToast(err.message || "Failed to update cart");
    }
  }

  async function increaseQuantity(id) {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const targetQty = item.quantity + 1;

    try {
      const data = await apiFetch("/api/users/cart", {
        method: "PUT",
        body: JSON.stringify({
          productId: id,
          quantity: targetQty,
          action: "set",
        }),
      });
      setCartItems(data.cart || []);
    } catch (err) {
      console.error("Failed to increase quantity:", err);
      showToast(err.message || "Failed to update quantity");
    }
  }

  async function decreaseQuantity(id) {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    const targetQty = item.quantity - 1;

    try {
      if (targetQty <= 0) {
        const data = await apiFetch(`/api/users/cart/${id}`, {
          method: "DELETE",
        });
        setCartItems(data.cart || []);
      } else {
        const data = await apiFetch("/api/users/cart", {
          method: "PUT",
          body: JSON.stringify({
            productId: id,
            quantity: targetQty,
            action: "set",
          }),
        });
        setCartItems(data.cart || []);
      }
    } catch (err) {
      console.error("Failed to decrease quantity:", err);
      showToast(err.message || "Failed to update quantity");
    }
  }

  async function removeFromCart(id) {
    try {
      const data = await apiFetch(`/api/users/cart/${id}`, {
        method: "DELETE",
      });
      setCartItems(data.cart || []);
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      showToast(err.message || "Failed to remove item");
    }
  }

  async function toggleWishlist(product) {
    if (!isAuthenticated && !token) {
      showToast("Please sign in to save items to your wishlist.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    const pId = product.id || product.productId || product._id;
    const exists = wishlistItems.some((item) => item.id === pId);

    try {
      let data;
      if (exists) {
        data = await apiFetch(`/api/users/wishlist/${pId}`, {
          method: "DELETE",
        });
      } else {
        data = await apiFetch(`/api/users/wishlist/${pId}`, {
          method: "POST",
        });
      }

      const updatedWishlist = data.wishlist || [];
      setWishlistItems(updatedWishlist);
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      showToast(err.message || "Failed to update wishlist");
    }
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

  const productsWithFavorite = products.map((product) => ({
    ...product,
    favorite: wishlistItems.some(
      (w) => (w.id || w._id) === (product.id || product._id)
    ),
  }));

  const filteredProducts = productsWithFavorite.filter((product) => {
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
    <>
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
              products={productsWithFavorite}
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
              products={productsWithFavorite}
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
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
