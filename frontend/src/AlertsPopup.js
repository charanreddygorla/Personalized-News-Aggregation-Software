import React, { useState, useEffect, useCallback } from "react";
import "./AlertsPopup.css";

const AlertsPopup = () => {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = `https://newsapi.org/v2/top-headlines?country=us&apiKey=9c3ed8ee95884dec979460a60f96675b`;

  const toggleAlerts = () => {
    setOpen(!open);
  };

  // ✅ Wrap fetchAlerts with useCallback
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setAlerts(data.articles.map(article => article.title) || []);
    } catch (error) {
      console.error("Error fetching alerts:", error.message);
      setAlerts(["Failed to load alerts"]);
    }
    setLoading(false);
  }, [API_URL]); // ✅ Include API_URL in dependencies

  useEffect(() => {
    if (open) {
      fetchAlerts();
    }
  }, [open, fetchAlerts]); // ✅ Now fetchAlerts is safe to include

  return (
    <div>
      <button className="alerts-button" onClick={toggleAlerts}>
        {open ? "Close Alerts" : "Alerts"}
      </button>

      {open && (
        <div className="alerts-popup">
          <div className="alerts-header">
            <h3>Latest Alerts</h3>
            <button onClick={toggleAlerts}>✖</button>
          </div>
          <div className="alerts-body">
            {loading ? (
              <p>Loading alerts...</p>
            ) : alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <p key={index} className="alert-item">
                  {alert}
                </p>
              ))
            ) : (
              <p>No new alerts</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPopup;
