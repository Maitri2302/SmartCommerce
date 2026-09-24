import "../styles/Wishlist.css";

function Wishlist({ wishlistItems, addToCart, toggleWishlist }) {
  if (wishlistItems.length === 0) {
    return (
      <div className="empty-wishlist">
        <h1>❤️ Your Wishlist is Empty</h1>
        <p>Save products you love for later.</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1>❤️ My Wishlist</h1>

      {wishlistItems.map((item) => (
        <div className="wishlist-item" key={item.id}>
          <img src={item.images?.[0] || item.image} alt={item.name} />

          <div className="wishlist-info">
            <h2>{item.name}</h2>

            <p>₹{item.price}</p>

            <div className="wishlist-buttons">
              <button className="cart-btn" onClick={() => addToCart(item)}>
                Add to Cart
              </button>

              <button
                className="remove-btn"
                onClick={() => toggleWishlist(item)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Wishlist;
