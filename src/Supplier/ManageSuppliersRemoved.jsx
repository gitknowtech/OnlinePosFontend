import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For delete confirmation and alerts
import PropTypes from "prop-types";
import Modal from "react-modal"; // Modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../css/ManageSupplier.css"; // Assuming a separate CSS file for table design
import { faBank } from "@fortawesome/free-solid-svg-icons";

export default function ManageSupplier({ store }) {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [suppliersPerPage] = useState(7); // Number of suppliers per page
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [bankDetails, setBankDetails] = useState(null); // Bank details state



  // Fetch supplier data from the database
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/get_suppliers_removed"
        );
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching suppliers",
        });
      }
    };
    fetchSuppliers();
  }, []);

  // Function to fetch and display bank details in the modal
  const handleViewBankDetails = async (supId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/get_bank_details_removed/${supId}`
      );
      setBankDetails(response.data); // Store bank details in state
      setModalIsOpen(true); // Open modal
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not fetch bank details.",
      });
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setModalIsOpen(false);
    setBankDetails(null); // Clear bank details when modal is closed
  };

  // Function to handle the deletion of a supplier
  const handleDelete = async (supId) => {
    Swal.fire({
      title: `Are you sure you want to delete supplier "${supId}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `http://localhost:5000/api/delete_supplier_removed/${supId}`
          );
          if (response.status === 200) {
            // Remove the deleted supplier from the state to update the UI
            setSuppliers(
              suppliers.filter((supplier) => supplier.Supid !== supId)
            );
            Swal.fire(
              "Deleted!",
              `Supplier "${supId}" has been deleted.`,
              "success"
            );
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete supplier: ${
              err.response?.data?.message || err.message
            }`,
          });
        }
      }
    });
  };

  // Filter suppliers based on the search term, store, or show all if store is 'all'
  const filteredSuppliers = suppliers.filter((supplier) => {
    const isStoreMatch =
      store === "all" || supplier.store === store || supplier.store === "all";
    const isSearchMatch = supplier.Supname.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    return isStoreMatch && isSearchMatch;
  });

  // Pagination logic
  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = filteredSuppliers.slice(
    indexOfFirstSupplier,
    indexOfLastSupplier
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="manage-supplier">
      <h2>Removed Suppliers</h2>

      {/* Search box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Supplier table */}
      <div className="supplier-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Company</th>
              <th>Status</th>
              <th>Store</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.map((supplier) => (
              <tr key={supplier.Supid}>
                <td>{supplier.Supid}</td>
                <td>{supplier.Supname}</td>
                <td>{supplier.address1}</td>
                <td>{supplier.email}</td>
                <td>{supplier.mobile1}</td>
                <td>{supplier.company}</td>
                <td>
                  <span
                    className={
                      supplier.status === "active"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {supplier.status}
                  </span>
                </td>
                <td>{supplier.store}</td>
                <td>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(supplier.Supid)}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleViewBankDetails(supplier.Supid)}
                    className="action-button bank-button"
                  >
                    <FontAwesomeIcon className="nav-icon" icon={faBank} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        {[
          ...Array(
            Math.ceil(filteredSuppliers.length / suppliersPerPage)
          ).keys(),
        ].map((number) => (
          <button
            key={number + 1}
            onClick={() => paginate(number + 1)}
            className={currentPage === number + 1 ? "active" : ""}
          >
            {number + 1}
          </button>
        ))}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Bank Details"
        className="modal-content"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <h2>Bank Details</h2>
        {bankDetails ? (
          <div>
            <p>
              <strong>Bank Name:</strong> {bankDetails.supBank}
            </p>
            <p>
              <strong>Account Number:</strong> {bankDetails.supBankNo}
            </p>
          </div>
        ) : (
          <p>No bank details available.</p>
        )}
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
}

// Validate props with PropTypes
ManageSupplier.propTypes = {
  store: PropTypes.string.isRequired,
};
