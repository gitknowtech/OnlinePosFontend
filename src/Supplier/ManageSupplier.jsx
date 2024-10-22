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
  const [suppliersPerPage, setSuppliersPerPage] = useState(10); // Default number of suppliers per page
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [bankDetails, setBankDetails] = useState(null); // Bank details state


  
  // Fetch supplier data from the database
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/suppliers/get_suppliers");
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
      const response = await axios.get(`http://localhost:5000/api/suppliers/get_bank_details/${supId}`);
      setBankDetails(response.data); // Store bank details in state
      setModalIsOpen(true); // Open modal
    } catch (error) {
      console.error("Error fetching bank details:", error);
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
          const response = await axios.delete(`http://localhost:5000/api/suppliers/delete_supplier/${supId}`);
          if (response.status === 200) {
            setSuppliers(suppliers.filter((supplier) => supplier.Supid !== supId));
            Swal.fire("Deleted!", `Supplier "${supId}" has been deleted.`, "success");
          }
        } catch (error) {
          console.error("Error deleting supplier:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete supplier: ${error.response?.data?.message || error.message}`,
          });
        }
      }
    });
  };

  // Filter suppliers based on the search term, store, or show all if store is 'all'
  const filteredSuppliers = suppliers.filter((supplier) => {
    const isStoreMatch =
      store === "all" || supplier.store === store || supplier.store === "all";
    const isSearchMatch = supplier.Supname.toLowerCase().includes(searchTerm.toLowerCase());
    return isStoreMatch && isSearchMatch;
  });

  // Pagination logic
  const indexOfLastSupplier = currentPage * suppliersPerPage;
  const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredSuppliers.length / suppliersPerPage);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle changing the number of suppliers displayed per page
  const handleSuppliersPerPageChange = (event) => {
    setSuppliersPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1 when rows per page changes
  };

  const handleStatusToggle = async (supid, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const response = await axios.put(`http://localhost:5000/api/suppliers/update_status/${supid}`, {
        status: newStatus,
      });
      if (response.status === 200) {
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) =>
            supplier.Supid === supid ? { ...supplier, status: newStatus } : supplier
          )
        );
        Swal.fire("Status Updated", `Supplier status changed to ${newStatus}`, "success");
      }
    } catch (error) {
      console.error("Error updating supplier status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update supplier status: ${error.response?.data?.message || error.message}`,
      });
    }
  };

  return (
    <div className="manage-supplier">
      {/* Search box */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Suppliers per page combo box */}
      <div className="rows-per-page">
        <label>Show: </label>
        <select value={suppliersPerPage} onChange={handleSuppliersPerPageChange}>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      {/* Supplier table */}
      <div className="supplier-table">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>SUP ID</th>
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
            {currentSuppliers.map((supplier, index) => (
              <tr key={supplier.Supid}>
                {/* No column to display continuous numbering */}
                <td>{indexOfFirstSupplier + index + 1}</td>
                <td>{supplier.Supid}</td>
                <td>{supplier.Supname}</td>
                <td>{supplier.address1}</td>
                <td>{supplier.email}</td>
                <td>{supplier.mobile1}</td>
                <td>{supplier.company}</td>
                <td
                  onDoubleClick={() => handleStatusToggle(supplier.Supid, supplier.status)}
                  style={{ cursor: "pointer" }}
                >
                  <span className={supplier.status === "active" ? "status-active" : "status-inactive"}>
                    {supplier.status}
                  </span>
                </td>
                <td>{supplier.store}</td>
                <td>
                  <button className="action-button edit-button">Edit</button>
                  <button className="action-button delete-button" onClick={() => handleDelete(supplier.Supid)}>
                    Delete
                  </button>
                  <button className="action-button stock-button">Stock</button>
                  <button onClick={() => handleViewBankDetails(supplier.Supid)} className="action-button bank-button">
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
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>

        {currentPage - 1 > 1 && <button onClick={() => paginate(1)}>1</button>}
        {currentPage - 1 > 2 && <span>...</span>}

        {currentPage - 1 > 0 && <button onClick={() => paginate(currentPage - 1)}>{currentPage - 1}</button>}
        <button className="active">{currentPage}</button>
        {currentPage + 1 <= totalPages && <button onClick={() => paginate(currentPage + 1)}>{currentPage + 1}</button>}

        {currentPage + 1 < totalPages && <span>...</span>}
        {currentPage + 1 < totalPages && <button onClick={() => paginate(totalPages)}>{totalPages}</button>}

        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
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
