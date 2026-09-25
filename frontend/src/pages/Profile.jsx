import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

function Profile() {
  const { user, token, isAuthenticated, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "India",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setOrdersLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [token, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="profile-page not-logged-in">
        <div className="profile-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h1>👤 Account Access</h1>
          <p style={{ margin: "16px 0 24px", color: "#64748b", fontSize: "16px" }}>
            Sign in to view your profile, track your orders, and manage your delivery addresses.
          </p>
          <Link to="/login">
            <button
              style={{
                padding: "12px 30px",
                background: "#2563eb",
                color: "white",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              Sign In / Register
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEditClick = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "India",
    });
    setIsEditing(true);
    setStatusMessage("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage("");

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
      });
      setIsEditing(false);
      setStatusMessage("Profile updated successfully!");
    } catch (err) {
      setStatusMessage(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const hasAddress =
    user?.address?.street ||
    user?.address?.city ||
    user?.address?.state ||
    user?.address?.postalCode;

  return (
    <div className="profile-page">
      {statusMessage && (
        <div
          style={{
            background: "#dcfce7",
            color: "#15803d",
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "14px",
          }}
        >
          {statusMessage}
        </div>
      )}

      <div className="profile-card">
        <h1>👤 My Profile</h1>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: "14px", maxWidth: "500px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 9876543210"
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{ padding: "10px 20px", background: "#2563eb", color: "white", borderRadius: "8px" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ padding: "10px 20px", background: "#94a3b8", color: "white", borderRadius: "8px" }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p style={{ margin: "8px 0" }}>
              <strong>Name:</strong> {user?.name}
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>Email:</strong> {user?.email}
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>Phone:</strong> {user?.phone || "Not specified"}
            </p>
            <p style={{ margin: "8px 0" }}>
              <strong>Member Since:</strong>{" "}
              {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2026"}
            </p>
          </div>
        )}
      </div>

      <div className="orders-card">
        <h2>📦 My Orders</h2>
        {ordersLoading ? (
          <p style={{ color: "#64748b" }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "#64748b", marginBottom: "14px" }}>
              You haven't placed any orders yet.
            </p>
            <Link to="/products">
              <button
                style={{
                  padding: "8px 20px",
                  background: "#2563eb",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-item" key={order._id || order.orderId}>
              <div>
                <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>
                  {order.orderItems?.map((i) => `${i.name} × ${i.quantity}`).join(", ") || "Order Items"}
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b" }}>
                  Order ID: #{order.orderId} • {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    background: "#e0f2fe",
                    color: "#0369a1",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  {order.status}
                </span>
                <h3 style={{ fontSize: "16px", color: "#2563eb" }}>₹{order.totalPrice}</h3>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="address-card">
        <h2>📍 Saved Delivery Address</h2>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: "12px", maxWidth: "500px" }}>
            <input
              type="text"
              placeholder="Street / Flat / Area"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input
                type="text"
                placeholder="Postal / PIN Code"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "fit-content",
                padding: "10px 20px",
                background: "#2563eb",
                color: "white",
                borderRadius: "8px",
                marginTop: "6px",
              }}
            >
              {saving ? "Saving..." : "Update Address"}
            </button>
          </form>
        ) : hasAddress ? (
          <p style={{ lineHeight: "1.7", color: "#334155" }}>
            {user?.address?.street && <>{user.address.street}<br /></>}
            {user?.address?.city && <>{user.address.city}, </>}
            {user?.address?.state && <>{user.address.state} </>}
            {user?.address?.postalCode && <>- {user.address.postalCode}<br /></>}
            {user?.address?.country || "India"}
          </p>
        ) : (
          <p style={{ color: "#64748b" }}>
            No delivery address saved yet. Click <strong>Edit Profile</strong> to set up your default shipping address.
          </p>
        )}
      </div>

      <div className="account-card">
        <h2>⚙️ Account Actions</h2>
        {!isEditing && (
          <button type="button" onClick={handleEditClick}>
            Edit Profile & Address
          </button>
        )}
        <button type="button" className="logout" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
