import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/SupplierPayment.css"; // Separate CSS file for styling

// Import the images
import addLoanImage from "../assets/icons/addLoan.png";
import addCashImage from "../assets/icons/addCash.png";

export default function SupplierPayment({ store }) {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

  if (loading) {
    return <p id="loading_supplier_payment">Loading supplier data...</p>;
  }

  if (error) {
    return <p id="error_supplier_payment">{error}</p>;
  }

  if (suppliers.length === 0) {
    return <p id="no_data_supplier_payment">No supplier data found for the selected store.</p>;
  }

  // Filter suppliers based on the search term
  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      supplier.Supid.toLowerCase().includes(searchTermLower) ||
      supplier.Supname.toLowerCase().includes(searchTermLower)
    );
  });

  // Pagination Logic
  const indexOfLastSupplier = currentPage * rowsPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - rowsPerPage;
  const currentSuppliers = filteredSuppliers.slice(
    indexOfFirstSupplier,
    indexOfLastSupplier
  );
  const totalPages = Math.ceil(filteredSuppliers.length / rowsPerPage);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const getPaginationNumbers = () => {
    const numbers = [];

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      numbers.push(i);
    }
    return numbers;
  };

  // Action handlers
  const handleAddLoan = (supplierId) => {
    Swal.fire({
      title: `Add Loan for Supplier "${supplierId}"`,
      input: "number",
      inputLabel: "Enter Loan Amount",
      inputPlaceholder: "Enter the loan amount",
      showCancelButton: true,
      confirmButtonText: "Add Loan",
      preConfirm: async (loanAmount) => {
        if (!loanAmount || loanAmount <= 0) {
          Swal.showValidationMessage("Please enter a valid loan amount.");
          return;
        }
        try {
          const response = await axios.post(
            "http://localhost:5000/api/suppliers/add_loan",
            { supplierId, loanAmount }
          );
          Swal.fire("Success", response.data.message, "success");
        } catch (error) {
          console.error("Error adding loan:", error);
          Swal.fire("Error", "Failed to add loan.", "error");
        }
      },
    });
  };

  const handleAddCash = (supplierId) => {
    Swal.fire({
      title: `Add Cash Payment for Supplier "${supplierId}"`,
      input: "number",
      inputLabel: "Enter Cash Amount",
      inputPlaceholder: "Enter the cash payment amount",
      showCancelButton: true,
      confirmButtonText: "Add Cash",
      preConfirm: async (cashAmount) => {
        if (!cashAmount || cashAmount <= 0) {
          Swal.showValidationMessage("Please enter a valid cash amount.");
          return;
        }
        try {
          const response = await axios.post(
            "http://localhost:5000/api/suppliers/add_cash",
            { supplierId, cashAmount }
          );
          Swal.fire("Success", response.data.message, "success");
        } catch (error) {
          console.error("Error adding cash payment:", error);
          Swal.fire("Error", "Failed to add cash payment.", "error");
        }
      },
    });
  };

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
                  <button
                    className="icon-button"
                    onClick={() => handleAddLoan(supplier.Supid)}
                  >
                    <img src={addLoanImage} alt="Add Loan" />
                  </button>
                  <button
                    className="icon-button"
                    onClick={() => handleAddCash(supplier.Supid)}
                  >
                    <img src={addCashImage} alt="Add Cash" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
}

SupplierPayment.propTypes = {
  store: PropTypes.string.isRequired,
};
