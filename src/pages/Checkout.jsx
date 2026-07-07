import { useNavigate } from "react-router-dom";
import "../styles/Checkout.css";

function Checkout({ cartItems, setCartItems }) {
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function placeOrder() {
    setCartItems([]);
    navigate("/order-success");
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-container">
        <div className="shipping-form">
          <h2>Shipping Details</h2>

          <input type="text" placeholder="Full Name" />

          <input type="email" placeholder="Email" />

          <input type="text" placeholder="Phone Number" />

          <textarea placeholder="Delivery Address"></textarea>

          <select>
            <option>Cash on Delivery</option>
            <option>Credit Card</option>
            <option>UPI</option>
          </select>
        </div>

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

          <h2>Total: ₹{total}</h2>

          <button onClick={placeOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;