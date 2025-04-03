import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Preferences.css";
import {
  FaFutbol, FaFilm, FaLaptop, FaHeartbeat, FaChartLine,
  FaFlask, FaMusic, FaGamepad, FaCar, FaPlane
} from "react-icons/fa";

const Preferences = () => {
  const [email, setEmail] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      fetchUserPreferences(storedEmail);
    } else {
      alert("No registered email found. Please log in again.");
      navigate("/login"); // Redirect to login if email is missing
    }
  }, [navigate]);

  const fetchUserPreferences = async (userEmail) => {
    try {
      const response = await axios.get(`http://localhost:5000/get-preferences?email=${userEmail}`);
      if (response.data.preferences) {
        setSelectedCategories(response.data.preferences.split(",")); // Convert CSV string to array
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category]
    );
  };

  const handleSavePreferences = async () => {
    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/save-preferences", {
        email,
        preferences: selectedCategories.join(","),
      });

      if (response.data.success) {
        alert("Preferences updated successfully!");
        navigate("/Newsapp"); // Redirect back to profile page
      } else {
        alert("Error updating preferences.");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      alert("Server error. Please try again later.");
    }
  };

  const categories = [
    { name: "Sports", icon: <FaFutbol />, colorClass: "blue" },
    { name: "Entertainment", icon: <FaFilm />, colorClass: "pink" },
    { name: "Technology", icon: <FaLaptop />, colorClass: "green" },
    { name: "Health", icon: <FaHeartbeat />, colorClass: "yellow" },
    { name: "Business", icon: <FaChartLine />, colorClass: "purple" },
    { name: "Science", icon: <FaFlask />, colorClass: "orange" },
    { name: "Music", icon: <FaMusic />, colorClass: "blue" },
    { name: "Gaming", icon: <FaGamepad />, colorClass: "pink" },
    { name: "Automotive", icon: <FaCar />, colorClass: "green" },
    { name: "Travel", icon: <FaPlane />, colorClass: "yellow" },
  ];

  return (
    <div className="news-page">
      <div className="header">
        <h1>Update Your Preferences</h1>
        <p>Select or update your preferred news categories</p>
      </div>

      <input type="email" value={email} disabled className="email-input" />

      <div className="categories">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`category-card ${selectedCategories.includes(category.name) ? "selected" : ""} ${category.colorClass}`}
            onClick={() => handleCategoryChange(category.name)}
          >
            <div className="icon">{category.icon}</div>
            <h2>{category.name}</h2>
          </div>
        ))}
      </div>

      <button className="save-button" onClick={handleSavePreferences}>
        Save Preferences
      </button>
    </div>
  );
};

export default Preferences;
