import React, { useState } from "react";
import "./ServicesTab.css";
import { Pill, ShieldAlert, Activity, MessageCircle } from 'lucide-react';

const services = [
  { id: "info", title: "Drug Information & Clarity", icon: <Pill size={32} />, description: "Clear instructions for medications." },
  { id: "safety", title: "Safety & Alert Systems", icon: <ShieldAlert size={32} />, description: "Alerts for safe usage." },
  { id: "tracking", title: "Comprehensive Safety Guardrails", icon: <Activity size={32} />, description: "Emphasizes strict Dosage Discipline." },
  { id: "legal", title: "Legal & Ethical Integrity", icon: <MessageCircle size={32} />, description: "Protecting both the platform and the user by prioritizing professional consultation." },
];

function ServicesTab() {
  const [activeService, setActiveService] = useState(services[0].id);

  return (
    <section className="servicesContainer">
      <div className="servicesHeader">
        <h2>Our Services</h2>
        <p>Explore the tools and resources we provide to keep your medication journey safe and clear.</p>
      </div>

      <div className="servicesGrid">
        {services.map((service) => (
          <div
            key={service.id}
            className={`serviceCard ${activeService === service.id ? "active" : ""}`}
            onClick={() => setActiveService(service.id)}
          >
            <div className="cardIcon">{service.icon}</div>
            <h3 className="cardTitle">{service.title}</h3>
            <p className="cardDescription">{service.description}</p>
          </div>
        ))}
      </div>

      {/* Active Service Details */}
      <div className="serviceDetails">
        {services
          .filter((s) => s.id === activeService)
          .map((service) => (
            <div key={service.id}>
              <h3>Comprehensive Drug Guide</h3>
              <p>Provides detailed, easy-to-understand guidance on how to take your medications safely, including dosage, timing, and potential side effects, so you can manage your health with confidence.</p>
            </div>
          ))}
      </div>
    </section>
  );
}

export default ServicesTab;

