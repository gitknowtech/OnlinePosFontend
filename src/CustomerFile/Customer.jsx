import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import {
  faUserPlus,
  faClipboardList,
  faChartLine,
  faCreditCard,
  faAddressCard,
} from "@fortawesome/free-solid-svg-icons";
import "../css1/Customer.css"
import AddCustomer from './AddCustomer';
import ManageCustomer from "./ManageCustomer";
import Creditsales from "./CreditSales";



const Customer = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {};

  const [activeContent, setActiveContent] = useState(null); // Manage active content

  // Function to toggle the customer content
  const toggleAddCustomer = () => {
    if (activeContent === "addCustomer") {
      setActiveContent(null); // Hide add customer if already active
    } else {
      setActiveContent("addCustomer"); // Show add customer
    }
  };

  const toggleManageCustomer = () => {
    if (activeContent === "manageCustomer") {
      setActiveContent(null); // Hide manage customer if already active
    } else {
      setActiveContent("manageCustomer"); // Show manage customer
    }
  };

  const toggleManageCustomerRemoved = () => {
    if (activeContent === "manageCustomerRemoved") {
      setActiveContent(null); // Hide removed customers if already active
    } else {
      setActiveContent("manageCustomerRemoved"); // Show removed customers
    }
  };

  const toggleCustomerReport = () => {
    if (activeContent === "customerReport") {
      setActiveContent(null); // Hide report if already active
    } else {
      setActiveContent("customerReport"); // Show report
    }
  };

  const toggleCreditCustomer = () => {
    if (activeContent === "CreditSales") {
      setActiveContent(null); // Hide report if already active
    } else {
      setActiveContent("CreditSales"); // Show report
    }
  };

  return (
    <div className="customer-panel">
      {/* Display user info */}
      <div className="user-info-panel" style={{ display: "none" }}>
        <p>
          <strong>Username:</strong> {UserName}
        </p>
        <p>
          <strong>Store:</strong> {Store}
        </p>
      </div>

      <div className="button-list">
        <button onClick={toggleManageCustomer}>
          <FontAwesomeIcon className="button-icon" icon={faClipboardList} />
          Manage Customers
        </button>
        <button onClick={toggleAddCustomer}>
          <FontAwesomeIcon className="button-icon" icon={faUserPlus} />
          Add Customer
        </button>
        <button onClick={toggleCreditCustomer}>
          <FontAwesomeIcon className="button-icon" icon={faAddressCard} />
          Credit Sales
        </button>
        <button onClick={toggleCustomerReport}>
          <FontAwesomeIcon className="button-icon" icon={faChartLine} />
          Customer Report
        </button>
        <button id="removed-button" onClick={toggleManageCustomerRemoved}>
          <FontAwesomeIcon className="button-icon" icon={faCreditCard} />
          Removed Customers
        </button>
      </div>

      {/* Replace modal with embedded content */}
      <div className="customer-content">
        {activeContent === "addCustomer" && <AddCustomer UserName={UserName} store={Store} />}
        {activeContent === "manageCustomer" && <ManageCustomer UserName={UserName} store={Store} />}
        {activeContent === "CreditSales" && <Creditsales UserName={UserName} store={Store} />}
      </div>
    </div>
  );
};

export default Customer;