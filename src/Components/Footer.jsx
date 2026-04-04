import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
// import logo from './CuraLinkLogo.png'; // If needed for branding

function Footer() {
  // Get the current year dynamically for the copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footerContainer">
      <div className="footerContentWrapper">
        {/* Visual Line Divider at the top (Clones the line border effect) */}
        <div className="lineDividerTop"></div>

        {/* Left side brand name text (Vertical Text) */}
        <p className="sideBrandText">www.curalink.com</p>

        {/* Contact Information */}
        <div className="contactSection">
          <p className="contactText">
            Reach out:{" "}
            <a href="mailto:hello@curalink.com" className="contactEmail">
              hello@curalink.com
            </a>
          </p>
        </div>

        {/* Follow Us Header (Center) */}
        <h4 className="followUsText">Follow Us</h4>

        {/* Social Media Icons */}
        <div className="socialIcons">

          <Link
            to="https://www.youtube.com/"
            className="socialIconLink"
            aria-label="CuraLink on YouTube"
          >
            <i className="fa-brands fa-youtube"></i>
          </Link>

          <Link
            to="https://www.linkedin.com/"
            className="socialIconLink"
            aria-label="CuraLink on LinkedIn"
          >
            <i className="fa-brands fa-linkedin-in"></i>
          </Link>

          <Link
            to="https://www.instagram.com/"
            className="socialIconLink"
            aria-label="CuraLink on Instagram"
          >
            <i className="fa-brands fa-instagram"></i>
          </Link>
        </div>

        {/* --- Bottom Information Bar --- */}
        <div className="bottomBar">
          <p className="copyrightText">
            &copy; COPYRIGHT {currentYear} | CURALINK LLC
          </p>
          <p className="builtByText">
            Crafted with ☕ and all the sleepless efforts
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
