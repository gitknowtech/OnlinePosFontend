import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "../css1/salesTable.css";

const SalesTable = ({ store }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]); // Default to today
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]); // Default to today
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        console.log("API Request Parameters:", { Store: store });
        const response = await axios.get("http://localhost:5000/api/invoices/fetch_sales", {
          params: { Store: store },
        });
        console.log("Fetched sales:", response.data);
        setSales(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching sales:", err);
        setError(`Failed to load sales: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    fetchSales();
  }, [store]);

  if (loading) {
    return <p>Loading sales...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (sales.length === 0) {
    return <p>No sales found for the selected store.</p>;
  }

  // Ensure the date range is inclusive
  const isDateInRange = (saleDate, start, end) => {
    const sale = new Date(saleDate).setHours(0, 0, 0, 0); // Normalize to 00:00
    const startNormalized = new Date(start).setHours(0, 0, 0, 0);
    const endNormalized = new Date(end).setHours(23, 59, 59, 999); // Inclusive of the end date
    return sale >= startNormalized && sale <= endNormalized;
  };

  // Filter sales based on search query and date range
  const filteredSales = sales.filter((sale) => {
    const matchesSearchQuery = sale.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
    const withinDateRange = isDateInRange(sale.createdAt, startDate, endDate);
    return matchesSearchQuery && withinDateRange;
  });

  // Calculate totals for filtered data
  const totals = filteredSales.reduce(
    (acc, sale) => {
      acc.discountAmount += parseFloat(sale.discountAmount) || 0;
      acc.netAmount += parseFloat(sale.netAmount) || 0;
      acc.cardAmount += parseFloat(sale.CardPay) || 0;
      acc.cashAmount += parseFloat(sale.CashPay) || 0;
      return acc;
    },
    { discountAmount: 0, netAmount: 0, cardAmount: 0, cashAmount: 0 }
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSales.slice(indexOfFirstRow, indexOfLastRow);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const getPaginationNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= totalPages; i++) {
      numbers.push(i);
    }
    return numbers;
  };

  return (
    <div className="sales-table-container_salesTable">
      <div className="filters-container">
        {/* Search Box */}
        <div className="search-box-salesTable">
          <input
            type="text"
            placeholder="Search by Invoice ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Date Range Filters */}
        <div className="date-range-filters">
          <div className="date-picker">
            <label htmlFor="start-date">Start Date:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-picker">
            <label htmlFor="end-date">End Date:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      </div>

      <table className="sales-table_salesTable">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Gross Total</th>
            <th>Customer ID</th>
            <th>Discount %</th>
            <th>Discount Amount</th>
            <th>Net Amount</th>
            <th>Cash Pay</th>
            <th>Card Pay</th>
            <th>Payment Type</th>
            <th>Balance</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((sale, index) => (
            <tr key={index}>
              <td>{sale.invoiceId}</td>
              <td>{sale.GrossTotal}</td>
              <td>{sale.CustomerId}</td>
              <td>{sale.discountPercent}%</td>
              <td>{sale.discountAmount}</td>
              <td>{sale.netAmount}</td>
              <td>{sale.CashPay}</td>
              <td>{sale.CardPay}</td>
              <td>{sale.PaymentType}</td>
              <td>{sale.Balance}</td>
              <td style={{ color: "green" }}>{new Date(sale.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div id="totals-row">
        <p>Total Net Amount: {totals.netAmount.toFixed(2)}</p>
        <p>Total Cash Pay: {totals.cashAmount.toFixed(2)}</p>
        <p>Total Card Pay: {totals.cardAmount.toFixed(2)}</p>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        {getPaginationNumbers().map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={currentPage === number ? "active-pagination-button" : ""}
          >
            {number}
          </button>
        ))}
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

// Add PropTypes for validation
SalesTable.propTypes = {
  store: PropTypes.string.isRequired,
};

export default SalesTable;
