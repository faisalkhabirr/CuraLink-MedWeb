import React from 'react';
import './FindOutSection.css';
import { Link } from 'react-router-dom';


function FindOutSection() {
  return (
    // Renamed className
    <section className="findOutSectionContainer"> 
    
      <div className="findOutContentWrapper">
        
        {/* --- Main Content Block --- */}
        <div className="findOutTextBlock">
          <h2 className="findOutTitle">
            Ready to Dive Deeper into <span className="highlightTeal">Medication Clarity?</span>
          </h2>
          <p className="findOutDescription">
            We believe true empowerment comes from complete understanding. Explore our full methodology report to see the technical details of how we source, verify, and simplify over 4,900 medications.
          </p>
          
          <div className="findOutActions">
            <Link to="/find" className="btnPrimaryFindOut">
              Download Full Report (PDF)
            </Link>
            <Link to="/services" className="btnSecondaryFindOut">
              View All Services
            </Link>
          </div>
        </div>
        
        {/* --- Highlight Box --- */}
        <div className="findOutHighlightBox">
          <div className="iconWrapper">
            {/* Using a solid-style icon for professional look (requires Font Awesome) */}
            <i className="fa-solid fa-square-check"></i>
          </div>
          <p className="boxTitle">Trusted by 5,000+ Users</p>
          <p className="boxSubtitle">
            Start searching your medications and get personalized safety checks immediately.
          </p>
          <Link to="/get-started" className="boxButton">
            Get Started Free →
          </Link>
        </div>
        
      </div>
    </section>
  );
}

export default FindOutSection;