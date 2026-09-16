import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Send,
  ChevronDown,
  FileText,
  ShieldCheck,
  Bot,
} from "lucide-react";

function HelpSupport() {
  const [openFaq, setOpenFaq] = useState(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const faqs = [
    {
      question: "How can I report a community problem?",
      answer:
        "Go to Submit Problem from your dashboard, enter the problem details, add location and supporting media, then submit the report.",
    },
    {
      question: "How can I track my submitted problem?",
      answer:
        "Open Track Problems from your dashboard. You can see the complete process from submission and AI analysis to assignment, implementation and resolution.",
    },
    {
      question: "What happens after I submit a problem?",
      answer:
        "The problem is verified and analyzed by the AI engine. Based on category, severity, location and expertise, it can be assigned to a suitable college, industry or government/local body.",
    },
    {
      question: "Will I receive updates about my problem?",
      answer:
        "Yes. Important updates such as AI analysis, assignment, acceptance or rejection, progress and resolution are shown in your Notifications section.",
    },
    {
      question: "How do rewards work?",
      answer:
        "Citizens can earn points for meaningful participation, such as reporting problems and contributing to successful problem resolution.",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    const user =
      JSON.parse(localStorage.getItem("samadhanSetuUser")) || {};

    const supportMessage = {
      id: Date.now(),
      userId: user.email || "guest",
      message: message.trim(),
      type: "support",
      status: "Submitted",
      createdAt: new Date().toISOString(),
    };

    const existingMessages =
      JSON.parse(localStorage.getItem("samadhanSetuSupport")) || [];

    localStorage.setItem(
      "samadhanSetuSupport",
      JSON.stringify([supportMessage, ...existingMessages])
    );

    const existingNotifications =
      JSON.parse(
        localStorage.getItem("samadhanSetuNotifications")
      ) || [];

    const adminNotification = {
      id: Date.now() + 1,
      type: "admin",
      title: "New Support Request",
      message: `A citizen has submitted a support request: ${message.trim()}`,
      from: user.name || user.email || "Citizen",
      status: "New",
      read: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "samadhanSetuNotifications",
      JSON.stringify([
        adminNotification,
        ...existingNotifications,
      ])
    );

    setMessage("");
    setSuccess(
      "Your support request has been submitted successfully."
    );

    setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="help-support-page">
      <div className="help-support-container">

        {/* Back */}
        <Link to="/dashboard" className="help-back-button">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="help-header">
          <div className="help-header-icon">
            <HelpCircle size={34} />
          </div>

          <div>
            <h1>Help & Support</h1>
            <p>
              Need help? Find answers or contact the SamadhanSetu
              support team.
            </p>
          </div>
        </div>

        {/* Quick Support Cards */}
        <div className="support-options">

          <div className="support-option-card">
            <div className="support-option-icon blue">
              <MessageCircle size={24} />
            </div>
            <h3>AI Assistant</h3>
            <p>
              Get quick guidance about reporting problems and using
              SamadhanSetu.
            </p>
            <button
              type="button"
              className="support-option-button"
              onClick={() =>
                alert("AI Assistant will be integrated soon.")
              }
            >
              <Bot size={17} />
              Ask AI
            </button>
          </div>

          <div className="support-option-card">
            <div className="support-option-icon orange">
              <Mail size={24} />
            </div>
            <h3>Email Support</h3>
            <p>
              Send your questions or technical issues to our support
              team.
            </p>
            <a
              href="mailto:support@samadhansetu.org"
              className="support-option-button"
            >
              <Mail size={17} />
              Email Us
            </a>
          </div>

          <div className="support-option-card">
            <div className="support-option-icon navy">
              <Phone size={24} />
            </div>
            <h3>Helpline</h3>
            <p>
              For urgent assistance, contact the SamadhanSetu
              support team.
            </p>
            <a
              href="tel:+911800000000"
              className="support-option-button"
            >
              <Phone size={17} />
              Contact
            </a>
          </div>

        </div>

        {/* FAQ */}
        <div className="help-section-card">
          <div className="help-section-title">
            <FileText size={22} />
            <div>
              <h2>Frequently Asked Questions</h2>
              <p>
                Quick answers to common questions about the portal.
              </p>
            </div>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                className={`faq-item ${
                  openFaq === index ? "faq-open" : ""
                }`}
                key={index}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>

                  <ChevronDown
                    size={20}
                    className={
                      openFaq === index ? "faq-arrow-open" : ""
                    }
                  />
                </button>

                {openFaq === index && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="help-contact-card">

          <div className="help-contact-info">
            <div className="help-contact-icon">
              <MessageCircle size={28} />
            </div>

            <h2>Still Need Help?</h2>

            <p>
              Describe your issue and our support team can review
              your request.
            </p>

            <div className="support-note">
              <ShieldCheck size={18} />
              Your support request will be securely recorded.
            </div>
          </div>

          <form
            className="support-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="supportMessage">
              Describe your issue
            </label>

            <textarea
              id="supportMessage"
              placeholder="Tell us how we can help you..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              required
            />

            {success && (
              <div className="support-success">
                ✓ {success}
              </div>
            )}

            <button
              type="submit"
              className="support-submit-button"
            >
              <Send size={18} />
              Submit Support Request
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

export default HelpSupport;