import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css1/salesTable.css";

import deleteImage from "../assets/icons/bin.png";
import viewImage from "../assets/icons/view.png";

const SalesTable = ({ store, UserName }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Rows per page

  useEffect(() => {
    const fetchSales = async () => {
      try {
        console.log("API Request Parameters for Sales:", { Store: store });
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

  const getPaymentColor = (paymentType) => {
    switch (paymentType) {
      case "Credit Payment":
        return "#a10c0c";
      case "Cash and Card Payment":
        return "#b2af0a";
      case "Cash Payment":
        return "green";
      default:
        return "black";
    }
  };

  // Filtered and paginated sales
  const filteredSales = sales.filter((sale) =>
    sale.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSales.slice(indexOfFirstRow, indexOfLastRow);

  // Pagination functions
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
      <div className="user-info-salesTable" style={{ display: "none" }}>
        <p><strong>User Name:</strong> {UserName || "N/A"}</p>
        <p><strong>Store:</strong> {store || "N/A"}</p>
      </div>

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
              <td style={{ color: getPaymentColor(sale.PaymentType) }}>{sale.PaymentType}</td>
              <td>{sale.Balance}</td>
              <td style={{ color: "green" }}>{new Date(sale.createdAt).toLocaleString()}</td>
              <td className="actions-salesTable">
                <img
                  src={viewImage}
                  alt="View"
                  title="View Details"
                  onClick={() => alert(`Viewing details for Sales ID: ${sale.id}`)}
                />
                <img
                  src={deleteImage}
                  alt="Delete"
                  title="Delete Record"
                  onClick={() => alert(`Deleting record for Sales ID: ${sale.id}`)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default SalesTable;
