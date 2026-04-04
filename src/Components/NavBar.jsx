import React from 'react';
import './NavBar.css';
import logo from './CuraLinkLogo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };
  
  return (
    <div className='NavBarContainer'>

      <nav className="navbar">

        <Link to="/" className="brand">
          <img src={logo} alt="CuraLink logo" style={{ width: '30px' }} />
          <span className="brand-name">CuraLink</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/about">About Us</Link></li>
          {/* <li><Link to="/faq">FAQ</Link></li> */}
        </ul>

        <div className="auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {token ? (
            <>
              <button className="btn-quote" onClick={handleLogout} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" state={{ from: location.pathname }} style={{ textDecoration: 'none', color: '#17403f', fontWeight: 'bold' }}>Login</Link>
              <Link to="/register" state={{ from: location.pathname }} className="btn-quote">Sign Up</Link>
            </>
          )}
        </div>

        

    </nav>
    </div>
  )
}

export default NavBar