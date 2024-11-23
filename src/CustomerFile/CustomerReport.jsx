import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import Swal from "sweetalert2";
import "../css/CustomerReport.css"; // Import CSS file

const CustomerReport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartInstance, setChartInstance] = useState(null);

  // Function to fetch customer report
  const fetchCustomerReport = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customer/report`,
        {
          params: { query: searchQuery, startDate, endDate },
        }
      );

      const sales = response.data.sales;

      if (sales.length > 0) {
        setSalesData(sales);
        updateChart(sales); // Update the chart with the fetched sales data
        Swal.fire({
          icon: "success",
          title: "Data Loaded",
          text: "Customer sales data has been successfully loaded.",
        });
      } else {
        setSalesData([]);
        clearChart(); // Clear the chart if no data is found
        Swal.fire({
          icon: "info",
          title: "No Data",
          text: "No data found for the given search and date range.",
        });
      }
    } catch (error) {
      console.error("Error fetching customer report:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch customer details. Please try again.",
      });
    }
  };

  // Function to update the chart
  const updateChart = (sales) => {
    const ctx = document.getElementById("customer-sales-chart").getContext("2d");

    const labels = sales.map(
      (sale) =>
        `${sale.invoiceId} (${new Date(sale.createdAt).toLocaleDateString()})`
    );
    const data = sales.map((sale) => sale.GrossTotal);

    // Destroy existing chart if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Create a new chart instance
    const newChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Customer Purchases",
            data: data,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
            pointStyle: "circle",
            pointRadius: 5,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                const sale = sales[index];
                return `Invoice: ${sale.invoiceId}, Price: $${sale.GrossTotal}`;
              },
            },
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Invoices",
            },
          },
          y: {
            title: {
              display: true,
              text: "Gross Total",
            },
          },
        },
      },
    });

    setChartInstance(newChartInstance); // Save the chart instance to state
  };

  // Function to clear the chart
  const clearChart = () => {
    if (chartInstance) {
      chartInstance.destroy();
    }
  };

  return (
    <div id="container-customer-report">
      <h2 id="title-customer-report">Customer Sales Report</h2>

      <div id="search-container-customer-report">
        <input
          type="text"
          id="search-box-customer-report"
          placeholder="Customer ID or Mobile"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button id="search-button-customer-report" onClick={fetchCustomerReport}>
          Search
        </button>
      </div>

      <div id="chart-container-customer-report">
        <canvas id="customer-sales-chart"></canvas>
      </div>
    </div>
  );
};

export default CustomerReport;
