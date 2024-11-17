import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "../css1/invoiceTable.css";

const InvoicesTable = ({ store }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]); // Default to today
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]); // Default to today
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        console.log("API Request Parameters:", { Store: store });
        const response = await axios.get("http://localhost:5000/api/invoices/fetch_invoices", {
          params: { Store: store },
        });
        console.log("Fetched invoices:", response.data);
        setInvoices(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError(`Failed to load invoices: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [store]);

  if (loading) {
    return <p>Loading invoices...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (invoices.length === 0) {
    return <p>No invoices found for the selected store.</p>;
  }

  // Ensure the date range is inclusive of the entire day
  const isDateInRange = (invoiceDate, start, end) => {
    const invoice = new Date(invoiceDate).setHours(0, 0, 0, 0); // Normalize to start of the day
    const startNormalized = new Date(start).setHours(0, 0, 0, 0);
    const endNormalized = new Date(end).setHours(23, 59, 59, 999); // Include the entire end date
    return invoice >= startNormalized && invoice <= endNormalized;
  };

  // Filter invoices based on search query and date range
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearchQuery = invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
    const withinDateRange = isDateInRange(invoice.createdAt, startDate, endDate);
    return matchesSearchQuery && withinDateRange;
  });

  // Calculate totals for filtered data
  const totals = filteredInvoices.reduce(
    (acc, invoice) => {
      acc.totalDiscount += parseFloat(invoice.discount) || 0; // Total Discount
      acc.totalAmount += parseFloat(invoice.totalAmount) || 0; // Total Amount
      return acc;
    },
    { totalDiscount: 0, totalAmount: 0 }
  );


  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredInvoices.slice(indexOfFirstRow, indexOfLastRow);

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
    <div className="invoices-table-container_invoiceTable">
      <div className="filters-container">
        {/* Search Box */}
        <div className="search-box-invoiceTable">
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
            />
          </div>
          <div className="date-picker">
            <label htmlFor="end-date">End Date:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <table className="invoices-table_invoiceTable">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Product ID</th>
            <th>Name</th>
            <th>MRP</th>
            <th>Discount</th>
            <th>Rate</th>
            <th>Quantity</th>
            <th>Total Amount</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((invoice, index) => (
            <tr key={index}>
              <td>{invoice.invoiceId}</td>
              <td>{invoice.productId}</td>
              <td>{invoice.name}</td>
              <td style={{ textAlign: "center" }}>{invoice.mrp}</td>
              <td style={{ textAlign: "center" }}>{invoice.discount}</td>
              <td style={{ textAlign: "center" }}>{invoice.rate}</td>
              <td style={{ textAlign: "center" }}>{invoice.quantity}</td>
              <td style={{ textAlign: "center" }}>{invoice.totalAmount}</td>
              <td style={{ color: "green" }}>{new Date(invoice.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div id="totals-row">
        <p>Total Discount: {totals.totalDiscount.toFixed(2)}</p>
        <p>Total Amount: {totals.totalAmount.toFixed(2)}</p>
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
InvoicesTable.propTypes = {
  store: PropTypes.string.isRequired, // Validate store as required string
};

export default InvoicesTable;
