import React from "react";
import "./Subscribe.css";
import { useNavigate } from "react-router-dom"; 

const SubscriptionPage = () => {
    const navigate = useNavigate();

    const handlepay = () => {
        navigate("/pay");
    };

    const handleback = () => {
        navigate("/Newsapp");
    };

    return (
        <div className="subscription-container">
            <h1 className="title">Choose Your Plan</h1>
            <div className="plans">
                <div className="plan free-plan hover-effect" style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", transition: "transform 0.3s ease-in-out", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: "350px", minHeight: "450px", padding: "20px" }}>
                    <h2>Free Plan (Basic )</h2>
                    <hr />
                    <p>✅ Limited access to news articles (e.g., 5–10 articles per month)</p>
                    <p>✅ Standard news updates (no real-time or premium content)</p>
                    <p>✅ Basic search functionality</p>
                    <p>✅ Limited customization (only select categories)</p>
                    <p>✅ Ads displayed on the website</p>
                    <p>✅ No access to premium features like offline reading</p>
                    <button className="plan-button" onClick={handleback}>Subscribe</button>
                </div>
                <div className="plan subscription-plan hover-effect" style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", transition: "transform 0.3s ease-in-out", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", width: "350px", minHeight: "450px", padding: "20px" }}>
                    <h2>Subscription Plan (Premium)</h2>
                    <hr />
                    <p>🚀 Unlimited access to all articles</p>
                    <p>🚀 Ad-free browsing experience</p>
                    <p>🚀 Exclusive premium content & in-depth analysis</p>
                    <p>🚀 Personalized news recommendations</p>
                    <p>🚀 Priority access to breaking news alerts</p>
                    <button className="plan-button" onClick={handlepay}>Subscribe</button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
