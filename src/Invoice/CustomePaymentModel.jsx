import { useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "../css2/CustomerPaymentModelOverlay.css"; // Import the CSS file

const CustomerPaymentModel = ({ show, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch suggestions based on search input
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/customers?query=${query}`
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching customer suggestions:", error);
    }
  };

  // Fetch customer data by ID after selection
  const fetchCustomerData = async (cusId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customers/${cusId}`
      );
      setSelectedCustomer(response.data);
      setSuggestions([]);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      Swal.fire("Error", "Failed to fetch customer details", "error");
    }
  };

  // Handle selection from suggestions
  const handleSuggestionClick = (customer) => {
    setSearchQuery(customer.cusId);
    fetchCustomerData(customer.cusId);
  };

  // Handle enter key press after entering customer ID
  const handleSearchEnter = () => {
    if (searchQuery) {
      fetchCustomerData(searchQuery);
    }
  };

  return (
    <Modal
      isOpen={show}
      onRequestClose={onClose}
      contentLabel="Customer Payment"
      ariaHideApp={false}
      className="custom-modal-customer-Balance-Paayment"
      overlayClassName="custom-overlay-customer-Balance-Paayment"
    >
      <h2 id="header-customer-Balance-Paayment">Customer Balance</h2>

      {/* Search box */}
      <div id="search-container-customer-Balance-Paayment">
        <label htmlFor="search-input-customer-Balance-Paayment">
          Search Customer:
        </label>
        <input
          id="search-input-customer-Balance-Paayment"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSearchEnter()}
          placeholder="Search by ID, Name, or Mobile"
        />
        {suggestions.length > 0 && (
          <ul id="suggestions-customer-Balance-Paayment">
            {suggestions.map((customer) => (
              <li
                key={customer.cusId}
                onClick={() => handleSuggestionClick(customer)}
              >
                {customer.cusId} - {customer.cusName} ({customer.mobile1})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Display selected customer details */}
      {selectedCustomer && (
        <div id="customer-details-customer-Balance-Paayment">
          <p>
            <strong>ID:</strong> {selectedCustomer.cusId}
          </p>
          <p>
            <strong>Name:</strong> {selectedCustomer.cusName}
          </p>
          <p>
            <strong>Mobile:</strong> {selectedCustomer.mobile1}
          </p>
          <p>
            <strong>ID Number:</strong> {selectedCustomer.idNumber}
          </p>
          <p>
            <strong>Balance:</strong>{" "}
            <span id="balance-amount-customer-Balance-Paayment">
              {selectedCustomer.balance}
            </span>
          </p>
        </div>
      )}

      <button
        id="close-button-customer-Balance-Paayment"
        onClick={onClose}
      >
        Close
      </button>
    </Modal>
  );
};

CustomerPaymentModel.propTypes = {
  show: PropTypes.bool.isRequired, // Validate 'show' prop as a required boolean
  onClose: PropTypes.func.isRequired, // Validate 'onClose' prop as a required function
};

export default CustomerPaymentModel;
