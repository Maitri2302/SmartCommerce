import "../styles/Navbar.css";
import { FaHeart, FaShoppingCart, FaUserCircle } from "react-icons/fa";

import { Link, NavLink } from "react-router-dom";

function Navbar({ search, setSearch, cartCount }) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🛍 SmartCommerce
      </Link>

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
        <NavLink to="/wishlist">
          <FaHeart />
        </NavLink>

        <NavLink to="/cart" className="cart-container">
          <FaShoppingCart />

          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </NavLink>

        <NavLink to="/profile">
          <FaUserCircle />
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
