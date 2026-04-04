import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "./CuraLinkLogo.png";
import "./NavMbl.css";

function NavMbl() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const lastScroll = useRef(0);

    useEffect(() => {
    // let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll.current && currentScroll > 50) {
        setIsHidden(true);  // hide when scrolling down
      } else {
        setIsHidden(false); // show when scrolling up
      }

      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle function to open/close the menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to close the menu after a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={`NavMblContainer ${isHidden ? "hide-navbar" : ""}`}>
        
      <nav className="navbarMbl">
        <Link to="/" className="brand">
          <img src={logo} alt="CuraLink logo" style={{ width: "30px" }} />
          <span className="brand-name">CuraLink</span>
        </Link>

        <div className="menuBtn" onClick={toggleMenu}>
          {isOpen ? (
            <i className="fa-solid fa-xmark"></i> // Cross button
          ) : (
            <i className="fa-solid fa-bars-staggered"></i> // Hamburger
          )}
        </div>

        {/* Mobile menu */}

      </nav>
          <div className={`mobile-menu-drawer ${isOpen ? "is-open" : ""}`}>
          <ul className="mobile-nav-links">
            <li>
              <Link to="/" onClick={handleLinkClick}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/services" onClick={handleLinkClick}>
                Services
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={handleLinkClick}>
                About Us
              </Link>
            </li>
            {/* <li>
              <Link to="/faq" onClick={handleLinkClick}>
                FAQ
              </Link>
            </li> */}
          </ul>

          <div className="mobile-auth-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {token ? (
              <>
                <button
                  className="btn-quote"
                  style={{ border: 'none', cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}
                  onClick={() => {
                    handleLogout();
                    handleLinkClick();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="btn-quote"
                  style={{ textAlign: 'center', backgroundColor: '#e9ecef', color: '#17403f' }}
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  state={{ from: location.pathname }}
                  className="btn-quote"
                  style={{ textAlign: 'center' }}
                  onClick={handleLinkClick}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

    </div>
  );
}

export default NavMbl;
