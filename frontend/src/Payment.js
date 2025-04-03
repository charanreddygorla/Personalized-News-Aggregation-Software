import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css"; // Ensure this file exists for styling

const Payment = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const amount = 399; // Fixed payment amount

  const handlePayment = () => {
    alert(`✅ Payment of ₹${amount} successful!`);
    navigate("/Newsapp"); // Redirect to another page after payment
  };

  return (
    <div className="payment-container">
      <h1>💳 Payment Page</h1>
      
      <div className="payment-details">
        <p><strong>💰 Amount:</strong> ₹{amount}</p>
      </div>

      <div className="payment-method">
        <h3>Select Payment Method:</h3>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="credit_card">💳 Credit Card</option>
          <option value="debit_card">🏦 Debit Card</option>
          <option value="upi">📲 UPI</option>
          <option value="net_banking">🌐 Net Banking</option>
        </select>
      </div>

      <button className="confirm-payment-button" onClick={handlePayment}>
        Confirm Payment
      </button>
    </div>
  );
};

export default Payment;
