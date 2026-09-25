import { Link, useLocation } from "react-router-dom";
import "../styles/OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="success-page">
      <h1>🎉 Order Placed Successfully!</h1>

      {order ? (
        <div
          style={{
            background: "white",
            padding: "24px 30px",
            borderRadius: "16px",
            maxWidth: "500px",
            margin: "20px auto 30px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "#64748b" }}>Order ID:</span>
            <strong>#{order.orderId}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "#64748b" }}>Payment Method:</span>
            <strong>{order.paymentMethod}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ color: "#64748b" }}>Total Amount:</span>
            <strong style={{ color: "#2563eb", fontSize: "17px" }}>₹{order.totalPrice}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Estimated Delivery:</span>
            <span>3 - 5 Business Days</span>
          </div>
        </div>
      ) : (
        <p style={{ margin: "16px 0 24px" }}>
          Thank you for shopping with SmartCommerce. Your order is being processed.
        </p>
      )}

      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <Link to="/">
          <button>Continue Shopping</button>
        </Link>
        <Link to="/profile">
          <button style={{ background: "#111827" }}>View My Orders</button>
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccess;