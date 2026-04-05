import React, { useState } from "react";
import "./GetStartedSection.css";
import { apiGet, apiSend } from "../api";

function GetStartedSection() {
  const [searchMode, setSearchMode] = useState("medicine");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [aiMedicine, setAiMedicine] = useState(null);
  const [aiSymptoms, setAiSymptoms] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [unifiedResult, setUnifiedResult] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    warnings: "",
    source: "",
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setAiError(null);
    setAiMedicine(null);
    setAiSymptoms(null);
    setResults(null);
    setUnifiedResult(null);

    try {
      const response = await apiSend('/api/search', 'POST', { query: searchTerm });

      const data = response.data;

      if (data && data.error === 'non_medical_query') {
        setAiError("We could not interpret your query as medical. Please ask a health-related question.");
      } else if (data) {
        const resultType = (data.type || "").toLowerCase();
        
        if (searchMode === "medicine" && (resultType === "symptom" || resultType === "disease")) {
          setAiError("You searched for a symptom or disease in the Medicine tab. Please switch to the Symptoms tab and try again.");
        } else if (searchMode === "symptoms" && (resultType === "medication" || resultType === "medicine")) {
          setAiError("You searched for a medication in the Symptoms tab. Please switch to the Medicine Name tab and try again.");
        } else {
          setUnifiedResult(data);
        }
      }

    } catch (err) {
      setAiError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);

    if (type === "update" && results) {
      setFormData({
        name: results.name || "",
        purpose: results.purpose || "",
        warnings: results.warnings || "",
        source: results.source || "MongoDB",
      });
    } else if (type === "add") {
      setFormData({ name: "", purpose: "", warnings: "", source: "MongoDB" });
    }

    setShowModal(true);
  };

  const handleFormChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    try {
      const data = await apiSend("/api/medicines", "POST", formData);
      setResults(data);
      setSearchTerm(data.name);
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Add failed");
    }
  };

  const handleUpdate = async () => {
    if (!results?._id) return;

    try {
      const data = await apiSend(`/api/medicines/${results._id}`, "PUT", formData);
      setResults(data);
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!results?._id) return;

    try {
      await apiSend(`/api/medicines/${results._id}`, "DELETE");
      setResults(null);
      setSearchTerm("");
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <section className="getStartedContainer">
      <div className="getStartedWrapper">
        <h2 className="getStartedTitle">
          <span className="highlightTeal">Get Started:</span> Find Drug Clarity Now
        </h2>

        <p className="getStartedSubtitle">
          {searchMode === "medicine"
            ? "Search by medication name for AI-sourced educational summaries: how it works, benefits, risks, and typical dosing notes by use."
            : "Describe your symptoms to see which type of clinician may be appropriate and general supportive steps — not a diagnosis."}
        </p>

        <div className="searchModeToggle" role="tablist" aria-label="Search type">
          <button
            type="button"
            role="tab"
            aria-selected={searchMode === "medicine"}
            className={`searchModeBtn ${searchMode === "medicine" ? "active" : ""}`}
            onClick={() => {
              setSearchMode("medicine");
              setUnifiedResult(null);
              setResults(null);
              setAiError(null);
            }}
          >
            Medicine name
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={searchMode === "symptoms"}
            className={`searchModeBtn ${searchMode === "symptoms" ? "active" : ""}`}
            onClick={() => {
              setSearchMode("symptoms");
              setUnifiedResult(null);
              setResults(null);
              setAiError(null);
            }}
          >
            Symptoms
          </button>
        </div>

        <form className="medSearchForm" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder={
              searchMode === "medicine"
                ? "Search for a medication..."
                : "Describe your symptoms (e.g. sharp chest pain when breathing)..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchInput"
          />
          <button type="submit" className="searchButton">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {aiError && (
          <div className="searchResultsBox aiNotice errorNotice">
            <p>{aiError}</p>
          </div>
        )}

        {unifiedResult && !unifiedResult.error && (
          <div className="searchResultsBox aiInsightCard">
            <h3>{unifiedResult.name}</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                TYPE: {unifiedResult.type?.toUpperCase()}
              </span>
            </div>

            <p className="aiSectionLabel">Overview</p>
            <p style={{ lineHeight: '1.6' }}>{unifiedResult.overview}</p>

            {unifiedResult.details && (
              <>
                 {unifiedResult.details.how_it_works && (
                    <>
                      <p className="aiSectionLabel">How it works</p>
                      <p style={{ lineHeight: '1.6' }}>{unifiedResult.details.how_it_works}</p>
                    </>
                 )}
                 {unifiedResult.details.uses && (
                    <>
                      <p className="aiSectionLabel">Common Uses / Symptoms</p>
                      <p style={{ lineHeight: '1.6' }}>{unifiedResult.details.uses}</p>
                    </>
                 )}
                 {unifiedResult.details.side_effects && (
                    <>
                      <p className="aiSectionLabel">Risks & Side effects</p>
                      <p style={{ lineHeight: '1.6' }}>{unifiedResult.details.side_effects}</p>
                    </>
                 )}
                 {unifiedResult.details.warnings && (
                    <>
                      <p className="aiSectionLabel">Warnings</p>
                      <p style={{ lineHeight: '1.6' }}>{unifiedResult.details.warnings}</p>
                    </>
                 )}
              </>
            )}

            {unifiedResult.primary_treatments && unifiedResult.primary_treatments.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <p className="aiSectionLabel">Primary Treatments</p>
                <ul className="aiBulletList">
                  {unifiedResult.primary_treatments.map((treatment, idx) => (
                    <li key={idx}>{treatment}</li>
                  ))}
                </ul>
              </div>
            )}

            {unifiedResult.doctor_to_consult && unifiedResult.doctor_to_consult.specialist && (
               <>
                 <p className="aiSectionLabel">Types of doctors / clinics to consider</p>
                 <ul className="aiSpecialtyList">
                    <li>
                      <strong>{unifiedResult.doctor_to_consult.specialist}</strong>
                      <span>{unifiedResult.doctor_to_consult.reason}</span>
                    </li>
                 </ul>
               </>
            )}

            {unifiedResult.emergency_warning && (
              <>
                 <p className="aiSectionLabel">When to seek urgent care</p>
                 <p className="aiUrgent">{unifiedResult.emergency_warning}</p>
              </>
            )}

            {unifiedResult.disclaimer && (
              <p className="aiDisclaimer">{unifiedResult.disclaimer}</p>
            )}
          </div>
        )}

        {searchMode === "medicine" && results && (
          <div className="searchResultsBox dbRecordCard">
            <h3>Database record: {results.name}</h3>
            <p>
              <strong>Purpose:</strong> {results.purpose}
            </p>
            {results.warnings && (
              <p>
                <strong>Warnings:</strong> {results.warnings}
              </p>
            )}
            {results.source && (
              <p>
                <em>Source: {results.source}</em>
              </p>
            )}
          </div>
        )}

        {/* {searchMode === "medicine" && (
          <div className="quickLinks">
            <button
              className="quickLinkItem"
              onClick={() => openModal("update")}
              disabled={!results}
            >
              Update Effects/Side effects
            </button>

            <button className="quickLinkItem" onClick={() => openModal("add")}>
              Add Drug Info
            </button>

            {results && (
              <button className="quickLinkItem" onClick={() => openModal("delete")}>
                Delete Drug Info
              </button>
            )}
          </div>
        )} */}

        {showModal && (
          <div className="modalOverlay" onClick={() => setShowModal(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              {modalType === "delete" ? (
                <>
                  <h3>Delete {results?.name}?</h3>
                  <button onClick={handleDelete}>Confirm Delete</button>
                  <button onClick={() => setShowModal(false)}>Cancel</button>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    modalType === "add" ? handleAdd() : handleUpdate();
                  }}
                  className="modalForm"
                >
                  <h3>{modalType === "add" ? "Add Medicine" : "Update Medicine"}</h3>

                  <input
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                  <input
                    name="purpose"
                    placeholder="Purpose"
                    value={formData.purpose}
                    onChange={handleFormChange}
                  />
                  <input
                    name="warnings"
                    placeholder="Warnings"
                    value={formData.warnings}
                    onChange={handleFormChange}
                  />
                  <input
                    name="source"
                    placeholder="Source"
                    value={formData.source}
                    onChange={handleFormChange}
                  />

                  <div className="modalButtons">
                    <button type="submit">{modalType === "add" ? "Add" : "Update"}</button>
                    <button type="button" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default GetStartedSection;
