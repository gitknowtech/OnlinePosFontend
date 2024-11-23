import { useState } from "react";
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

  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [paymentStartDate, setPaymentStartDate] = useState("");
  const [paymentEndDate, setPaymentEndDate] = useState("");
  const [loanChartInstance, setLoanChartInstance] = useState(null);

  // Function to fetch customer sales report
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
        updateSalesChart(sales);
        Swal.fire({
          icon: "success",
          title: "Data Loaded",
          text: "Customer sales data has been successfully loaded.",
        });
      } else {
        setSalesData([]);
        clearChart(chartInstance);
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
        text: "Failed to fetch customer sales data. Please try again.",
      });
    }
  };

  // Function to fetch loan payment report
  const fetchLoanPayments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customer/fetch_loan_payments`,
        {
          params: {
            invoiceId: invoiceSearch,
            startDate: paymentStartDate,
            endDate: paymentEndDate,
          },
        }
      );

      const payments = response.data;

      if (payments.length > 0) {
        updateLoanChart(payments);
        Swal.fire({
          icon: "success",
          title: "Data Loaded",
          text: "Loan payment data has been successfully loaded.",
        });
      } else {
        clearChart(loanChartInstance);
        Swal.fire({
          icon: "info",
          title: "No Data",
          text: "No loan payment data found for the given search and date range.",
        });
      }
    } catch (error) {
      console.error("Error fetching loan payments:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch loan payment data. Please try again.",
      });
    }
  };

  // Function to update the sales chart
  const updateSalesChart = (sales) => {
    const ctx = document.getElementById("customer-sales-chart").getContext("2d");

    const labels = sales.map(
      (sale) =>
        `${sale.invoiceId} (${new Date(sale.createdAt).toLocaleDateString()})`
    );
    const data = sales.map((sale) => sale.GrossTotal);

    if (chartInstance) chartInstance.destroy();

    const newChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Customer Purchases",
            data,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
          },
        ],
      },
    });

    setChartInstance(newChartInstance);
  };

  // Function to update the loan payments chart
  const updateLoanChart = (payments) => {
    const ctx = document
      .getElementById("customer-loan-chart")
      .getContext("2d");

    const labels = payments.map(
      (payment) =>
        `${payment.invoiceId} (${new Date(payment.saveTime).toLocaleDateString()})`
    );
    const data = payments.map((payment) => payment.totalPayment);

    if (loanChartInstance) loanChartInstance.destroy();

    const newLoanChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Loan Payments",
            data,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
          },
        ],
      },
    });

    setLoanChartInstance(newLoanChartInstance);
  };

  // Function to clear a chart
  const clearChart = (chart) => {
    if (chart) chart.destroy();
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
          id="start-date-customer-report"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          id="end-date-customer-report"
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

      <h2 id="title-loan-payment-report">Customer Loan Payment Report</h2>
      <div id="search-container-loan-report">
        <input
          type="text"
          id="invoice-search"
          placeholder="Invoice ID"
          value={invoiceSearch}
          onChange={(e) => setInvoiceSearch(e.target.value)}
        />
        <input
          type="date"
          id="payment-start-date-customer-report"
          value={paymentStartDate}
          onChange={(e) => setPaymentStartDate(e.target.value)}
        />
        <input
          type="date"
          id="payment-end-date-customer-report"
          value={paymentEndDate}
          onChange={(e) => setPaymentEndDate(e.target.value)}
        />
        <button id="search-button-loan-report" onClick={fetchLoanPayments}>
          Search
        </button>
      </div>

      <div id="chart-container-loan-report">
        <canvas id="customer-loan-chart"></canvas>
      </div>
    </div>
  );
};

export default CustomerReport;
