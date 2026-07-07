import "../styles/Cart.css";

function Cart({
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shipping = subtotal > 0 ? 99 : 0;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + gst;

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h1>🛒 Your Cart is Empty</h1>
        <p>Add some amazing products to get started.</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>🛒 Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-card" key={item.id}>
              <img src={item.image} alt={item.name} />

              <div className="cart-info">
                <h2>{item.name}</h2>

                <p>₹{item.price}</p>

                <div className="quantity">
                  <button onClick={() => decreaseQuantity(item.id)}>−</button>

                  <span>{item.quantity}</span>

                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </div>

                <h3>Total ₹{item.price * item.quantity}</h3>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="summary">
          <h2>Order Summary</h2>

          <p>
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </p>

          <p>
            <span>Shipping</span>
            <span>₹{shipping}</span>
          </p>

          <p>
            <span>GST (18%)</span>
            <span>₹{gst}</span>
          </p>

          <hr />

          <h3>
            <span>Total</span>
            <span>₹{total}</span>
          </h3>

          <button className="checkout-btn">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
