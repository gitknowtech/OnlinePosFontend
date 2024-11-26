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
import "../css1/Customer.css";
import AddCustomer from './AddCustomer';
import ManageCustomer from "./ManageCustomer";
import Creditsales from "./CreditSales";
import CustomerBalance from "./customerBalance";

const Customer = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {};

  // Set default active content to "manageCustomer"
  const [activeContent, setActiveContent] = useState("manageCustomer");

  // Function to toggle the customer content
  const toggleAddCustomer = () => {
    setActiveContent(activeContent === "addCustomer" ? null : "addCustomer");
  };

  const toggleManageCustomer = () => {
    setActiveContent(activeContent === "manageCustomer" ? null : "manageCustomer");
  };

  const toggleCreditCustomer = () => {
    setActiveContent(activeContent === "CreditSales" ? null : "CreditSales");
  };


  const toggleCustomerBalance = () => {
    setActiveContent(activeContent === "CustomerBalance" ? null : "CustomerBalance");
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
        <button onClick={toggleCustomerBalance}>
          <FontAwesomeIcon className="button-icon" icon={faCreditCard} />
          Customer Balance
        </button>
      </div>

      {/* Replace modal with embedded content */}
      <div className="customer-content">
        {activeContent === "addCustomer" && <AddCustomer UserName={UserName} store={Store} />}
        {activeContent === "manageCustomer" && <ManageCustomer UserName={UserName} store={Store} />}
        {activeContent === "CreditSales" && <Creditsales UserName={UserName} store={Store} />}
        {activeContent === "CustomerBalance" && <CustomerBalance UserName={UserName} store={Store} />}
      </div>
    </div>
  );
};

export default Customer;
