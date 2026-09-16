import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  MessageSquare,
  Send,
  CheckCircle,
  ThumbsUp,
  ArrowLeft,
} from "lucide-react";

function Feedback() {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [answers, setAnswers] = useState({
    easeOfUse: "",
    problemSubmission: "",
    tracking: "",
    notifications: "",
    recommendation: "",
  });
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: "easeOfUse",
      question: "1. How easy was SamadhanSetu to use?",
      options: ["Very Easy", "Easy", "Average", "Difficult"],
    },
    {
      id: "problemSubmission",
      question: "2. How was your experience submitting a problem?",
      options: ["Excellent", "Good", "Average", "Poor"],
    },
    {
      id: "tracking",
      question: "3. How useful is the problem tracking feature?",
      options: ["Very Useful", "Useful", "Average", "Not Useful"],
    },
    {
      id: "notifications",
      question: "4. How helpful are the notifications and updates?",
      options: ["Very Helpful", "Helpful", "Average", "Not Helpful"],
    },
    {
      id: "recommendation",
      question: "5. Would you recommend SamadhanSetu to others?",
      options: ["Definitely", "Probably", "Maybe", "No"],
    },
  ];

  const handleAnswer = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    const unanswered = questions.some(
      (question) => !answers[question.id]
    );

    if (unanswered) {
      alert("Please answer all feedback questions.");
      return;
    }

    let user = {};

    try {
      user = JSON.parse(
        localStorage.getItem("samadhanSetuUser") || "{}"
      );
    } catch {
      user = {};
    }

    const feedback = {
      id: Date.now(),
      userId: user.email || "guest",
      userName: user.name || "Citizen",
      rating,
      answers,
      message,
      createdAt: new Date().toISOString(),
    };

    let feedbackList = [];

    try {
      feedbackList = JSON.parse(
        localStorage.getItem("samadhanSetuFeedback") || "[]"
      );

      if (!Array.isArray(feedbackList)) {
        feedbackList = [];
      }
    } catch {
      feedbackList = [];
    }

    feedbackList.push(feedback);

    localStorage.setItem(
      "samadhanSetuFeedback",
      JSON.stringify(feedbackList)
    );

    // Notification for admin
    let notifications = [];

    try {
      notifications = JSON.parse(
        localStorage.getItem("samadhanSetuNotifications") || "[]"
      );

      if (!Array.isArray(notifications)) {
        notifications = [];
      }
    } catch {
      notifications = [];
    }

    notifications.unshift({
      id: Date.now() + 1,
      type: "feedback",
      title: "New Feedback Submitted",
      message: `${user.name || "A citizen"} submitted ${rating}/5 rating and portal feedback.`,
      from: user.name || "Citizen",
      status: "New",
      read: false,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(
      "samadhanSetuNotifications",
      JSON.stringify(notifications)
    );

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="feedback-page">
        <div className="feedback-success-card">
          <div className="feedback-success-icon">
            <CheckCircle size={70} />
          </div>

          <h1>Thank You! 🎉</h1>

          <p className="success-main-text">
            Your valuable feedback has been submitted successfully.
          </p>

          <p className="success-sub-text">
            Your feedback helps us improve SamadhanSetu and create a
            better problem-solving experience for everyone.
          </p>

          <div className="success-rating">
            <span>Your Rating</span>

            <div className="success-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  fill={star <= rating ? "currentColor" : "none"}
                />
              ))}
            </div>

            <strong>{rating}/5</strong>
          </div>

          <button
            className="feedback-home-button"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-container">

        {/* Header */}
        <div className="feedback-header">
          <div className="feedback-header-icon">
            <MessageSquare size={32} />
          </div>

          <div>
            <h1>Share Your Feedback</h1>
            <p>
              Your opinion helps us make SamadhanSetu better.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">

          {/* Rating */}
          <div className="feedback-section rating-section">
            <div className="section-title">
              <div className="section-icon">
                <Star size={20} />
              </div>

              <div>
                <h2>Rate Your Experience</h2>
                <p>How satisfied are you with SamadhanSetu?</p>
              </div>
            </div>

            <div className="rating-wrapper">
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`star-button ${
                      star <= (hoverRating || rating)
                        ? "active"
                        : ""
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={42}
                      fill={
                        star <= (hoverRating || rating)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                ))}
              </div>

              <div className="rating-text">
                {rating === 0
                  ? "Select your rating"
                  : rating === 5
                  ? "Excellent! ⭐"
                  : rating === 4
                  ? "Very Good! 👍"
                  : rating === 3
                  ? "Good"
                  : rating === 2
                  ? "Needs Improvement"
                  : "Poor"}
              </div>
            </div>
          </div>

          {/* MCQ Questions */}
          <div className="feedback-section">
            <div className="section-title">
              <div className="section-icon">
                <ThumbsUp size={20} />
              </div>

              <div>
                <h2>Tell Us About Your Experience</h2>
                <p>Please select one option for each question.</p>
              </div>
            </div>

            <div className="feedback-questions">
              {questions.map((question) => (
                <div className="feedback-question" key={question.id}>
                  <h3>{question.question}</h3>

                  <div className="mcq-options">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className={`mcq-option ${
                          answers[question.id] === option
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={
                            answers[question.id] === option
                          }
                          onChange={() =>
                            handleAnswer(question.id, option)
                          }
                        />

                        <span className="radio-circle"></span>

                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Message */}
          <div className="feedback-section">
            <div className="section-title">
              <div className="section-icon">
                <MessageSquare size={20} />
              </div>

              <div>
                <h2>Additional Feedback</h2>
                <p>Tell us what we can improve.</p>
              </div>
            </div>

            <textarea
              className="feedback-textarea"
              placeholder="Write your suggestions, experience or any additional comments..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
            />
          </div>

          {/* Submit */}
          <div className="feedback-submit-area">
            <button type="submit" className="feedback-submit-button">
              <Send size={19} />
              Submit Feedback
            </button>

            <p>
              Thank you for helping us improve SamadhanSetu ❤️
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Feedback;