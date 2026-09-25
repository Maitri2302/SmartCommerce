import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Checkout.css";

function Checkout({ cartItems, setCartItems }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address?.street || "",
    city: user?.address?.city || "",
    postalCode: user?.address?.postalCode || "",
    paymentMethod: "Cash on Delivery",
  });
  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <h1>Your cart is empty.</h1>
          <p style={{ margin: "16px 0", color: "#64748b" }}>
            Add some items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate("/products")}
            style={{
              padding: "10px 24px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Explore Products
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 99 : 0;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + gst;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (!formData.address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.images?.[0] || item.image || "",
      })),
      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      },
      paymentMethod: formData.paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: shipping,
      taxPrice: gst,
      totalPrice: total,
    };

    try {
      setPlacingOrder(true);
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order.");
      }

      setCartItems([]);
      navigate("/order-success", { state: { order: data.order } });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error placing order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {error && (
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto 20px",
            padding: "12px 18px",
            background: "#fef2f2",
            color: "#dc2626",
            borderRadius: "10px",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      <div className="checkout-container">
        <form onSubmit={handlePlaceOrder} className="shipping-form">
          <h2>Shipping Details</h2>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name *"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number *"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <textarea
            name="address"
            placeholder="Street / Flat / Delivery Address *"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />

            <input
              type="text"
              name="postalCode"
              placeholder="Postal / PIN Code"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>

          <label style={{ fontSize: "14px", fontWeight: "600", marginTop: "10px", display: "block" }}>
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="Credit Card">Credit Card</option>
          </select>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>

          {cartItems.map((item) => (
            <div className="summary-item" key={item.id}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <hr />

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", color: "#64748b" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Shipping:</span>
              <span>₹{shipping}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>GST (18%):</span>
              <span>₹{gst}</span>
            </div>
          </div>

          <hr />

          <h2>Total: ₹{total}</h2>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            style={{
              cursor: placingOrder ? "not-allowed" : "pointer",
              opacity: placingOrder ? 0.7 : 1,
            }}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
