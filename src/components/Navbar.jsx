import "../styles/Navbar.css";
import { FaHeart, FaShoppingCart, FaUserCircle } from "react-icons/fa";

function Navbar({ search, setSearch, cartCount }) {
  return (
    <nav className="navbar">
      <div className="logo">🛍️ SmartCommerce</div>

      <input
        className="search"
        type="text"
        placeholder="Ask AI or Search Products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="nav-icons">
        <FaHeart />

        <div className="cart-container">
          <FaShoppingCart />

          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>

        <FaUserCircle />
      </div>
    </nav>
  );
}

export default Navbar;
