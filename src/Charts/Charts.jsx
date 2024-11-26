// Charts.jsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faChartBar, faChartArea, faChartPie } from "@fortawesome/free-solid-svg-icons"; // Added faChartPie for the sales chart icon
import { useLocation } from "react-router-dom";
import "../css/SupplierMain.css";
import StockOutCharts from "../Charts/StockOutCharts";
import StockInChart from "../Charts/StockInChart";
import SalesTableChart from '../Sales/SalesTableCharts'; // Import the new SalesTableChart component
import CustomerReport from '../CustomerFile/CustomerReport';

const Charts = () => {
  const [activeContent, setActiveContent] = useState("StockInChart"); // Set default active content
  const location = useLocation(); // Get location object
  const { UserName, Store } = location.state || {}; // Default destructuring

  // Toggle functions to switch between different charts
  const toggleStockOutModelReport = () => {
    setActiveContent("StockOutCharts");
  };

  const toggleStockInModelReport = () => {
    setActiveContent("StockInChart");
  };


  const toggleSalesTableChart = () => {
    setActiveContent("SalesTableChart");
  };

  const toggleReportCustomer = () => {
    setActiveContent("CustomerReport");
  };

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
          onClick={toggleReportCustomer}
          aria-label="Toggle Customer Chart"
          className={`toggle-button ${activeContent === "CustomerReport" ? 'active' : ''}`}
        >
          <FontAwesomeIcon className="button-icon" icon={faChartLine} />
          Customer Chart
        </button>
        <button 
          onClick={toggleStockInModelReport}
          aria-label="Toggle Stock In Chart"
          className={`toggle-button ${activeContent === "StockInChart" ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faChartLine} className="button-icon" />
          Stock In Chart
        </button>
        <button 
          onClick={toggleStockOutModelReport}
          aria-label="Toggle Stock Out Chart"
          className={`toggle-button ${activeContent === "StockOutCharts" ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faChartBar} className="button-icon" />
          Stock Out Chart
        </button>
        <button 
          onClick={toggleSalesTableChart}
          aria-label="Toggle Sales Chart"
          className={`toggle-button ${activeContent === "SalesTableChart" ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faChartPie} className="button-icon" />
          Sales Chart
        </button>
      </div>

      {/* Content area for dynamic charts */}
      <div className="supplier-content">
        {activeContent === "StockInChart" && <StockInChart />}
        {activeContent === "StockOutCharts" && <StockOutCharts />}
        {activeContent === "SalesTableChart" && <SalesTableChart store={Store} />}
        {activeContent === "CustomerReport" && <CustomerReport UserName={UserName} store={Store} />}
      </div>
    </div>
  );
};

export default Charts;
