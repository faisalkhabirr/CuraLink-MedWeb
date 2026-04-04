import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  return (
    <section className="heroSectionContainer">
      <div className="heroContentWrapper">

        {/* --- Left Column: Text and Buttons --- */}
        <div className="heroTextColumn">
          <p className="statusPill">Simple, trusted medicine information</p>

          <h1 className="heroTitle">
            Know Your <span className="highlightText">Medicine</span>, Live Healthier Every Day.
          </h1>

          <p className="heroDescription">
            CuraLink helps you understand what you're taking, why you're taking it, and how to use it safely with clear explanations of uses, dosage, side effects, and precautions.
          </p>

          <div className="heroActions">
            <Link to="/get-started" className="btnPrimary">
              Get Started →
            </Link>
          </div>

          <div className="heroFootnotes">
            <p className="footnoteItem">Not medical advice</p>
            <p className="footnoteItem">Always speak with your doctor or pharmacist before changing any medicine.</p>
          </div>
        </div>

        <div className="heroCardColumn">
          <div className="medicineSnapshotCard">
            <div className="cardImageWrapper">

              <div className="cardOverlayContent">
                <h2 className="cardTitle">Pharmaceutical Guide</h2>
                <p className="cardSubtitle">
                  Quickly see what a medicine is used for, how to take it, and what to watch out for.
                </p>

                <div className="keyChecks">
                  <div className="keyCheckGroup">
                    <span className="keyCheckLabel">Common uses</span>
                    <p className="keyCheckList">Pain · Fever · Allergy</p>
                  </div>
                  <div className="keyCheckGroup">
                    <span className="keyCheckLabel">Key checks</span>
                    <p className="keyCheckList">Dosage · Side effects</p>
                  </div>
                </div>

                <p className="cardFooterStatus">
                  <span className="statusDot"></span> Information written for real people not doctors only.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;