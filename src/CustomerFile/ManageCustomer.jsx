import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // For alerts and confirmations
import "../css1/ManageCustomer.css"; // Assuming a separate CSS file for table design
import CustomerUpdate from "./CustomerUpdate";

export default function ManageCustomer({ store }) {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [customersPerPage, setCustomersPerPage] = useState(10); // Number of customers per page
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customer data from the database
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "http://154.26.129.243:5000/api/customer/fetch_customers"
      );
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers: ", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error fetching customer data",
      });
    }
  };

  // Function to handle delete operation
  const handleDelete = async (customerId) => {
    Swal.fire({
      title: `Are you sure you want to delete customer "${customerId}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `http://154.26.129.243:5000/api/customer/delete_customer/${customerId}`
          );
          if (response.status === 200) {
            setCustomers(
              customers.filter((customer) => customer.cusId !== customerId)
            );
            Swal.fire(
              "Deleted!",
              `Customer "${customerId}" has been deleted.`,
              "success"
            );
          }
        } catch (err) {
          console.error("Error deleting customer:", err);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Failed to delete customer: ${
              err.response?.data?.message || err.message
            }`,
          });
        }
      }
    });
  };

  // Filter customers based on search term and store
  const filteredCustomers = customers.filter((customer) => {
    const isStoreMatch =
      store === "all" || customer.store === store || customer.store === "all";
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const isSearchMatch =
      customer.cusName.toLowerCase().includes(lowerCaseSearchTerm) ||
      customer.cusId.toLowerCase().includes(lowerCaseSearchTerm) ||
      customer.mobile1.includes(lowerCaseSearchTerm) ||
      (customer.idNumber &&
        customer.idNumber.toLowerCase().includes(lowerCaseSearchTerm)); // Include idNumber in search

    return isStoreMatch && isSearchMatch;
  });

  // Pagination logic
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );

  // Calculate total pages
  const totalPages =
    filteredCustomers.length > 0
      ? Math.ceil(filteredCustomers.length / customersPerPage)
      : 1;

  // Handle pagination next and previous
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Handle changing the number of customers displayed per page
  const handleCustomersPerPageChange = (event) => {
    setCustomersPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1 when rows per page changes
  };

  // Pagination numbers logic (only show 3 middle numbers)
  const getPaginationNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage === 1) {
        pages.push(1, 2, 3);
      } else if (currentPage === totalPages) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }
    return pages;
  };

  // Open the update modal and load customer data
  const handleEdit = (customerId) => {
    const customer = customers.find(
      (customer) => customer.cusId === customerId
    );
    if (customer) {
      setSelectedCustomer(customer); // Set customer data to state
      setShowUpdateModal(true); // Show the modal
    }
  };

  // Close the update modal
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedCustomer(null); // Clear selected customer
  };

  // Function to update customer data
  const updateCustomer = async (updatedData) => {
    try {
      const response = await axios.put(
        `http://154.26.129.243:5000/api/customer/update_customer/${updatedData.cusId}`,
        updatedData
      );
      if (response.status === 200) {
        Swal.fire("Success", "Customer updated successfully!", "success");
        fetchCustomers(); // Refresh the customer list
        closeUpdateModal(); // Close the modal
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update customer: ${
          error.response?.data?.message || error.message
        }`,
      });
    }
  };

  return (
    <div id="manage-customer-container">
      {/* Modal Component for Updating Customer */}
      {showUpdateModal && (
        <CustomerUpdate
          customer={selectedCustomer}
          onClose={closeUpdateModal}
          onUpdate={updateCustomer}
        />
      )}

      <div id="manage-customer-controls-container">
        <div id="manage-customer-search-box">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div id="manage-customer-rows-per-page">
          <label>Show: </label>
          <select
            value={customersPerPage}
            onChange={handleCustomersPerPageChange}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div id="manage-customer-table">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Customer ID</th>
              <th>Customer Name</th>
              <th>Address 1</th>
              <th>Address 2</th>
              <th>Mobile 1</th>
              <th>Mobile 2</th>
              <th>ID Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.length === 0 ? (
              <tr>
                <td colSpan="9">No customers found.</td>
              </tr>
            ) : (
              currentCustomers.map((customer, index) => (
                <tr key={customer.cusId}>
                  <td>{indexOfFirstCustomer + index + 1}</td>
                  <td>{customer.cusId}</td>
                  <td>{customer.cusName}</td>
                  <td>{customer.address1}</td>
                  <td>{customer.address2}</td>
                  <td>{customer.mobile1}</td>
                  <td>{customer.mobile2}</td>
                  <td>{customer.idNumber}</td>
                  <td>
                    <button
                      className="manage-customer-edit-button"
                      onClick={() => handleEdit(customer.cusId)}
                    >
                      Edit
                    </button>
                    <button
                      className="manage-customer-delete-button"
                      onClick={() => handleDelete(customer.cusId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div id="manage-customer-pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        {getPaginationNumbers().map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={currentPage === number ? "active" : ""}
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

ManageCustomer.propTypes = {
  store: PropTypes.string.isRequired,
};
