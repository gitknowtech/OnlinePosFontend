import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../css1/calculator.css"; // Link your CSS file

export default function Calculator({ show, onClose }) {
  const [input, setInput] = useState("0");

  // Handle button clicks
  const handleButtonClick = (value) => {
    if (value === "C") {
      setInput("0"); // Reset to "0"
    } else if (value === "DEL") {
      setInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0")); // Reset to "0" if input becomes empty
    } else if (value === "=") {
      try {
        setInput((prev) => eval(prev).toString()); // Evaluate the expression
      } catch {
        setInput("Error");
      }
    } else {
      setInput((prev) => (prev === "0" ? value : prev + value)); // Replace "0" with the new value
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
      setInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0")); // Reset to "0" if input becomes empty
    } else if (key === "Escape") {
      onClose(); // Close the calculator
    } else if (
      ["+", "-", "*", "/", ".", "C"].includes(key) || // Allow decimal point
      (!isNaN(key) && key !== " ")
    ) {
      setInput((prev) => (prev === "0" ? key : prev + key)); // Replace "0" with the new value
    }
  };

  // Attach and detach event listener
  useEffect(() => {
    if (show) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      setInput("0"); // Reset input to "0" when calculator is closed
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
          <button id="close-button-calculator" onClick={() => { setInput("0"); onClose(); }}>
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

// Define prop types for the component
Calculator.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
