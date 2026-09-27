import React from 'react';
import './WhatWeDo.css'; // Ensure this CSS file exists

// Feature cards are informational only: there is no per-feature detail page,
// so they deliberately do not navigate anywhere (they used to be links that
// all pointed at "/", which did nothing on the home page).
const curaLinkFeatures = [
  {
    title: "Simplified Drug Information",
    description: "We translate complex medical jargon into clear, easy-to-understand language so you know exactly what your medications do.",
  },
  {
    title: "Symptom to Treatment Mapping",
    description: "Lists everyday symptoms and conditions the medication targets - an at-a-glance summary of the drug's main goals.",
  },
  {
    title: "Side Effects, Explained",
    description: "Every answer separates common side effects from serious reactions in plain language, so you know what to watch for and when to call your doctor.",
  },
  {
    title: "Actionable Next Steps",
    description: `Points you to the right type of clinician for follow-up (e.g. a General Practitioner) and lists specific "seek urgent care" warning signs.`,
  },
  {
    title: "Legal & Ethical Integrity",
    description: "Every answer is framed as educational and carries a fixed medical disclaimer, prioritizing professional consultation over self-diagnosis.",
  },
  {
    title: "Comprehensive Safety Guardrails",
    description: "Each answer distinguishes manageable side effects from severe adverse reactions, lists contraindications such as pre-existing kidney or liver conditions, and states dosage limits so you understand the boundaries of safe use.",
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
            <div key={index} className="featureCard">
              <h3 className="cardTitle" id='whatWeDoCT'>{feature.title}</h3>
              <p className="cardDescription">{feature.description}</p>
            </div>
          ))}

        </div>
      </div>

    </section>
  );
}

export default WhatWeDoSection;