import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import CreditSalesNew from "./CreditSalesNew"; // Import the CreditSalesNew component
import "../css2/customerBalance.css";

const CustomerBalance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerBalance, setCustomerBalance] = useState(null);

  // Fetch suggestions based on search query
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/customer/search_customer_balance_jsx",
          { params: { query } }
        );
        setSuggestions(response.data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch customer suggestions. Please try again.",
        });
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion click and fetch customer balance
  const handleSuggestionClick = async (customer) => {
    setSearchQuery(customer.cusId); // Set the search query to selected customer's ID
    setSelectedCustomer(customer); // Save selected customer details
    setSuggestions([]); // Clear suggestions dropdown

    try {
      const response = await axios.get(
        "http://localhost:5000/api/customer/calculate_customer_balance",
        { params: { customerId: customer.cusId } }
      );
      setCustomerBalance(response.data.totalBalance);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch customer balance. Please try again.",
      });
    }
  };

  return (
    <div id="container-customer-balance">
      <h2 id="title-customer-balance">Customer Balance</h2>
      <div id="search-container-customer-balance">
        <input
          type="text"
          id="search-box-customer-balance"
          placeholder="Search by ID, Name, Mobile"
          value={searchQuery}
          autoComplete="off"
          onChange={handleSearchChange}
        />
        {suggestions.length > 0 && (
          <ul id="suggestions-list-customer-balance">
            {suggestions.map((customer) => (
              <li
                key={customer.cusId}
                onClick={() => handleSuggestionClick(customer)}
              >
                {`${customer.cusId} - ${customer.cusName}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedCustomer && (
        <div id="details-panel-customer-balance">
          <h3 id="details-title-customer-balance" style={{ fontSize: "1rem" }}>
            Customer Details
          </h3>
          <div id="details-grid-customer-balance">
            <div>
              <strong>ID:</strong>
            </div>
            <div>{selectedCustomer.cusId}</div>
            <div>
              <strong>Name:</strong>
            </div>
            <div>{selectedCustomer.cusName}</div>
            <div>
              <strong>Mobile 1:</strong>
            </div>
            <div>{selectedCustomer.mobile1}</div>
            <div>
              <strong>Mobile 2:</strong>
            </div>
            <div>{selectedCustomer.mobile2 || "N/A"}</div>
            <div>
              <strong>Address:</strong>
            </div>
            <div>{selectedCustomer.address1 || "N/A"}</div>
          </div>
        </div>
      )}

      {customerBalance !== null && (
        <div id="balance-panel-customer-balance">
          <p id="balance-amount-customer-balance">
            <strong>Total Balance:</strong> {customerBalance.toFixed(2)}
          </p>
        </div>
      )}

    </div>
  );
};

export default CustomerBalance;
