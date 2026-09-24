import "../styles/Wishlist.css";

function Wishlist({
  wishlistItems,
  addToCart,
  toggleWishlist,
}) {
  return (
    <div className="wishlist-page">
      <h1>❤️ My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <h2>No products in wishlist.</h2>
      ) : (
        wishlistItems.map((item) => (
          <div className="wishlist-item" key={item.id}>
            <img src={item.images?.[0] || item.image} alt={item.name} />

            <div>
              <h2>{item.name}</h2>
              <p>₹{item.price}</p>
            </div>

            <button onClick={() => addToCart(item)}>
              Add to Cart
            </button>

            <button
              onClick={() => toggleWishlist(item)}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Wishlist;