import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faChartBar, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import "../css1/ReportsMain.css"

const SalesReport = () => <div>Sales Report Content</div>;
const InventoryReport = () => <div>Inventory Report Content</div>;
const PendingReports = () => <div>Reports are Pending, Not Added</div>;

const Reports = () => {
  // Default active content
  const [activeContent, setActiveContent] = useState("pending");

  const toggleSalesReport = () => {
    setActiveContent(activeContent === "sales" ? null : "sales");
  };

  const toggleInventoryReport = () => {
    setActiveContent(activeContent === "inventory" ? null : "inventory");
  };

  const togglePendingReports = () => {
    setActiveContent(activeContent === "pending" ? null : "pending");
  };

  return (
    <div className="reports-panel">
      {/* Report navigation buttons */}
      <div className="button-list">
        <button onClick={toggleSalesReport}>
          <FontAwesomeIcon className="button-icon" icon={faChartBar} />
          Sales Report
        </button>
        <button onClick={toggleInventoryReport}>
          <FontAwesomeIcon className="button-icon" icon={faFileAlt} />
          Inventory Report
        </button>
        <button onClick={togglePendingReports}>
          <FontAwesomeIcon className="button-icon" icon={faExclamationCircle} />
          Pending Reports
        </button>
      </div>

      {/* Dynamic content based on the selected button */}
      <div className="report-content">
        {activeContent === "sales" && <SalesReport />}
        {activeContent === "inventory" && <InventoryReport />}
        {activeContent === "pending" && <PendingReports />}
      </div>
    </div>
  );
};

export default Reports;
