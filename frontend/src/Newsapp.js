import React, { useEffect, useState } from "react";
import { FaUserCircle, FaRegUser, FaSignOutAlt, FaMoon, FaSun, FaBell, FaTimes } from "react-icons/fa";
import Card from "./Card";
import AlertsPopup from "./AlertsPopup";
import { Link } from "react-router-dom";
import "./Newsapp.css";
import axios from "axios";

const Newsapp = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [locationDropdown, setLocationDropdown] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [search, setSearch] = useState("world");
    const [newsData, setNewsData] = useState(null);
    const [setHeadlines] = useState([]);
    const [setUserName] = useState("User");
    const [user, setUser] = useState({ name: "", email: "" });
    const [setUpdatedName] = useState("");
    const [weather, setWeather] = useState(null);
    const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem("language") || "en");
    const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("fontSize")) || 16);
    const [fontSizeDropdownOpen, setFontSizeDropdownOpen] = useState(false);
    const [breakingNews, setBreakingNews] = useState([]);


    const fetchBreakingNews = async () => {
        try {
            const response = await fetch(`https://newsapi.org/v2/top-headlines?language=${selectedLanguage}&apiKey=${API_KEY}`);
            const data = await response.json();
            if (data.articles.length > 0) {
                setBreakingNews(data.articles.map(article => article.title).slice(0, 5)); // Get top 5 headlines
            }
        } catch (error) {
            console.error("Error fetching breaking news:", error);
        }
    };
    
    useEffect(() => {
        fetchBreakingNews();
    }, [selectedLanguage]); // Re-fetch when language changes
    



    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
        document.documentElement.style.fontSize = `${fontSize}px`;
        localStorage.setItem("fontSize", fontSize);
    }, [darkMode, fontSize]);

    const handleLanguageChange = (lang) => {
        const languageMap = {
            "English": "en",
            "Hindi": "hi",
            "French": "fr"
        };

    setSelectedLanguage(languageMap[lang]);
    localStorage.setItem("language", languageMap[lang]);
    setLanguageDropdownOpen(false);
};


    const [notificationsEnabled, setNotificationsEnabled] = useState(
        localStorage.getItem("notifications") === "enabled"
    );

    const API_KEY = "ee96a0356556406ab072e24ffb277bfb";

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
    }, [darkMode]);

    useEffect(() => {
        const storedUserName = localStorage.getItem("username");
        if (storedUserName) {
            setUserName(storedUserName);
        }
    }, []);

    // Get email from localStorage (set during login)
    const userEmail = localStorage.getItem("userEmail");

    // Fetch user details from the database based on email
    useEffect(() => {
        if (userEmail) {
            axios.get(`http://localhost:5000/user/email/${userEmail}`)
                .then((response) => {
                    setUser(response.data);
                    setUpdatedName(response.data.name);
                    applyThemePreferences(response.data);
                })
                .catch((error) => console.error("Error fetching user data:", error));
        }
    }, [userEmail]);

    const applyThemePreferences = (userData) => {
    if (userData) {
        const { color, shape, gradient, gradientColor1, gradientColor2 } = userData;
        
        // Set CSS Variables
        document.documentElement.style.setProperty("--theme-color", color);
        document.documentElement.style.setProperty("--theme-shape", shape === "rounded" ? "20px" : "0px");
        
        // Handle Gradient
        if (gradient !== "none") {
            const gradientValue = `linear-gradient(to right, ${gradientColor1}, ${gradientColor2})`;
            document.documentElement.style.setProperty("--theme-gradient", gradientValue);
        } else {
            document.documentElement.style.setProperty("--theme-gradient", color);
        }

        // Update localStorage
        localStorage.setItem("themeColor", color);
        localStorage.setItem("themeShape", shape);
        localStorage.setItem("themeGradient", gradient);
        localStorage.setItem("gradientColor1", gradientColor1);
        localStorage.setItem("gradientColor2", gradientColor2);
    }
};

    
    

    const handleFontSizeChange = (action) => {
        let newSize = fontSize;
    
        if (action === "increase") {
            newSize = fontSize + 2; // Increase font size
        } else if (action === "decrease") {
            newSize = fontSize - 2; // Decrease font size
        } else if (action === "reset") {
            newSize = 16; // Default font size
        }
    
        setFontSize(newSize);
        localStorage.setItem("fontSize", newSize);
        document.documentElement.style.fontSize = `${newSize}px`; // Apply to the whole page
    };
    
    
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}px`;
    }, [fontSize]);
    

    const getData = async () => {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${search}&language=${selectedLanguage}&apiKey=${API_KEY}`);
        const jsonData = await response.json();
        setNewsData(jsonData.articles.slice(0, 12));
    };
    
    const fetchHeadlines = async () => {
        try {
            const response = await fetch(`https://newsapi.org/v2/top-headlines?language=${selectedLanguage}&apiKey=${API_KEY}`);
            const data = await response.json();
            setHeadlines(data.articles.map(article => article.title).slice(0, 10));
        } catch (error) {
            console.error("Error fetching headlines:", error);
        }
    };

    useEffect(() => {
        getData();
        fetchHeadlines();
    }, [selectedLanguage]); // Re-fetch when language changes
    
    

    useEffect(() => { 
        getData(); 
        fetchHeadlines(); 
    }, []);

    const handleLocationSearch = (location) => {
        setSearch(location);
        getData();
        setLocationDropdown(false);
    };

    useEffect(() => {
        fetchWeather("Coimbatore"); // Default city
    }, []);
    

    const handleMenuToggle = () => {
        setMenuOpen(!menuOpen);
    
        if (!menuOpen) {
            fetchWeather("Coimbatore"); // Default location (you can make it dynamic)
        }
    };
    
    const WEATHER_API_KEY = "73c05fd6342a2580bff3e013b1fa1929";

    const fetchWeather = async (city) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`
            );
            const data = await response.json();
            console.log("Weather API Response:", data); // Check API response
    
            if (data.cod !== 200) {
                console.error("Error fetching weather:", data.message);
                return;
            }
    
            setWeather({
                temp: data.main.temp,
                description: data.weather[0].description,
                icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
            });
        } catch (error) {
            console.error("Error fetching weather:", error);
        }
    };
    


    const handleCategoryClick = (category) => {
        setSearch(category);
        getData(category);
        setMenuOpen(false); // Close sidebar after selection
    };

    // Toggle Notifications
    const toggleNotifications = () => {
        if (notificationsEnabled) {
            setNotificationsEnabled(false);
            localStorage.setItem("notifications", "disabled");
            alert("You have turned off global notifications.");
        } else {
            if ("Notification" in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        setNotificationsEnabled(true);
                        localStorage.setItem("notifications", "enabled");
                        alert("You have turned on global notifications!");
                    } else {
                        alert("Please allow notifications to receive updates.");
                    }
                });
            } else {
                alert("Your browser does not support notifications.");
            }
        }
    };

    // Function to show a desktop notification
    const showNotification = (title, description, url) => {
        if (Notification.permission === "granted") {
            const notification = new Notification(title, {
                body: description,
                icon: "https://cdn-icons-png.flaticon.com/512/21/21601.png",
            });

            notification.onclick = () => {
                window.open(url, "_blank");
            };
        }
    };

    // Fetch news every 30 seconds and show a notification
    useEffect(() => {
        if (notificationsEnabled) {
            const interval = setInterval(async () => {
                try {
                    const response = await fetch(`https://newsapi.org/v2/top-headlines?language=en&apiKey=${API_KEY}`);
                    const data = await response.json();
                    if (data.articles.length > 0) {
                        const latestNews = data.articles[0];
                        showNotification(latestNews.title, latestNews.description, latestNews.url);
                    }
                } catch (error) {
                    console.error("Error fetching notifications:", error);
                }
            }, 10000); // Every 30 seconds

            return () => clearInterval(interval);
        }
    }, [notificationsEnabled]);

    return (
        <div className={`news-app ${darkMode ? "dark" : ""}`}>
             {/* Sidebar Menu */}
            <div className={`sidebar ${menuOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={() => setMenuOpen(false)}>
                    <FaTimes />
                </button>
                <h2>Categories</h2>
                <ul>
                    <li onClick={() => handleCategoryClick("world")}>World</li>
                    <li onClick={() => handleCategoryClick("sports")}>Sports</li>
                    <li onClick={() => handleCategoryClick("entertainment")}>Entertainment</li>
                    <li onClick={() => handleCategoryClick("technology")}>Technology</li>
                    <li onClick={() => handleCategoryClick("business")}>Business</li>
                    <li onClick={() => handleCategoryClick("health")}>Health</li>
                    <li onClick={() => handleCategoryClick("science")}>Science</li>
                </ul>

                {weather ? (
                    <div className="weather-info">
                        <h3>Coimbatore</h3>
                        <img src={weather.icon} alt="Weather Icon" />
                        <p>{weather.temp}°C - {weather.description}</p>
                    </div>
                ) : (
                    <p>Loading Weather...</p>
                )}

            </div>

            <nav className="navbar">
                    

                <div className="navbar-brand">
                    <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
                    <h1>InstaNews</h1>
                    <ul className="nav-links">
                        <li><a href="#">Home</a></li>
                        <li className="location-dropdown" onMouseEnter={() => setLocationDropdown(true)} onMouseLeave={() => setLocationDropdown(false)}>
                            <a href="#">Location</a>
                            {locationDropdown && (
                                <ul className="dropdown-menu">
                                    <li onClick={() => handleLocationSearch("Chennai")}>Chennai</li>
                                    <li onClick={() => handleLocationSearch("Banglore")}>Banglore</li>
                                    <li onClick={() => handleLocationSearch("Hyderabad")}>Hyderabad</li>
                                    <li onClick={() => handleLocationSearch("Coimbatore")}>Coimbatore</li>
                                    <li onClick={() => handleLocationSearch("Mumbai")}>Mumbai</li>
                                </ul>
                            )}
                        </li>
                        <li><a href="/dashboard">Dashboard</a></li>
                        <li><a href="aboutus">About Us</a></li>
                        <li><a href="/subscribe">Subscribe</a></li>
                    </ul>
                </div>

                <div className="search-bar">
                    <input type="text" placeholder="Search News" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <button onClick={getData}>Search</button>
                    <FaBell 
                        className={`bell-icon ${notificationsEnabled ? "active" : ""}`} 
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)} 
                    />
                </div>

                {/* User Icon with Dropdown */}
                <div className="user-menu">
    <FaUserCircle className="user-icon" onClick={() => setDropdownOpen(!dropdownOpen)} />
    {dropdownOpen && (
        <div className="dropdown">
            <div className="dropdown-item">
                <FaRegUser className="dropdown-icon" />
                <span>Hi, {user.name}</span>
            </div>
            <Link to="/profile" className="dropdown-item">
                <FaRegUser className="dropdown-icon" />
                <span>Profile</span>
            </Link>
            <hr className="dropdown-divider" />

            {/* Language Selection */}
            <div className="dropdown-item" onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}>
                🌍 <span>Language: {selectedLanguage}</span>
            </div>
            {languageDropdownOpen && (
                <div className="sub-dropdown">
                    <div className="sub-dropdown-item" onClick={() => handleLanguageChange("English")}>English</div>
                    <div className="sub-dropdown-item" onClick={() => handleLanguageChange("Hindi")}>हिन्दी</div>
                    <div className="sub-dropdown-item" onClick={() => handleLanguageChange("French")}>Français</div>
                </div>
            )}

            <hr className="dropdown-divider" />

            {/* Font Size Selection */}
            <div className="dropdown-item" onClick={() => setFontSizeDropdownOpen(!fontSizeDropdownOpen)}>
                🔤 <span>Font Size</span>
            </div>
            {fontSizeDropdownOpen && (
                <div className="sub-dropdown">
                    <div className="sub-dropdown-item" onClick={() => handleFontSizeChange("increase")}>A+</div>
                    <div className="sub-dropdown-item" onClick={() => handleFontSizeChange("reset")}>A</div>
                    <div className="sub-dropdown-item" onClick={() => handleFontSizeChange("decrease")}>A-</div>
                </div>
            )}


                            <hr className="dropdown-divider" />


            <div className="dropdown-item" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <FaSun className="dropdown-icon" /> : <FaMoon className="dropdown-icon" />}
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <hr className="dropdown-divider" />
            <Link to="/" className="dropdown-item">
                <FaSignOutAlt className="dropdown-icon" />
                <span>Log Out</span>
            </Link>
        </div>
    )}
</div>
            </nav>
            <div className="breaking-news-container">
            <span className="breaking-label">Breaking News:</span>
            <div className="breaking-news">
                <marquee scrollamount="6">
                    {breakingNews.length > 0 ? breakingNews.join(" • ") : "Loading breaking news..."}
                </marquee>
            </div>
        </div>

            <header className="hero-section">
                <h1>Stay Updated with InstaNews</h1>
                <p>Your one-stop destination for the latest news around the globe</p>
            </header>

            <main className="news-container">
                {newsData ? <Card data={newsData} /> : <p>Loading News...</p>}
            </main>

            <footer>
                <p>&copy; 2025 InstaNews. All Rights Reserved</p>
            </footer>

            <AlertsPopup />
        </div>
    );
};

export default Newsapp;
