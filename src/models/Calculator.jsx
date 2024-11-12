import React, { useState, useEffect } from "react";
import "../css1/calculator.css"; // Link your CSS file

export default function Calculator({ show, onClose }) {
  const [input, setInput] = useState("");

  // Handle button clicks
  const handleButtonClick = (value) => {
    if (value === "C") {
      setInput("");
    } else if (value === "DEL") {
      setInput((prev) => prev.slice(0, -1));
    } else if (value === "=") {
      try {
        setInput((prev) => eval(prev).toString()); // Evaluate the expression
      } catch {
        setInput("Error");
      }
    } else {
      setInput((prev) => prev + value);
    }
  };

  // Handle keyboard inputs
  const handleKeyDown = (event) => {
    const { key } = event;

    if (key === "Enter") {
      // Evaluate the expression
      try {
        setInput((prev) => eval(prev).toString());
      } catch {
        setInput("Error");
      }
    } else if (key === "Backspace") {
      setInput((prev) => prev.slice(0, -1));
    } else if (key === "Escape") {
      onClose(); // Close the calculator
    } else if (
      ["+", "-", "*", "/", ".", "C"].includes(key) || // Allow decimal point
      (!isNaN(key) && key !== " ")
    ) {
      setInput((prev) => prev + key); // Append valid keys
    }
  };

  // Attach and detach event listener
  useEffect(() => {
    if (show) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div id="calculator-modal">
      <div id="calculator-container">
        <div id="calculator-header">
          <h2>Calculator</h2>
          <button id="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div id="calculator-display">
          <input type="text" value={input} readOnly />
        </div>
        <div id="calculator-buttons">
          {["7", "8", "9", "DEL", "4", "5", "6", "/", "1", "2", "3", "*", "C", "0", ".", "=", "-", "+"].map(
            (value, index) => (
              <button key={index} onClick={() => handleButtonClick(value)}>
                {value}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
