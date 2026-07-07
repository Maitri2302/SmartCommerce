import "../styles/Navbar.css";
import { NavLink } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaUserCircle } from "react-icons/fa";

function Navbar({ search, setSearch, cartCount, wishlistCount }) {
  return (
    <nav className="navbar">
      <div className="logo">🛍️ SmartCommerce</div>

      <input
        className="search"
        type="text"
        placeholder="Search Products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>

      <div className="nav-icons">
        <div className="wishlist-container">
          <NavLink to="/wishlist">
            <FaHeart />
          </NavLink>

          {wishlistCount > 0 && (
            <span className="wishlist-badge">{wishlistCount}</span>
          )}
        </div>

        <div className="cart-container">
          <NavLink to="/cart">
            <FaShoppingCart />
          </NavLink>

          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>

        <NavLink to="/profile">
          <FaUserCircle />
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
