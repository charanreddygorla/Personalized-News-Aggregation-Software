import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import Preferences from "./Preferences";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
    const [activeSection, setActiveSection] = useState("profile");
    const [user, setUser] = useState({ name: "", email: "" });
    const [updatedName, setUpdatedName] = useState("");
    const [updatedEmail, setUpdatedEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [selectedColor, setSelectedColor] = useState("#007bff");
    const [selectedShape, setSelectedShape] = useState("rounded");
    const [selectedGradient, setSelectedGradient] = useState("none");
    const [gradientColor1, setGradientColor1] = useState("#ff7e5f");
    const [gradientColor2, setGradientColor2] = useState("#feb47b");
    const navigate = useNavigate(); 

    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        if (userEmail) {
            axios.get(`http://localhost:5000/user/email/${userEmail}`)
                .then((response) => {
                    setUser(response.data);
                    setUpdatedName(response.data.name);
                    setUpdatedEmail(response.data.email);
                    setSelectedColor(response.data.color || "#ffffff");
                    setSelectedShape(response.data.shape || "square");
                    setSelectedGradient(response.data.gradient || "none");
                    setGradientColor1(response.data.gradientColor1 || "#ff7e5f");
                    setGradientColor2(response.data.gradientColor2 || "#feb47b");
                })
                .catch((error) => console.error("Error fetching user data:", error));
        }
    }, [userEmail]);

    const handleUpdate = () => {
        axios.post("http://localhost:5000/update-user", {
            email: userEmail, 
            name: updatedName,
            newEmail: updatedEmail, 
        })
        .then((response) => {
            alert(response.data.message);
            setUser({ name: updatedName, email: updatedEmail });
            localStorage.setItem("userEmail", updatedEmail);
        })
        .catch((error) => {
            console.error("Error updating user:", error);
            alert("Failed to update user details.");
        });
    };

    const handlePasswordUpdate = () => {
        if (!oldPassword || !newPassword) {
            alert("Please enter both old and new passwords.");
            return;
        }

        axios.post("http://localhost:5000/update-password", {
            email: userEmail,
            oldPassword,
            newPassword,
        })
        .then((response) => {
            alert(response.data.message);
            setOldPassword("");
            setNewPassword("");
        })
        .catch((error) => {
            alert(error.response?.data?.message || "Failed to update password.");
        });
    };


    // **Gradient Selection**
    const handleGradientChange = (gradientType) => {
        setSelectedGradient(gradientType);

        // Ensure colors are set when a gradient is selected
        if (gradientType !== "none") {
            if (!gradientColor1) setGradientColor1("#ff7e5f");
            if (!gradientColor2) setGradientColor2("#feb47b");
        }
    };


    // **Save Theme Preferences**
    const handleThemeSave = () => {
        if (!userEmail) {
            alert("Please log in to save preferences.");
            return;
        }

        axios.post("http://localhost:5000/save-theme", {
            email: userEmail,
            color: selectedColor,
            shape: selectedShape,
            gradient: selectedGradient,
            gradientColor1: selectedGradient === "none" ? null : gradientColor1,
            gradientColor2: selectedGradient === "none" ? null : gradientColor2
        })
        .then(() => alert("Theme saved successfully!"))
        .catch(error => console.error("Error saving theme:", error));
    };

    const handleBack = () => {
        navigate("/Newsapp");
    };
    
    return (
        <div className="profile-container">
            {/* Sidebar */}
            <div className="profile-sidebar">
                <div className="sidebar-buttons">
                    <button 
                        className={`sidebar-btn ${activeSection === "profile" ? "active" : ""}`}
                        onClick={() => setActiveSection("profile")}
                    >
                        User Profile
                    </button>
                    <button 
                        className={`sidebar-btn ${activeSection === "password" ? "active" : ""}`}
                        onClick={() => setActiveSection("password")}
                    >
                        Update Password
                    </button>
                    <button 
                        className={`sidebar-btn ${activeSection === "preferences" ? "active" : ""}`}
                        onClick={() => setActiveSection("preferences")}
                    >
                        Preferences
                    </button>
                    <button 
                        className={`sidebar-btn ${activeSection === "themes" ? "active" : ""}`}
                        onClick={() => setActiveSection("themes")}
                    >
                        Themes
                    </button>
                    <button className="sidebar-btn" onClick={handleBack}>
                        Back
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="content-left">
                {activeSection === "profile" && (
                    <div className="user-profile">
                        <h2>User Profile</h2>
                        <form>
                            <div className="form-group">
                                <label>Username:</label>
                                <input 
                                    type="text" 
                                    placeholder={user.name || "Enter new username"} 
                                    value={updatedName === user.name ? "" : updatedName}
                                    onChange={(e) => setUpdatedName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email:</label>
                                <input 
                                    type="email" 
                                    placeholder={user.email || "Enter new email"} 
                                    value={updatedEmail === user.email ? "" : updatedEmail}
                                    onChange={(e) => setUpdatedEmail(e.target.value)}
                                />
                            </div>
                            <button type="button" onClick={handleUpdate}>Save Changes</button>
                        </form>
                    </div>
                )}

                {activeSection === "password" && (
                    <div className="user-profile">
                        <h2>Update Password</h2>
                        <form>
                            <div className="form-group">
                                <label>Old Password:</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter old password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password:</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <button type="button" onClick={handlePasswordUpdate}>Update Password</button>
                        </form>
                    </div>
                )}

                {activeSection === "preferences" && <Preferences />}

                {activeSection === "themes" && (
                    <div className="themes-section">
                    <h2>Select Theme</h2>
                    
                    {/* Color Picker */}
                    <div className="theme-options">
                        <label>Color:</label>
                        <input 
                            type="color" 
                            value={selectedColor} 
                            onChange={(e) => setSelectedColor(e.target.value)} 
                        />
                    </div>
        
                    {/* Shape Selection */}
                    <div className="theme-options">
                        <label>Shape:</label>
                        <select value={selectedShape} onChange={(e) => setSelectedShape(e.target.value)}>
                            <option value="rounded">Rounded</option>
                            <option value="square">Square</option>
                        </select>
                    </div>
        
                    {/* Gradient Selection */}
                    <div className="theme-options">
                        <label>Gradient:</label>
                        <select value={selectedGradient} onChange={(e) => setSelectedGradient(e.target.value)}>
                            <option value="none">None</option>
                            <option value="linear">Linear</option>
                            <option value="radial">Radial</option>
                        </select>
                    </div>
        
                    {/* Gradient Colors (Only if gradient is selected) */}
                    {selectedGradient !== "none" && (
                        <div className="gradient-colors">
                            <label>Gradient Colors:</label>
                            <input type="color" value={gradientColor1} onChange={(e) => setGradientColor1(e.target.value)} />
                            <input type="color" value={gradientColor2} onChange={(e) => setGradientColor2(e.target.value)} />
                        </div>
                    )}
        
                    <button type="button" onClick={handleThemeSave}>Save Changes</button>
                </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
