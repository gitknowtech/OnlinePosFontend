// src/components/StartCashModal.jsx

import React, { useState } from "react";
import "../css/Dashboard.css";

const StartCashModal = ({ onSave, onCancel, error }) => {
  const [amount, setAmount] = useState("");

  const handleSave = () => {
    if (amount === "" || isNaN(amount) || parseFloat(amount) < 0) {
      alert("Please enter a valid positive number.");
      return;
    }
    onSave(parseFloat(amount));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Enter Start Cash Balance</h2>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="0"
        />
        {error && <p className="error-message">{error}</p>}
        <div className="modal-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default StartCashModal;
