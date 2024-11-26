import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from "react-router-dom";
import {
    
} from "@fortawesome/free-solid-svg-icons";
import "../css/SupplierMain.css";
import StockOutReport from "../Reports/StockOutReport";





const Reports = () => {
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {}; // Default destructuring

  // Set default active content to "manageSupplier"
  const [activeContent, setActiveContent] = useState("manageSupplier");

  const toggleStockOutModelReport = () => {
    setActiveContent(activeContent === "StockOutReport" ? null : "StockOutReport");
  };

  return (
    <div className="supplier-panel">
      {/* Display user info */}
      <div className="user-info-panel" style={{ display: "none" }}>
        <p><strong>Username:</strong> {UserName}</p>
        <p><strong>Store:</strong> {Store}</p>
      </div>

      <div className="button-list">
        <button onClick={toggleStockOutModelReport}>
          <FontAwesomeIcon className="button-icon" />
                StockOut Report
        </button>
      </div>

      {/* Content area for dynamic supplier or purchase details */}
      <div className="supplier-content">
        {activeContent === "StockOutReport" && <StockOutReport UserName={UserName} store={Store} />}
      </div>
    </div>
  );
};

export default Reports;
