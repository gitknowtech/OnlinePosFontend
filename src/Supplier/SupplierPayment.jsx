// src/components/SupplierPayment.jsx

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/SupplierPayment.css"; // Separate CSS file for styling
import AddLoanModal from "../Supplier/AddLoanModel"; // Modal for adding loans
import ViewCashModel from "../Supplier/ViewCashModel"; // Modal for adding cash

// Import the images
import addLoanImage from "../assets/icons/addLoan.png";
import addCashImage from "../assets/icons/addCash.png";
import reloadImage from "../assets/icons/reload.png"; // Reload icon

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

  // Loan Display state: { [supplierId]: 'idle' | 'loading' | 'displayed' }
  const [loanDisplay, setLoanDisplay] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch suppliers on component load
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://154.26.129.243:5000/api/suppliers/get_suppliers",
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
        "http://154.26.129.243:5000/api/supplier_loan/add",
        loanData
      );
      Swal.fire("Success", response.data.message, "success");
      setShowLoanModal(false); // Close modal after successful save
      // Optionally, refresh suppliers or balances here
    } catch (error) {
      console.error("Error saving loan:", error);
      Swal.fire("Error", "Failed to save loan details.", "error");
    }
  };

  // Open cash modal for selected supplier
  const handleViewCashClick = (supplier) => {
    setSelectedSupplier(supplier);
    setShowCashModal(true);
  };

  // Fetch and display total loan amount for a supplier
  const handleViewBalance = async (supplierId) => {
    // If already loading or displayed, do not fetch again
    if (
      loanDisplay[supplierId] === "loading" ||
      loanDisplay[supplierId] === "displayed"
    ) {
      return;
    }

    // Set the status to 'loading'
    setLoanDisplay((prev) => ({ ...prev, [supplierId]: "loading" }));

    try {
      const response = await axios.get(
        "http://154.26.129.243:5000/api/suppliers/get_total_loan",
        { params: { supplierId } }
      );
      const totalLoan = parseFloat(response.data.totalLoan).toFixed(2);
      setBalances((prevBalances) => ({
        ...prevBalances,
        [supplierId]: totalLoan, // Update with the totalLoan
      }));

      // Set the status to 'displayed'
      setLoanDisplay((prev) => ({ ...prev, [supplierId]: "displayed" }));

      // Optionally, you can set a timeout to hide the balance after some time
      // setTimeout(() => {
      //   setLoanDisplay((prev) => ({ ...prev, [supplierId]: "idle" }));
      // }, 5000);
    } catch (error) {
      console.error("Error fetching total loan:", error);
      Swal.fire("Error", "Failed to fetch loan amount for supplier.", "error");
      // Revert the status back to 'idle' in case of error
      setLoanDisplay((prev) => ({ ...prev, [supplierId]: "idle" }));
    }
  };

  // Open loan modal for selected supplier
  const handleAddLoanClick = (supplier) => {
    setSelectedSupplier(supplier);
    setShowLoanModal(true);
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
              <th>BALANCE</th>
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
                <td style={{width:"10px"}}>
                  <div
                    className="balance-container" style={{cursor:"pointer"}}
                    onMouseEnter={() => handleViewBalance(supplier.Supid)}
                    onMouseLeave={() =>
                      setLoanDisplay((prev) => ({
                        ...prev,
                        [supplier.Supid]: "idle",
                      }))
                    }
                  >
                    {loanDisplay[supplier.Supid] === "loading" ? (
                      <img
                        src={reloadImage}
                        alt="Loading"
                        className="reload-icon spinning"
                      />
                    ) : loanDisplay[supplier.Supid] === "displayed" ? (
                      <span className="loan-amount-red">
                        ${balances[supplier.Supid]}
                      </span>
                    ) : (
                      <img
                        src={reloadImage}
                        alt="Reload"
                        className="reload-icon"
                      />
                    )}
                  </div>
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
                    onClick={() => handleViewCashClick(supplier)}
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
        <ViewCashModel
          supplierId={selectedSupplier.Supid}
          onClose={() => setShowCashModal(false)}
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
