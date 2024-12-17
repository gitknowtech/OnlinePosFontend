import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faChartBar, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // For access denial alerts
import "../css/SupplierMain.css";
import StockOutCharts from "../Charts/StockOutCharts";
import StockInChart from "../Charts/StockInChart";
import SalesTableChart from "../Sales/SalesTableCharts";
import CustomerReport from "../CustomerFile/CustomerReport";

const Charts = () => {
  const [activeContent, setActiveContent] = useState("SaleChart"); // Default to null
  const [accessRights, setAccessRights] = useState({
    CustomerChart: false,
    StockChart: false,
    StockOutChart: false,
    SaleChart: false,
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { UserName, Store } = location.state || {};

  // Fetch access rights for charts
  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        const sections = ["CustomerChart", "StockChart", "StockOutChart", "SaleChart"];
        
        const accessPromises = sections.map((section) =>
          fetch(`http://154.26.129.243:5000/api/access/${UserName}/${section}`)
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

  // Toggle functions for different charts
  const toggleCustomerChart = () => setActiveContent(activeContent === "CustomerChart" ? null : "CustomerChart");
  const toggleStockInChart = () => setActiveContent(activeContent === "StockChart" ? null : "StockChart");
  const toggleStockOutChart = () => setActiveContent(activeContent === "StockOutChart" ? null : "StockOutChart");
  const toggleSalesChart = () => setActiveContent(activeContent === "SaleChart" ? null : "SaleChart");

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="supplier-panel">
      {/* Display user info */}
      <div className="user-info-panel" style={{ display: "none" }}>
        <p><strong>Username:</strong> {UserName}</p>
        <p><strong>Store:</strong> {Store}</p>
      </div>

      {/* Buttons to toggle different charts */}
      <div className="button-list">
        <button 
          onClick={() => handleAccessCheck("CustomerChart", toggleCustomerChart)}
          aria-label="Toggle Customer Chart"
          className={`toggle-button ${activeContent === "CustomerChart" ? 'active' : ''}`}
        >
          <FontAwesomeIcon className="button-icon" icon={faChartLine} />
          Customer Chart
        </button>
        <button 
          onClick={() => handleAccessCheck("StockChart", toggleStockInChart)}
          aria-label="Toggle Stock In Chart"
          className={`toggle-button ${activeContent === "StockChart" ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faChartLine} className="button-icon" />
          Stock In Chart
        </button>
        <button 
          onClick={() => handleAccessCheck("StockOutChart", toggleStockOutChart)}
          aria-label="Toggle Stock Out Chart"
          className={`toggle-button ${activeContent === "StockOutChart" ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faChartBar} className="button-icon" />
          Stock Out Chart
        </button>
        <button 
          onClick={() => handleAccessCheck("SaleChart", toggleSalesChart)}
          aria-label="Toggle Sales Chart"
          className={`toggle-button ${activeContent === "SaleChart" ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faChartPie} className="button-icon" />
          Sales Chart
        </button>
      </div>

      {/* Content area for dynamic charts */}
      <div className="supplier-content">
        {activeContent === "CustomerChart" && <CustomerReport UserName={UserName} store={Store} />}
        {activeContent === "StockChart" && <StockInChart />}
        {activeContent === "StockOutChart" && <StockOutCharts />}
        {activeContent === "SaleChart" && <SalesTableChart store={Store} />}
      </div>
    </div>
  );
};

export default Charts;
