import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/SupplierPayment.css"; // Separate CSS file for styling
import AddLoanModal from "../Supplier/AddLoanModel"; // Modal for adding loans
import AddCashModal from "../Supplier/AddCashModel"; // Modal for adding cash

// Import the images
import addLoanImage from "../assets/icons/addLoan.png";
import addCashImage from "../assets/icons/addCash.png";

export default function SupplierPayment({ store }) {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);

  // Balance state
  const [balances, setBalances] = useState({}); // Keeps track of balances for each supplier

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch suppliers on component load
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/suppliers/get_suppliers",
          { params: { store } }
        );
        setSuppliers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching supplier data:", err);
        setError("Error fetching supplier data.");
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [store]);

  // Save loan handler for modal
  const handleSaveLoan = async (loanData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/supplier_loan/add",
        loanData
      );
      Swal.fire("Success", response.data.message, "success");
      setShowLoanModal(false); // Close modal after successful save
    } catch (error) {
      console.error("Error saving loan:", error);
      Swal.fire("Error", "Failed to save loan details.", "error");
    }
  };

  // Save cash handler for modal
  const handleSaveCash = async (cashData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/supplier_cash/add",
        cashData
      );
      Swal.fire("Success", response.data.message, "success");
      setShowCashModal(false); // Close modal after successful save
    } catch (error) {
      console.error("Error saving cash:", error);
      Swal.fire("Error", "Failed to save cash details.", "error");
    }
  };

  // Fetch and display balance for a supplier
  const handleViewBalance = async (supplierId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/suppliers/get_balance?supplierId=${supplierId}`
      );
      setBalances((prevBalances) => ({
        ...prevBalances,
        [supplierId]: response.data.balance || "0.00", // Update the balance or default to "0.00"
      }));
    } catch (error) {
      console.error("Error fetching balance:", error);
      Swal.fire("Error", "Failed to fetch balance for supplier.", "error");
    }
  };

  // Open loan modal for selected supplier
  const handleAddLoanClick = (supplier) => {
    setSelectedSupplier(supplier);
    setShowLoanModal(true);
  };

  // Open cash modal for selected supplier
  const handleAddCashClick = (supplier) => {
    setSelectedSupplier(supplier);
    setShowCashModal(true);
  };

  // Pagination logic
  const filteredSuppliers = suppliers.filter((supplier) =>
    `${supplier.Supid} ${supplier.Supname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const indexOfLastSupplier = currentPage * rowsPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - rowsPerPage;
  const currentSuppliers = filteredSuppliers.slice(
    indexOfFirstSupplier,
    indexOfLastSupplier
  );
  const totalPages = Math.ceil(filteredSuppliers.length / rowsPerPage);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));


   const getDisplayedPages = () => {
    const pages = [];
    if (currentPage === 1) {
      // First three pages
      for (let i = 1; i <= Math.min(3, totalPages); i++) {
        pages.push(i);
      }
    } else if (currentPage === totalPages) {
      // Last three pages
      for (let i = Math.max(1, totalPages - 2); i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Middle pages
      pages.push(currentPage - 1, currentPage, currentPage + 1);
    }
    return pages;
  };

  if (loading) return <p>Loading suppliers...</p>;
  if (error) return <p>{error}</p>;
  if (!suppliers.length) return <p>No suppliers found.</p>;

  return (
    <div id="supplier_payment_container">
      {/* Search box */}
      <div id="search_box_supplier_payment">
        <input
          type="text"
          placeholder="Search by Supplier ID or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Supplier table */}
      <div id="supplier_table_supplier_payment">
        <table id="table_supplier_payment">
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Mobile</th>
              <th>Company</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.map((supplier) => (
              <tr key={supplier.Supid}>
                <td>{supplier.Supid}</td>
                <td>{supplier.Supname}</td>
                <td>
                  {supplier.address1 || supplier.address2 || supplier.address3
                    ? `${supplier.address1 || ""} ${supplier.address2 || ""} ${
                        supplier.address3 || ""
                      }`.trim()
                    : "N/A"}
                </td>
                <td>{supplier.mobile1 || "N/A"}</td>
                <td>{supplier.company || "N/A"}</td>
                <td>
                  {balances[supplier.Supid] !== undefined ? (
                    `$${balances[supplier.Supid]}`
                  ) : (
                    <button
                      className="view-balance-button"
                      onClick={() => handleViewBalance(supplier.Supid)}
                    >
                      View
                    </button>
                  )}
                </td>
                <td>
                  <button
                    className="icon-button"
                    onClick={() => handleAddLoanClick(supplier)}
                  >
                    <img src={addLoanImage} alt="Add Loan" />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => handleAddCashClick(supplier)}
                  >
                    <img src={addCashImage} alt="Add Cash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loan Modal */}
      {showLoanModal && selectedSupplier && (
        <AddLoanModal
          supplier={selectedSupplier}
          onClose={() => setShowLoanModal(false)}
          onSave={handleSaveLoan}
        />
      )}

      {/* Cash Modal */}
      {showCashModal && selectedSupplier && (
        <AddCashModal
          supplier={selectedSupplier}
          onClose={() => setShowCashModal(false)}
          onSave={handleSaveCash}
        />
      )}

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        {getDisplayedPages().map((number) => (
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
}

SupplierPayment.propTypes = {
  store: PropTypes.string.isRequired,
};
