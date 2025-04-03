import React, { useState } from "react";
import "./aboutus.css";

const AboutUs = () => {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", { email, feedback });

    const response = await fetch("http://localhost:5000/submit-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, feedback }),
    });

    const data = await response.json();
    console.log("Response:", data);
    setMessage(data.message);
    setFeedback("");
    setEmail("");
  };

  return (
    <div className="container">
      <div className="about-section">
        <h1 className="title">About Us</h1>
        <p className="description">
          Welcome to <span className="highlight">Insta News</span>, your go-to
          source for the latest trending news worldwide. Our mission is to
          deliver unbiased, fast, and engaging news articles.
        </p>
      </div>

      <div className="team-section">
        <h2 className="subtitle">Meet the Developers</h2>
        <ul className="team-list">
          <li><strong>Hasmith Naidu</strong> - Lead Developer</li>
          <li><strong>Hasmith Naidu</strong> - UI/UX Designer</li>
          <li><strong>Hasmith Naidu</strong> - Backend Engineer</li>
        </ul>
      </div>

      <div className="feedback-section">
        <h2 className="subtitle">Give Us Your Feedback</h2>
        <form onSubmit={handleSubmit} className="feedback-form">
          <input
            type="email"
            placeholder="Your Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Your Feedback"
            className="textarea"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <button type="submit" className="button">Submit</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default AboutUs;