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
            We believe true empowerment comes from complete understanding. Search any medication or symptom to see how CuraLink explains what it is, how to take it, its side effects, and its warnings in plain language - AI-assisted information, not a substitute for professional medical advice.
          </p>

          <div className="findOutActions">
            <Link to="/get-started" className="btnPrimaryFindOut">
              Search a Medication
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
          <p className="boxTitle">Understand Your Medication</p>
          <p className="boxSubtitle">
            Search any medication for AI-assisted, plain-language information on how to take it, side effects, and warnings.
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