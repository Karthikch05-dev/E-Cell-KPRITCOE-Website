import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand-link">
        <img
          src="/images/kprit-logo.png"
          alt="KPRIT College of Engineering"
          className="kprit-logo"
        />

        <span className="brand-divider">×</span>

        <img
          src="/images/nec-logo.png"
          alt="National Entrepreneurship Challenge"
          className="nec-logo"
        />
      </Link>

      <nav className="navbar-menu">
        <Link to="/" className="nav-link active">
          Home
        </Link>

        <Link to="/events" className="nav-link">
          Events
        </Link>

        <Link to="/about" className="nav-link">
          About Us
        </Link>

        <Link to="/register" className="register-button">
          Register Now
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;