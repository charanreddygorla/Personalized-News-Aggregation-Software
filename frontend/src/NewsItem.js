import React, { useState, useEffect } from "react";

const NewsItem = ({ title, content, url }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [summary, setSummary] = useState("");
  const [hoverTimer, setHoverTimer] = useState(null);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`/api/getSummary?content=${encodeURIComponent(content)}`);
      const data = await response.json();
      if (data.summary) setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary("Failed to load summary.");
    }
  };

  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      fetchSummary();
      setShowTooltip(true);
    }, 3000); // 3 sec delay
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer);
    setShowTooltip(false);
  };

  return (
    <div className="relative p-4 border-b border-gray-300">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p>{content.slice(0, 150)}...</p>
      <a href={url} className="text-blue-500">Read more</a>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-0 left-full ml-4 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
          {summary || "Loading summary..."}
        </div>
      )}

      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="absolute inset-0"></div>
    </div>
  );
};

export default NewsItem;
