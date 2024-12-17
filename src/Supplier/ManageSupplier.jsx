import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For delete confirmation and alerts
import PropTypes from "prop-types";
import Modal from "react-modal"; // Modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBank,
  faAddressBook,
  faWebAwesome,
  faMobile,
} from "@fortawesome/free-solid-svg-icons"; // Imported faEye icon
import "../css/ManageSupplier.css"; // Assuming a separate CSS file for table design
import SupplierUpdate from "./SupplierUpdate";
import SupplierStockModel from "../Supplier/SuplierStockModel";

export default function ManageSupplier({ store }) {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [suppliersPerPage, setSuppliersPerPage] = useState(10); // Default number of suppliers per page
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [modalContent, setModalContent] = useState(null); // Content to display in the modal
  const [modalTitle, setModalTitle] = useState(""); // Title for the modalconst [modalIsOpen, setModalIsOpen] = useState(false); // Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false); // State for showing the update modal
  const [selectedSupplierId, setSelectedSupplierId] = useState(null); // Supplier ID to edit
  const [showStockModal, setShowStockModal] = useState(false); // State for showing the stock modal

  // Fetch supplier data from the database
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://154.26.129.243:5000/api/suppliers/get_suppliers"
        );
        // Log the response data to ensure it includes all fields
        console.log("Fetched Suppliers:", response.data);
        setSuppliers(response.data);
      } catch (error) {
        console.error(
          "Error fetching suppliers:",
          error.response?.data?.message || error.message
        );
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching suppliers",
        });
      }
    };
    fetchSuppliers();
  }, []);

  // Function to handle displaying the stock modal with supplier name
  const handleStockClick = (supName) => {
    setSelectedSupplierId(supName); // Set the supplier name instead of ID
    setShowStockModal(true);
  };

  // Function to close the stock modal
  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setSelectedSupplierId(null);
  };

  const handleEditClick = (supId) => {
    setSelectedSupplierId(supId);
    setShowUpdateModal(true);
  };

  const handleUpdateComplete = () => {
    setShowUpdateModal(false);
    // Refresh the supplier list after update
    const fetchUpdatedSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://154.26.129.243:5000/api/suppliers/get_suppliers"
        );
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error refreshing suppliers:", error);
      }
    };
    fetchUpdatedSuppliers();
  };

  const handleAddressClick = async (Supid) => {
    try {
      const response = await axios.get(
        `http://154.26.129.243:5000/api/suppliers/get_supplier_address_details/${Supid}`
      );
      const selectedSupplier = response.data;
      setModalContent(
        <div>
          <p>
            <strong>Address 1:</strong> {selectedSupplier.address1 || "N/A"}
          </p>
          <p>
            <strong>Address 2:</strong> {selectedSupplier.address2 || "N/A"}
          </p>
          <p>
            <strong>Address 3:</strong> {selectedSupplier.address3 || "N/A"}
          </p>
        </div>
      );
      setModalIsOpen(true); // Open modal
    } catch (error) {
      console.error("Error fetching address details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not fetch address details.",
      });
    }
  };

  const handleEmailClick = async (Supid) => {
    try {
      const response = await axios.get(
        `http://154.26.129.243:5000/api/suppliers/get_supplier_website_details/${Supid}`
      );
      const selectedSupplier = response.data;
      setModalContent(
        <div>
          <p>
            <strong>Email Address : </strong> {selectedSupplier.email || "N/A"}
          </p>
          <p>
            <strong>Web Address : </strong> {selectedSupplier.website || "N/A"}
          </p>
        </div>
      );
      setModalIsOpen(true); //open modal
    } catch (error) {
      console.error("Error Fecthing website data details : ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not fecth website details",
      });
    }
  };

  const handleMobileClick = async (Supid) => {
    try {
      const response = await axios.get(
        `http://154.26.129.243:5000/api/suppliers/get_supplier_mobile_details/${Supid}`
      );
      const selectedSupplier = response.data;
      setModalContent(
        <div>
          <p>
            <strong>Mobile Number 1 : </strong>{" "}
            {selectedSupplier.mobile1 || "N/A"}
          </p>
          <p>
            <strong>Mobile Number 2 : </strong>{" "}
            {selectedSupplier.mobile2 || "N/A"}
          </p>
          <p>
            <strong>Mobile Number 3 : </strong>{" "}
            {selectedSupplier.mobile3 || "N/A"}
          </p>
        </div>
      );
      setModalIsOpen(true);
    } catch (error) {
      console.error("Error Fecthing mobile data details : ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not fecth mobile details",
      });
    }
  };

  // Function to fetch and display all bank details for a specific supplier
  const handleViewBankDetails = async (supId) => {
    try {
      const response = await axios.get(
        `http://154.26.129.243:5000/api/suppliers/get_supplier_bank_details/${supId}`
      );
      const bankDetailsList = response.data;

      if (bankDetailsList.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Bank Details",
          text: "No bank details found for this supplier.",
        });
        return;
      }

      setModalTitle("Bank Details");
      setModalContent(
        <div>
          {bankDetailsList.map((bankDetail, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <p>
                <strong>Bank Name:</strong> {bankDetail.supBank}
              </p>
              <p>
                <strong>Account Number:</strong> {bankDetail.supBankNo}
              </p>
              <p>
                <strong>Saved Time:</strong>{" "}
                {new Date(bankDetail.saveTime).toLocaleString()}
              </p>
              <hr />
            </div>
          ))}
        </div>
      );
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
    setModalContent(null);
    setModalTitle("");
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
          const response = await axios.delete(
            `http://154.26.129.243:5000/api/suppliers/delete_supplier/${supId}`
          );
          if (response.status === 200) {
            setSuppliers(
              suppliers.filter((supplier) => supplier.Supid !== supId)
            );
            Swal.fire(
              "Deleted!",
              `Supplier "${supId}" has been deleted.`,
              "success"
            );
          }
        } catch (error) {
          console.error("Error deleting supplier:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete supplier: ${
              error.response?.data?.message || error.message
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
      const response = await axios.put(
        `http://154.26.129.243:5000/api/suppliers/update_status/${supid}`,
        {
          status: newStatus,
        }
      );
      if (response.status === 200) {
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) =>
            supplier.Supid === supid
              ? { ...supplier, status: newStatus }
              : supplier
          )
        );
        Swal.fire(
          "Status Updated",
          `Supplier status changed to ${newStatus}`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error updating supplier status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update supplier status: ${
          error.response?.data?.message || error.message
        }`,
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
        <select
          value={suppliersPerPage}
          onChange={handleSuppliersPerPageChange}
        >
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
                {/* Address column with eye icon */}
                <td>
                  <FontAwesomeIcon
                    icon={faAddressBook}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleAddressClick(supplier.Supid)}
                  />
                  {" - "}
                  {supplier.address1}
                </td>
                {/* Email column with eye icon */}
                <td>
                  <FontAwesomeIcon
                    icon={faWebAwesome}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEmailClick(supplier.Supid)}
                  />
                  {" - "}
                  {supplier.email}
                </td>
                {/* Mobile column with eye icon */}
                <td>
                  <FontAwesomeIcon
                    icon={faMobile}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleMobileClick(supplier.Supid)}
                  />
                  {" - "}
                  {supplier.mobile1}
                </td>
                <td>{supplier.company}</td>
                <td
                  onDoubleClick={() =>
                    handleStatusToggle(supplier.Supid, supplier.status)
                  }
                  style={{ cursor: "pointer" }}
                >
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
                    className="action-button edit-button"
                    onClick={() => handleEditClick(supplier.Supid)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(supplier.Supid)}
                  >
                    Delete
                  </button>
                  <button
                    className="action-button stock-button"
                    onClick={() => handleStockClick(supplier.Supname)} // Pass the Supname
                  >
                    Stock
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
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {currentPage - 1 > 1 && <button onClick={() => paginate(1)}>1</button>}
        {currentPage - 1 > 2 && <span>...</span>}

        {currentPage - 1 > 0 && (
          <button onClick={() => paginate(currentPage - 1)}>
            {currentPage - 1}
          </button>
        )}
        <button className="active">{currentPage}</button>
        {currentPage + 1 <= totalPages && (
          <button onClick={() => paginate(currentPage + 1)}>
            {currentPage + 1}
          </button>
        )}

        {currentPage + 1 < totalPages && <span>...</span>}
        {currentPage + 1 < totalPages && (
          <button onClick={() => paginate(totalPages)}>{totalPages}</button>
        )}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal for displaying details */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={modalTitle}
        className="modal-content"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <h2>{modalTitle}</h2>
        {modalContent ? modalContent : <p>No details available.</p>}
        <button onClick={closeModal}>Close</button>
      </Modal>

      {/* Modal for updating supplier details */}
      {showUpdateModal && (
        <SupplierUpdate
          supplierId={selectedSupplierId}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleUpdateComplete}
        />
      )}

      {/* Modal for displaying supplier products */}
      {showStockModal && selectedSupplierId && (
        <SupplierStockModel
          supName={selectedSupplierId} // Pass the Supname
          onClose={handleCloseStockModal}
        />
      )}
    </div>
  );
}

// Validate props with PropTypes
ManageSupplier.propTypes = {
  store: PropTypes.string.isRequired,
};
