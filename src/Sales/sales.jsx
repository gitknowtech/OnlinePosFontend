import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import { faList, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2"; // SweetAlert2 for alerts
import "../css/SupplierMain.css";
import InvoiceTable from "./InvoiceTable";
import SalesTable from "./SalesTable";

const Sales = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {}; // Default destructuring

  // State for active content and loading state
  const [activeContent, setActiveContent] = useState(null); // Null by default
  const [loading, setLoading] = useState(false); // Track loading state

  // Function to handle access check and load content
  const handleAccessCheck = async (section) => {
    try {
      setLoading(true); // Start loading

      const response = await fetch(`http://localhost:5000/api/access/${UserName}/${section}`);
      if (!response.ok) {
        throw new Error("Failed to fetch access rights.");
      }

      const data = await response.json();
      if (data.access) {
        setActiveContent(section); // Allow access and load content
      } else {
        // Show SweetAlert message if access is denied
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Please ask access to go to the page.",
        });
        setActiveContent(null); // Prevent content load
      }
    } catch (error) {
      console.error("Error checking access:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to check access. Please try again later.",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="supplier-panel">
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
        <button onClick={() => handleAccessCheck("InvoiceList")}>
          <FontAwesomeIcon className="button-icon" icon={faFileInvoice} />
          Invoice List
        </button>
        <button onClick={() => handleAccessCheck("SalesList")}>
          <FontAwesomeIcon className="button-icon" icon={faList} />
          Sales List
        </button>
      </div>

      {/* Content area for dynamic sales or invoice list */}
      <div className="sales-content">
        {loading && <p>Loading...</p>} {/* Show loading message */}
        {activeContent === "InvoiceList" && <InvoiceTable UserName={UserName} store={Store} />}
        {activeContent === "SalesList" && <SalesTable UserName={UserName} store={Store} />}
      </div>
    </div>
  );
};

export default Sales;
