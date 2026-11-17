import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoHelpBuoyOutline,
  IoSearchOutline,
  IoChatbubblesOutline,
  IoMailOutline,
  IoCallOutline,
  IoLogoWhatsapp,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoCheckmarkCircleOutline,
  IoPaperPlaneOutline,
  IoCloseOutline,
} from "react-icons/io5";
import Breadcrumb from "../../components/ui/Breadcrumb";
import "./InfoPages.css";

export default function CustomerSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    orderId: "",
    category: "Order Status",
    message: "",
  });

  const [chatMessages, setChatMessages] = useState([
    { sender: "agent", text: "Hello! Welcome to SHOP.CO Support. How can I assist you with your order today?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const faqs = [
    {
      q: "Where is my order and how do I track its live status?",
      a: "Once your package leaves our fulfillment center, you receive an SMS and email with your tracking ID. You can also visit our 'Manage Deliveries' or 'Orders' page anytime to view real-time location telemetry.",
      cat: "Orders",
    },
    {
      q: "How do I request a return or size exchange?",
      a: "We offer 30-day doorstep exchanges and returns. Simply head to your Orders page, click 'Return/Exchange' on the item, select your reason, and choose your preferred home pickup slot.",
      cat: "Returns",
    },
    {
      q: "Can I modify or cancel my order after checkout?",
      a: "You can modify your shipping address or cancel your order within 60 minutes of placing it directly from the Manage Deliveries page or by pinging our 24/7 Live Chat team.",
      cat: "Orders",
    },
    {
      q: "What payment methods are supported?",
      a: "We accept Visa, MasterCard, American Express, PayPal, Apple Pay, Google Pay, and interest-free installment plans via Klarna.",
      cat: "Billing",
    },
    {
      q: "What if I received a defective or wrong garment?",
      a: "We sincerely apologize if this occurred. We will dispatch an immediate express replacement at zero cost, along with a prepaid pickup label for the incorrect piece.",
      cat: "Returns",
    },
    {
      q: "How long does a refund take to reflect?",
      a: "Once the courier verifies the returned item, your refund is credited within 2-4 business days back to your original payment method.",
      cat: "Billing",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketForm({ name: "", email: "", orderId: "", category: "Order Status", message: "" });
    }, 4000);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "Thank you for providing that detail. Our support concierge is looking up your request right now. You can also reach us directly at support@shop.co for formal records.",
        },
      ]);
    }, 1200);
  };

  return (
    <div className="info-page">
      <div className="info-container">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Customer Support" }]} />

        {/* Hero */}
        <section className="info-hero">
          <span className="info-hero__badge">
            <IoHelpBuoyOutline /> 24/7 Global Care
          </span>
          <h1 className="info-hero__title">
            We're Here To Help, <br />
            Around The Clock.
          </h1>
          <p className="info-hero__subtitle">
            Have questions about your order, returns, sizing, or styling advice?
            Our friendly customer care team is standing by 24 hours a day, 7 days a week.
          </p>

          <div style={{ marginTop: "28px" }}>
            <div className="info-search-box">
              <IoSearchOutline size={20} color="#666" />
              <input
                type="text"
                placeholder="Search solutions, tracking questions, return policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Contact Channels Grid */}
        <section className="info-section">
          <div className="info-grid-4">
            <div
              className="info-card info-card--hover"
              style={{ cursor: "pointer" }}
              onClick={() => setIsChatOpen(true)}
            >
              <div className="info-icon-box">
                <IoChatbubblesOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "4px" }}>24/7 Live Chat</h3>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "14px" }}>
                Chat with our human styling & support specialists.
              </p>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>
                ● Typical reply in under 1 min
              </span>
            </div>

            <div className="info-card info-card--hover">
              <div className="info-icon-box">
                <IoMailOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "4px" }}>Email Ticket</h3>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "14px" }}>
                Send detailed inquiries, attachments, or invoices.
              </p>
              <a href="#ticket-form" style={{ fontSize: "13px", fontWeight: "700", color: "#000" }}>
                support@shop.co →
              </a>
            </div>

            <div className="info-card info-card--hover">
              <div className="info-icon-box">
                <IoCallOutline />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "4px" }}>Direct Hotline</h3>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "14px" }}>
                Toll-free telephone assistance for urgent updates.
              </p>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#000" }}>
                +1 (800) 555-SHOP
              </span>
            </div>

            <div className="info-card info-card--hover">
              <div className="info-icon-box">
                <IoLogoWhatsapp />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "4px" }}>WhatsApp Care</h3>
              <p style={{ fontSize: "13px", color: "#666", marginBottom: "14px" }}>
                Quick questions, size checks, and dispatch alerts.
              </p>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>
                Available Mon - Sun
              </span>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="info-section">
          <div className="info-section-header">
            <div className="info-section-tag">Frequently Answered</div>
            <h2 className="info-section-title">Common Support Inquiries</h2>
          </div>

          <div className="faq-accordion">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => (
                <div key={idx} className={`faq-item ${openFaq === idx ? "faq-item--active" : ""}`}>
                  <button
                    className="faq-trigger"
                    onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <IoChevronUpOutline size={18} /> : <IoChevronDownOutline size={18} />}
                  </button>
                  {openFaq === idx && <div className="faq-content">{faq.a}</div>}
                </div>
              ))
            ) : (
              <div className="info-card" style={{ textAlign: "center", color: "#666", padding: "32px" }}>
                No questions found matching "{searchQuery}". Send us a ticket below!
              </div>
            )}
          </div>
        </section>

        {/* Ticket Form */}
        <section id="ticket-form" className="info-section">
          <div className="info-card" style={{ maxWidth: "800px", margin: "0 auto", padding: "36px" }}>
            <span className="info-section-tag">Direct Inquiry</span>
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px" }}>
              Submit a Support Ticket
            </h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
              Our dedicated resolution team responds to all tickets within 4 business hours.
            </p>

            {ticketSubmitted ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <IoCheckmarkCircleOutline size={64} color="#16a34a" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
                  Ticket #SHP-{Math.floor(100000 + Math.random() * 900000)} Created
                </h3>
                <p style={{ fontSize: "14px", color: "#666" }}>
                  A confirmation has been sent to your email. We'll follow up shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit}>
                <div className="info-grid-2">
                  <div className="info-form-group">
                    <label className="info-form-label">Your Name *</label>
                    <input
                      type="text"
                      className="info-form-input"
                      placeholder="Jane Doe"
                      required
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                    />
                  </div>
                  <div className="info-form-group">
                    <label className="info-form-label">Email Address *</label>
                    <input
                      type="email"
                      className="info-form-input"
                      placeholder="jane@example.com"
                      required
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="info-grid-2">
                  <div className="info-form-group">
                    <label className="info-form-label">Order Number (if applicable)</label>
                    <input
                      type="text"
                      className="info-form-input"
                      placeholder="e.g. #ORD-98421"
                      value={ticketForm.orderId}
                      onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                    />
                  </div>
                  <div className="info-form-group">
                    <label className="info-form-label">Inquiry Topic</label>
                    <select
                      className="info-form-select"
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    >
                      <option value="Order Status">Order Status & Tracking</option>
                      <option value="Return or Exchange">Return / Size Exchange</option>
                      <option value="Product Details">Product / Fit Advice</option>
                      <option value="Payment Inquiry">Payment & Invoicing</option>
                      <option value="Feedback">Feedback or Other</option>
                    </select>
                  </div>
                </div>

                <div className="info-form-group">
                  <label className="info-form-label">How can we help? *</label>
                  <textarea
                    rows={4}
                    className="info-form-textarea"
                    placeholder="Provide as much context as possible..."
                    required
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-solid-black">
                  <IoPaperPlaneOutline size={18} /> Submit Support Request
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Live Chat Modal Drawer */}
        {isChatOpen && (
          <div className="info-modal-backdrop" onClick={() => setIsChatOpen(false)}>
            <div
              className="info-modal-card"
              style={{ maxWidth: "440px", padding: "0", display: "flex", flexDirection: "column", height: "550px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "24px 24px 0 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: "800", margin: 0 }}>SHOP.CO Support</h4>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Online Now</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
                >
                  <IoCloseOutline size={22} />
                </button>
              </div>

              {/* Chat Message List */}
              <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "#f9f9f9" }}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                      background: msg.sender === "user" ? "#000000" : "#ffffff",
                      color: msg.sender === "user" ? "#ffffff" : "#111111",
                      padding: "10px 14px",
                      borderRadius: "14px",
                      maxWidth: "80%",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      border: msg.sender === "user" ? "none" : "1px solid #e5e5e5",
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} style={{ padding: "12px", background: "#fff", display: "flex", gap: "8px", borderTop: "1px solid #eee", borderRadius: "0 0 24px 24px" }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="info-form-input"
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="btn-solid-black" style={{ padding: "8px 14px" }}>
                  <IoPaperPlaneOutline size={16} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
