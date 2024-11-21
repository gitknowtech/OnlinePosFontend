import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "../css1/salesTable.css";
import addCashImage from "../assets/icons/addCash.png"; // Import payment image

const CreditSales = ({ store }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(""); // Allow it to start empty
  const [endDate, setEndDate] = useState(""); // Allow it to start empty
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null); // Store modal data

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/invoices/fetch_sales_new", {
          params: { Store: store },
        });
        setSales(response.data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to load sales: ${err.response?.data?.message || err.message}`);
        setLoading(false);
      }
    };

    fetchSales();
  }, [store]);

  // Ensure the date range is inclusive (only if the start and end dates are selected)
  const isDateInRange = (saleDate, start, end) => {
    const sale = new Date(saleDate).setHours(0, 0, 0, 0); // Normalize to 00:00
    if (!start && !end) return true; // If no date range is specified, include all sales
    const startNormalized = start ? new Date(start).setHours(0, 0, 0, 0) : -Infinity;
    const endNormalized = end ? new Date(end).setHours(23, 59, 59, 999) : Infinity;
    return sale >= startNormalized && sale <= endNormalized;
  };

  // Filter sales based on search query and date range (search by CustomerId)
  const filteredSales = sales.filter((sale) => {
    const matchesSearchQuery = sale.CustomerId.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Handle Add Payment button click
  const handleAddPaymentClick = (sale) => {
    setModalData(sale);
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setModalData(null);
    setShowModal(false);
  };

  if (loading) return <p>Loading sales...</p>;
  if (error) return <p>{error}</p>;
  if (sales.length === 0) return <p>No sales found for the selected store.</p>;

  return (
    <div className="sales-table-container_salesTable">
      <div className="filters-container">
        {/* Search Box */}
        <div className="search-box-salesTable">
          <input
            type="text"
            placeholder="Search by Customer ID"
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
            <th>Action</th>
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
              <td>
                <button
                  className="icon-button"
                  onClick={() => handleAddPaymentClick(sale)}
                >
                  <img src={addCashImage} alt="Add Cash" />
                </button>
              </td>
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

      {/* Modal */}
      {showModal && modalData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Payment Details</h3>
            <p><strong>Invoice ID:</strong> {modalData.invoiceId}</p>
            <p><strong>Gross Total:</strong> {modalData.GrossTotal}</p>
            <p><strong>Customer ID:</strong> {modalData.CustomerId}</p>
            <p><strong>Cash Pay:</strong> {modalData.CashPay}</p>
            <p><strong>Card Pay:</strong> {modalData.CardPay}</p>
            <p><strong>Balance:</strong> {modalData.Balance}</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add PropTypes for validation
CreditSales.propTypes = {
  store: PropTypes.string.isRequired,
};

export default CreditSales;
