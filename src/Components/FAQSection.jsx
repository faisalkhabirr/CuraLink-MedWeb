import React, { useState } from "react";
import "./FAQSection.css"; // Ensure this CSS file exists

// Define the FAQ data for CuraLink
const faqData = [
  {
    question: "What makes CuraLink different from searching on Google?",
    answer:
      "CuraLink translates complex pharmaceutical literature into simple, clear language. Our content focuses on practical usage, common side effects, and clear warnings, providing curated, reliable information without requiring you to sift through medical journals or sponsored results.",
  },
  {
    question: "Is the information provided by CuraLink medical advice?",
    answer:
      "No. CuraLink provides educational and informational content. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with your doctor, pharmacist, or another qualified healthcare provider before making any health decisions.",
  },
  {
    question: "How do you ensure the accuracy of drug information?",
    answer:
      "Our information is sourced from reputable pharmaceutical databases and regulatory bodies (like the FDA). The content is then simplified and reviewed by a team including medical writers and pharmacists to maintain accuracy and clarity.",
  },
  {
    question:
      "Can CuraLink track my prescriptions or interact with my pharmacy?",
    answer:
      "CuraLink is currently an informational and educational tool. We do not track personal prescriptions or interact directly with pharmacies. We focus solely on providing reliable, clear information about medications you search for.",
  },
  {
    question:
      "Does CuraLink sell any medications or advertise for pharmaceutical companies?",
    answer:
      "No. CuraLink is an independent platform. We do not sell medications, and our core informational content is kept free from pharmaceutical advertising to ensure unbiased information.",
  },
];

function FAQSection() {
  // State to track the index of the currently open FAQ item
  // null means all are closed
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    // If the clicked item is already open, close it (set to null).
    // Otherwise, open the clicked item (set to its index).
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faqSectionContainer">
      <h1 className="faqTitle">Frequently asked questions</h1>

      <div className="faqList">
        {faqData.map((item, index) => (
          <div key={index} className="faqItem">
            {/* Question Bar (Clickable) */}
            <div
              className="faqQuestion"
              onClick={() => toggleFAQ(index)}
              role="button"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <h2 className="questionText">{item.question}</h2>
              <div className="toggleIcon">
                {/* Plus (+) icon if closed, Minus (-) icon if open */}
                {openIndex === index ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#253d49"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#253d49"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                )}
              </div>
            </div>

            {/* Answer Content (Conditional Display) */}
            <div
              className={`faqAnswerContent ${
                openIndex === index ? "active" : ""
              }`}
              id={`faq-answer-${index}`}
            >
              <p className="answerText">{item.answer}</p>
            </div>

            {/* The horizontal rule separating items */}
            <hr className="faqDivider" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQSection;
