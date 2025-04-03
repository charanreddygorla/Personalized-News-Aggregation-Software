import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Page.css";
import {
  FaFutbol,
  FaFilm,
  FaLaptop,
  FaHeartbeat,
  FaChartLine,
  FaFlask,
  FaMusic,
  FaGamepad,
  FaCar,
  FaPlane,
} from "react-icons/fa";

const NewsPage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  const categories = [
    { name: "Sports", description: "Latest updates from the world of sports", icon: <FaFutbol />, colorClass: "blue" },
    { name: "Entertainment", description: "Movies, TV shows, and celebrity news", icon: <FaFilm />, colorClass: "pink" },
    { name: "Technology", description: "Innovations and trends in technology", icon: <FaLaptop />, colorClass: "green" },
    { name: "Health", description: "Health tips and medical news", icon: <FaHeartbeat />, colorClass: "yellow" },
    { name: "Business", description: "Financial news and market updates", icon: <FaChartLine />, colorClass: "purple" },
    { name: "Science", description: "Discoveries and research in science", icon: <FaFlask />, colorClass: "orange" },
    { name: "Music", description: "Latest in music and artists", icon: <FaMusic />, colorClass: "blue" },
    { name: "Gaming", description: "News and updates from the gaming world", icon: <FaGamepad />, colorClass: "pink" },
    { name: "Automotive", description: "Car news and reviews", icon: <FaCar />, colorClass: "green" },
    { name: "Travel", description: "Travel tips and destination guides", icon: <FaPlane />, colorClass: "yellow" },
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category]
    );
  };

  const handleSavePreferences = () => {
    alert("Preferences saved!");
    setTimeout(() => {
      navigate("/"); // Redirects to the login page after 1 second
    }, 750);
  };

  return (
    <div className="news-page">
      <div className="header">
        <h1>Discover Your News</h1>
        <p>Choose categories that interest you</p>
      </div>
      <div className="categories">
        {categories.map((category) => (
          <div
            key={category.name}
            className={category-card ${selectedCategories.includes(category.name) ? "selected" : ""} ${category.colorClass}}
            onClick={() => handleCategoryChange(category.name)}
          >
            <div className="icon">{category.icon}</div>
            <h2>{category.name}</h2>
            <p>{category.description}</p>
          </div>
        ))}
      </div>
      <button className="save-button" onClick={handleSavePreferences}>
        Save Preferences
      </button>
    </div>
  );
};

export default NewsPage;