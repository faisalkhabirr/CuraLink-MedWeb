import React, { useState } from 'react';
import './FAQSectionV2.css';

// Sample data structured by Category
const faqData = {
  general: [
    { q: "What is CuraLink's main goal?", a: "CuraLink aims to simplify complex pharmaceutical information, translating medical jargon into clear, actionable advice for everyday use." },
    { q: "Is the information verified by doctors?", a: "All information is sourced from verified regulatory databases and reviewed by licensed pharmacists, ensuring accuracy and reliability." },
    { q: "Is CuraLink a substitute for a doctor?", a: "No. CuraLink provides information for educational purposes only and is never a substitute for professional medical advice, diagnosis, or treatment." },
  ],
  account: [
    { q: "How do I create an account?", a: "You can sign up using your email and password or link your Google/Apple account via the 'Get Started' button in the navigation bar." },
    { q: "What is the fee for the Pro plan?", a: "The Pro plan details are listed on the Pricing page. It offers unlimited pharmacist Q&A and enhanced tracking features." },
    { q: "Can I manage family member profiles?", a: "Yes, our platform allows you to securely manage profiles and medication schedules for up to five family members under one Pro account." },
  ],
  safety: [
    { q: "How does the interaction checker work?", a: "Our system cross-references all active medications and supplements you log against a comprehensive database of clinically significant drug-drug and drug-food interactions, flagging potential risks instantly." },
    { q: "Are reminders customizable?", a: "Absolutely. You can set reminders for dosage times, refills, and even specific pre-meal or post-meal instructions." },
  ],
};

const categories = [
  { id: 'general', title: 'General & Mission' },
  { id: 'account', title: 'Account & Billing' },
  { id: 'safety', title: 'Safety Features' },
];

function FAQSectionV2() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? null : index);
  };

  return (
    <section className="faqV2Container">
      <div className="faqV2Wrapper">
        <h2 className="faqSectionTitle">Frequently Asked Questions</h2>
        
        <div className="faqContentLayout">
          
          {/* --- Left Column: Category Filter (Fixed on Desktop) --- */}
          <nav className="faqCategoryColumn">
            <h3 className="categoryHeader">Filter by Topic</h3>
            <ul className="categoryList">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    className={`categoryButton ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setOpenQuestionIndex(null); // Close any open accordion when switching tabs
                    }}
                  >
                    {category.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* --- Right Column: Accordion Content --- */}
          <div className="faqAccordionColumn">
            <div className="currentCategoryTitle">
                {categories.find(c => c.id === activeCategory).title}
            </div>

            {faqData[activeCategory] && faqData[activeCategory].map((item, index) => (
              <div 
                key={index} 
                className={`accordionItem ${openQuestionIndex === index ? 'is-open' : ''}`}
              >
                {/* Question */}
                <button 
                  className="accordionQuestion" 
                  onClick={() => handleToggle(index)}
                  aria-expanded={openQuestionIndex === index}
                >
                  <span className="questionText">{item.q}</span>
                  <span className="toggleIcon">
                    {openQuestionIndex === index ? '−' : '+'}
                  </span>
                </button>
                
                {/* Answer Content */}
                <div className="accordionAnswerContent">
                  <p className="answerText">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}

export default FAQSectionV2;