import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  ArrowLeft,
  Lightbulb,
  MapPin,
  FileText,
  Sparkles,
} from "lucide-react";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello! 👋 I am SamadhanSetu AI Assistant. I can help you understand community problems, suggest solutions, and guide you through the portal.",
    },
  ]);

  const suggestions = [
    "How do I report a problem?",
    "How does AI analyze my problem?",
    "How can I track my complaint?",
    "Who will solve my problem?",
  ];

  const generateResponse = (text) => {
    const lower = text.toLowerCase();

    if (lower.includes("report") || lower.includes("submit")) {
      return "You can report a community problem by using the Submit Problem section. Add the problem details, category, description, affected people, location, and supporting photo/video. Our AI will analyze the submitted problem.";
    }

    if (lower.includes("track")) {
      return "You can track your submitted problem from Track Problems. The process includes AI Analysis, Assignment, Acceptance, Development, Implementation, and Problem Resolved.";
    }

    if (lower.includes("ai") || lower.includes("analyze")) {
      return "SamadhanSetu AI analyzes the problem description and available information to identify the category, severity, priority, possible duplicate reports, solution domain, and suitable stakeholder.";
    }

    if (
      lower.includes("solve") ||
      lower.includes("who") ||
      lower.includes("university") ||
      lower.includes("college") ||
      lower.includes("industry")
    ) {
      return "After AI analysis, the problem can be matched with a suitable college, university team, industry, municipality, Gram Panchayat, or government authority based on expertise and location.";
    }

    if (lower.includes("location") || lower.includes("gps")) {
      return "Your problem can include your location so the system can identify the appropriate nearby stakeholders and improve problem assignment.";
    }

    return "I can help you with reporting problems, AI analysis, problem tracking, stakeholder assignment, locations, and the SamadhanSetu solving process.";
  };

  const handleSend = (text = message) => {
    const cleanText = text.trim();

    if (!cleanText) return;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: cleanText,
      },
      {
        type: "ai",
        text: generateResponse(cleanText),
      },
    ]);

    setMessage("");
  };

  return (
    <div className="ai-assistant-page">
      <div className="ai-assistant-container">

        <Link to="/dashboard" className="ai-back-button">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="ai-header">
          <div className="ai-header-icon">
            <Bot size={32} />
          </div>

          <div>
            <h1>SamadhanSetu AI Assistant</h1>
            <p>
              Get instant guidance about reporting, tracking and solving
              community problems.
            </p>
          </div>

          <Sparkles className="ai-sparkle" size={28} />
        </div>

        <div className="ai-info-cards">

          <div className="ai-info-card">
            <Lightbulb size={24} />
            <div>
              <h3>Smart Guidance</h3>
              <p>Get useful suggestions for your problem.</p>
            </div>
          </div>

          <div className="ai-info-card">
            <MapPin size={24} />
            <div>
              <h3>Location Based</h3>
              <p>Understand how location helps solve problems.</p>
            </div>
          </div>

          <div className="ai-info-card">
            <FileText size={24} />
            <div>
              <h3>Problem Analysis</h3>
              <p>Learn how AI analyzes submitted problems.</p>
            </div>
          </div>

        </div>

        <div className="ai-chat-card">

          <div className="ai-chat-header">
            <div className="ai-chat-avatar">
              <Bot size={22} />
            </div>

            <div>
              <h3>AI Assistant</h3>
              <span>
                <span className="ai-online-dot"></span>
                Online
              </span>
            </div>
          </div>

          <div className="ai-messages">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`ai-message-row ${
                  msg.type === "user" ? "user-row" : "ai-row"
                }`}
              >

                {msg.type === "ai" && (
                  <div className="ai-small-avatar">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  className={`ai-message ${
                    msg.type === "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >
                  {msg.text}
                </div>

              </div>
            ))}

          </div>

          <div className="ai-suggestions">
            <p>Quick questions</p>

            <div className="ai-suggestion-list">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-input-area">

            <input
              type="text"
              placeholder="Ask SamadhanSetu AI..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />

            <button
              className="ai-send-button"
              onClick={() => handleSend()}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>

          </div>

          <p className="ai-disclaimer">
            AI Assistant provides general guidance. Final problem assignment
            and decisions are handled through the SamadhanSetu platform.
          </p>

        </div>

      </div>
    </div>
  );
}

export default AIAssistant;