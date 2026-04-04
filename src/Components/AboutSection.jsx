import React from 'react';
import './AboutSection.css';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import NavMbl from './NavMbl';
import Footer from './Footer';

function AboutSection() {
  return (
    <section className="aboutSectionContainer">
        <NavBar/> <NavMbl/> 
      <div className="aboutContentWrapper">
        
        {/* --- Top Header & Mission Statement --- */}
        <div className="missionHeader">
          <p className="subHeading">OUR MISSION</p>
          <h2 className="aboutTitle">
            Bridging the gap between <span className="highlightTeal">pharmaceutical complexity</span> and patient understanding.
          </h2>
        </div>
        
        {/* --- Two-Column Core Content --- */}
        <div className="coreContentLayout">
          
          {/* Left Column: Text & Facts */}
          <div className="aboutTextColumn">
            <p className="mainNarrative">
              CuraLink was founded by a team of technologists and healthcare professionals who recognized a critical need for clear, unbiased, and actionable drug information. Rather than simply presenting data, we translate it—using advanced semantic analysis to convert complex medical jargon into simple, understandable language. Our platform empowers you to make informed decisions and take control of your health journey.
            </p>
            <p className="secondaryNarrative">
              We believe that informed patients make better health decisions. That's why every piece of information is sourced from verified regulatory databases and rigorously reviewed by licensed pharmacists, ensuring you receive safety-critical advice without the clutter of sponsored content.
            </p>

          </div>
          
          {/* Right Column: Visual/Fact Box */}
          <div className="aboutVisualColumn">
            <div className="factBox">
              <div className="factItem">
                <span className="factNumber">98%</span>
                <p className="factLabel">Accuracy Rating from Pharmacist Reviews</p>
              </div>
              <div className="factItem">
                <span className="factNumber">4.9k</span>
                <p className="factLabel">Medications in Our Simplified Database</p>
              </div>
              <div className="factItem">
                <span className="factNumber">2025</span>
                <p className="factLabel">Year Founded, Driven by Clarity</p>
              </div>
              
              {/* Image Placeholder */}
              <div className="visualPlaceholder">
                <i className="fa-solid fa-flask-vial"></i>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
      <Footer id="abtSecFooter"/>
    </section>
  );
}

export default AboutSection;