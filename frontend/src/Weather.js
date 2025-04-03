import React, { useState } from "react";
import "./Weather.css";

const api = {
  key: "73c05fd6342a2580bff3e013b1fa1929", // Replace with your actual API key
  base: "https://api.openweathermap.org/data/2.5/",
};

function App() {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const searchPressed = async () => {
    if (!search.trim()) {
      setError("Please enter a city name.");
      setWeather(null);
      return;
    }

    try {
      const response = await fetch(`${api.base}weather?q=${search}&units=metric&APPID=${api.key}`);
      const result = await response.json();

      if (response.ok) {
        setWeather(result);
        setError(null);
      } else {
        setWeather(null);
        setError(result.message || "City not found.");
      }
    } catch (err) {
      setError("Failed to fetch data. Check your internet connection.");
      setWeather(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather App</h1>

        <div>
          <input
            type="text"
            placeholder="Enter city name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={searchPressed}>Search</button>
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div>
            <h2>{weather.name}, {weather.sys.country}</h2>
            <p>🌡 {weather.main.temp}°C</p>
            <p>{weather.weather[0].main} - {weather.weather[0].description}</p>
            <p>💨 Wind Speed: {weather.wind.speed} m/s</p>
            <p>🌅 Humidity: {weather.main.humidity}%</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default Weather;