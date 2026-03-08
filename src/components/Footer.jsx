import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__brand gradient-text">Shipforge</span>
        <p className="site-footer__copy">
          © {new Date().getFullYear()} Shipforge. All rights reserved.
        </p>
        <nav className="site-footer__links">
          <Link to="/pricing" className="site-footer__link">Pricing</Link>
          <Link to="/login" className="site-footer__link">Login</Link>
          <Link to="/signup" className="site-footer__link">Sign up</Link>
        </nav>
      </div>
    </footer>
  );
}
