import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // For access denial alerts
import {
  faUserPlus,
  faClipboardList,
  faChartLine,
  faCreditCard,
  faAddressCard,
} from "@fortawesome/free-solid-svg-icons";
import "../css1/Customer.css";
import AddCustomer from "./AddCustomer";
import ManageCustomer from "./ManageCustomer";
import Creditsales from "./CreditSales";
import CustomerBalance from "./customerBalance";

const Customer = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {};

  // State to manage active content and access rights
  const [activeContent, setActiveContent] = useState("CustomerBalance"); // Default to null
  const [accessRights, setAccessRights] = useState({
    ManageCustomer: false,
    AddCustomer: false,
    CreditSales: false,
    CustomerBalance: false,
  });
  const [loading, setLoading] = useState(true);

  // Fetch access rights for all sections
  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        const sections = [
          "ManageCustomer",
          "AddCustomer",
          "CreditSales",
          "CustomerBalance",
        ];

        const accessPromises = sections.map((section) =>
          fetch(`http://localhost:5000/api/access/${UserName}/${section}`)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Failed to fetch access for ${section}`);
              }
              return res.json();
            })
            .then((data) => ({ [section]: data.access }))
            .catch((err) => {
              console.error(err);
              return { [section]: false }; // Default to no access on error
            })
        );

        const accessResults = await Promise.all(accessPromises);
        const accessObject = accessResults.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        );

        setAccessRights(accessObject); // Update access rights state
      } catch (error) {
        console.error("Error fetching access rights:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load access rights. Please try again later.",
        });
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (UserName) {
      fetchAccessRights();
    }
  }, [UserName]);

  // Handle access check and toggle content
  const handleAccessCheck = (section, toggleFunction) => {
    if (accessRights[section]) {
      toggleFunction(); // Toggle content if access is granted
    } else {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You do not have access to this section. Please request access.",
      });
    }
  };

  // Toggle functions for each content
  const toggleAddCustomer = () =>
    setActiveContent(activeContent === "addCustomer" ? null : "addCustomer");

  const toggleManageCustomer = () =>
    setActiveContent(activeContent === "manageCustomer" ? null : "manageCustomer");

  const toggleCreditCustomer = () =>
    setActiveContent(activeContent === "CreditSales" ? null : "CreditSales");

  const toggleCustomerBalance = () =>
    setActiveContent(activeContent === "CustomerBalance" ? null : "CustomerBalance");

  if (loading) {
    return <div>Loading...</div>;
  }

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

      {/* Button List */}
      <div className="button-list">
        <button onClick={() => handleAccessCheck("ManageCustomer", toggleManageCustomer)}>
          <FontAwesomeIcon className="button-icon" icon={faClipboardList} />
          Manage Customers
        </button>
        <button onClick={() => handleAccessCheck("AddCustomer", toggleAddCustomer)}>
          <FontAwesomeIcon className="button-icon" icon={faUserPlus} />
          Add Customer
        </button>
        <button onClick={() => handleAccessCheck("CreditSales", toggleCreditCustomer)}>
          <FontAwesomeIcon className="button-icon" icon={faAddressCard} />
          Credit Sales
        </button>
        <button onClick={() => handleAccessCheck("CustomerBalance", toggleCustomerBalance)}>
          <FontAwesomeIcon className="button-icon" icon={faCreditCard} />
          Customer Balance
        </button>
      </div>

      {/* Replace modal with embedded content */}
      <div className="customer-content">
        {activeContent === "addCustomer" && <AddCustomer UserName={UserName} store={Store} />}
        {activeContent === "manageCustomer" && (
          <ManageCustomer UserName={UserName} store={Store} />
        )}
        {activeContent === "CreditSales" && <Creditsales UserName={UserName} store={Store} />}
        {activeContent === "CustomerBalance" && (
          <CustomerBalance UserName={UserName} store={Store} />
        )}
      </div>
    </div>
  );
};

export default Customer;
