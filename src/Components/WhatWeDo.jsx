import React from 'react';
import './WhatWeDo.css'; // Ensure this CSS file exists
import { Link } from 'react-router-dom';

// Placeholder for feature data
const curaLinkFeatures = [
  {
    title: "Simplified Drug Information",
    description: "We translate complex medical jargon into clear, easy-to-understand language so you know exactly what your medications do.",
    link: "/"
  },
  {
    title: "Symptom to Treatment Mapping",
    description: "Lists everyday symptoms the medication targets. A at a glance summary of the drug’s main goals.",
    link: "/"
  },
  {
    title: "Side Effect Tracker",
    description: "Log and monitor any side effects and easily share the data with your healthcare provider during your next visit.",
    link: "/"
  },
  {
    title: "Actionable Next Steps",
    description: `Directs the user to the correct healthcare provider (e.g., General Practitioner) for follow-up and lists specific "Urgent Care" triggers.`,
    link: "/"
  },
  {
    title: "Legal & Ethical Integrity",
    description: "Ensures the information is framed as educational, protecting both the platform and the user by prioritizing professional consultation.",
    link: "/"
  },
  {
    title: "Comprehensive Safety Guardrails",
    description: "The Risk Profile provides a critical distinction between manageable side effects, such as nausea, and severe adverse reactions like liver damage. This is bolstered by clear Contraindications that alert individuals with pre-existing kidney or liver conditions to avoid the medication. By emphasizing strict Dosage Discipline, the platform ensures users understand the boundaries of safe consumption to prevent life-threatening toxicity.",
    link: "/"
  },
];

function WhatWeDoSection() {
  return (
    <section className="whatWeDoContainer">

      {/* --- Left Column: Title and Background --- */}
      <div className="leftColumn show">
        <div className="leftContent">
          <h2 className="sectionTitle">What We Do?</h2>
          <p className="sectionSubtitle">Empowering health choices through clarity and information.</p>
        </div>
      </div>

      {/* --- Right Column: Scrollable Features --- */}
      <div className="rightColumnScroll">
        <div className="featureList">

          {curaLinkFeatures.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="featureCard"
            >
              <h3 className="cardTitle" id='whatWeDoCT'>{feature.title}</h3>
              <p className="cardDescription">{feature.description}</p>
              {/* <div className="cardLink">View Details →</div> */}
            </Link>
          ))}

        </div>
      </div>

    </section>
  );
}

export default WhatWeDoSection;