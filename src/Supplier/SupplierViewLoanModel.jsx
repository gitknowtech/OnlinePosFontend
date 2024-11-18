import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css2/SupplierViewLoanModel.css";

const SupplierViewLoanModel = ({ supplierId, onClose }) => {
  const [loans, setLoans] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);
  const [updatedLoan, setUpdatedLoan] = useState({});
  const [startDate, setStartDate] = useState(null); // Start date for filtering
  const [endDate, setEndDate] = useState(null); // End date for filtering

  useEffect(() => {
    fetchLoans();
  }, [supplierId]);

  // Fetch all loans for the supplier
  const fetchLoans = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/suppliers/get_loans_supplier_loan/${supplierId}`
      );
      const data = await response.json();

      console.log("All loans fetched:", data);

      if (response.ok) {
        setLoans(data);
      } else {
        Swal.fire("Error", data.message || "Failed to fetch loans.", "error");
      }
    } catch (error) {
      console.error("Error fetching loans:", error);
      Swal.fire("Error", "Failed to fetch loans.", "error");
    }
  };

  // Fetch loans filtered by date range
  const fetchLoansByDate = async () => {
    if (!startDate || !endDate) {
      Swal.fire("Error", "Please select both start and end dates.", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/suppliers/get_loans_by_date/${supplierId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      const data = await response.json();

      console.log("Filtered loans fetched:", data);

      if (response.ok) {
        setLoans(data);
      } else {
        Swal.fire(
          "Error",
          data.message || "Failed to fetch loans by date.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching loans by date:", error);
      Swal.fire("Error", "Failed to fetch loans by date.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the loan and its associated file.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/suppliers/delete_supplier_loan/${id}`,
          { method: "DELETE" }
        );
        const data = await response.json();

        if (response.ok) {
          setLoans(loans.filter((loan) => loan.id !== id));
          Swal.fire("Deleted!", data.message, "success");
        } else {
          Swal.fire("Error", data.message || "Failed to delete loan.", "error");
        }
      } catch (error) {
        console.error("Error deleting loan:", error);
        Swal.fire("Error", "Failed to delete loan.", "error");
      }
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan.id);
    setUpdatedLoan({
      loanAmount: loan.loanAmount,
      cashPayment: loan.cashPayment,
      description: loan.description,
      billNumber: loan.billNumber,
    });
  };

  const handleUpdate = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/suppliers/update_supplier_loan/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedLoan),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setLoans(
          loans.map((loan) =>
            loan.id === id ? { ...loan, ...updatedLoan } : loan
          )
        );
        Swal.fire("Updated!", data.message, "success");
        setEditingLoan(null);
      } else {
        Swal.fire("Error", data.message || "Failed to update loan.", "error");
      }
    } catch (error) {
      console.error("Error updating loan:", error);
      Swal.fire("Error", "Failed to update loan.", "error");
    }
  };

  const handleInputChange = (field, value) => {
    setUpdatedLoan({ ...updatedLoan, [field]: value });
  };

  const handleViewDocument = (filePath) => {
    if (!filePath) {
      Swal.fire("Error", "No document available to view.", "error");
      return;
    }

    const url = `http://localhost:5000/api/suppliers/view_file?filePath=${encodeURIComponent(
      filePath
    )}`;
    window.open(url, "_blank");
  };

  const handlePayment = (loan) => {
    // Handle the payment action (e.g., opening a payment modal or redirecting to a payment page)
    Swal.fire(
      "Payment",
      `Processing payment for Loan ID: ${loan.generatedId}`,
      "info"
    );
  };

  return (
    <div className="modal-overlay-view-loan-supplier">
      <div className="modal-container-view-loan-supplier">
        <button className="close-button-view-loan-supplier" onClick={onClose}>
          ×
        </button>
        <h2>View Loans</h2>

        {/* Date Filters */}
        <div className="date-picker-container">
          <label htmlFor="datePicker-start-date">Start Date:</label>
          <DatePicker
            id="datePicker-start-date"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Select Start Date"
            dateFormat="yyyy-MM-dd" // Only display the date
          />
          <label htmlFor="datePicker-end-date">End Date:</label>
          <DatePicker
            id="datePicker-end-date"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="Select End Date"
            dateFormat="yyyy-MM-dd" // Only display the date
          />
          <button onClick={fetchLoansByDate} className="filter-button-add-loan-supplier">
            Filter
          </button>
        </div>

        {/* Loans Table */}
        <div className="table-container-view-loan-supplier">
          <table className="loans-table-view-loan-supplier">
            <thead>
              <tr>
                <th>Generated ID</th>
                <th>Loan Amount</th>
                <th>Cash Payment</th>
                <th>Bill Number</th>
                <th>Description</th>
                <th>Saved Time</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.generatedId}</td>
                  <td style={{ textAlign: "center" }}>
                    {editingLoan === loan.id ? (
                      <input
                        type="number"
                        value={updatedLoan.loanAmount}
                        onChange={(e) =>
                          handleInputChange("loanAmount", e.target.value)
                        }
                      />
                    ) : (
                      `${loan.loanAmount}`
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {loan.cashAmount ? `${loan.cashAmount}` : "N/A"}
                  </td>
                  <td>
                    {editingLoan === loan.id ? (
                      <input
                        type="text"
                        value={updatedLoan.billNumber}
                        onChange={(e) =>
                          handleInputChange("billNumber", e.target.value)
                        }
                      />
                    ) : (
                      loan.billNumber
                    )}
                  </td>
                  <td>
                    {editingLoan === loan.id ? (
                      <textarea
                        value={updatedLoan.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                      />
                    ) : (
                      loan.description
                    )}
                  </td>
                  <td>
                    {loan.saveTime
                      ? new Date(loan.saveTime).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="view-document-button-view-loan-supplier"
                      onClick={() => handleViewDocument(loan.filePath)}
                    >
                      View Document
                    </button>
                  </td>
                  <td>
                    {editingLoan === loan.id ? (
                      <button
                        className="update-button-view-loan-supplier"
                        onClick={() => handleUpdate(loan.id)}
                      >
                        Update
                      </button>
                    ) : (
                      <button
                        className="edit-button-view-loan-supplier"
                        onClick={() => handleEdit(loan)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="delete-button-view-loan-supplier"
                      onClick={() => handleDelete(loan.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="payment-button-view-loan-supplier"
                      onClick={() => handlePayment(loan)}
                    >
                      Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="cancel-button-view-loan-supplier" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

SupplierViewLoanModel.propTypes = {
  supplierId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SupplierViewLoanModel;
