import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css2/SupplierViewLoanModel.css";

const SupplierViewLoanModel = ({ supplierId, onClose }) => {
  const [loans, setLoans] = useState([]);
  const [editingLoan, setEditingLoan] = useState(null);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [paymentFile, setPaymentFile] = useState([]);
  const [updatedLoan, setUpdatedLoan] = useState({});
  const [startDate, setStartDate] = useState(null); // Start date for filtering
  const [endDate, setEndDate] = useState(null); // End date for filtering
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState("All"); // New dropdown state
  const [paymentGeneratedId, setPaymentGeneratedId] = useState("");
  const [paymentGrossTotal, setPaymentGrossTotal] = useState(0);
  const [paymentCashAmount, setPaymentCashAmount] = useState(0);
  const [paymentCreditAmount, setPaymentCreditAmount] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentOriginalCashAmount, setPaymentOriginalCashAmount] = useState(0);
  const [paymentId, setPaymentId] = useState(null); // Add this line to store the loan ID

  useEffect(() => {
    fetchLoans();
  }, [supplierId]);

  useEffect(() => {
    applySettlementFilter(); // Apply filter whenever loans or settlement status changes
  }, [loans, settlementStatus]);

  // Fetch all loans for the supplier
  const fetchLoans = async () => {
    try {
      const response = await fetch(
        `http://154.26.129.243:5000/api/suppliers/get_loans_supplier_loan/${supplierId}`
      );
      const data = await response.json();

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

  // Filter loans based on settlement status
  const applySettlementFilter = () => {
    if (settlementStatus === "Settled") {
      const settledLoans = loans.filter((loan) => loan.loanAmount === 0);
      setFilteredLoans(settledLoans);
    } else if (settlementStatus === "Unsettled") {
      const unsettledLoans = loans.filter((loan) => loan.loanAmount > 0);
      setFilteredLoans(unsettledLoans);
    } else {
      setFilteredLoans(loans); // Show all loans
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
        `http://154.26.129.243:5000/api/suppliers/get_loans_by_date/${supplierId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&settlementStatus=${settlementStatus}`
      );
      const data = await response.json();

      if (response.ok) {
        setLoans(data);
        setFilteredLoans(data); // Update filtered loans
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

  const handleViewDocument = (filePath) => {
    if (!filePath) {
      Swal.fire("Error", "No document available to view.", "error");
      return;
    }

    const url = `http://154.26.129.243:5000/api/suppliers/view_file?filePath=${encodeURIComponent(
      filePath
    )}`;
    window.open(url, "_blank");
  };

  // Handle delete loan
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
          `http://154.26.129.243:5000/api/suppliers/delete_supplier_loan/${id}`,
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

  // Handle edit loan
  const handleEdit = (loan) => {
    setEditingLoan(loan.id);
    setUpdatedLoan({
      loanAmount: loan.loanAmount,
      cashAmount: loan.cashAmount,
      description: loan.description,
      billNumber: loan.billNumber,
    });
  };

  // Handle update loan
  const handleUpdate = async (id) => {
    try {
      const response = await fetch(
        `http://154.26.129.243:5000/api/suppliers/update_supplier_loan/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedLoan),
        }
      );
      const data = await response.json();

      if (response.ok) {
        // Update the loan in the state
        setLoans(
          loans.map((loan) =>
            loan.id === id
              ? {
                  ...loan,
                  loanAmount: updatedLoan.loanAmount,
                  billNumber: updatedLoan.billNumber,
                  description: updatedLoan.description,
                  totalAmount:
                    parseFloat(updatedLoan.loanAmount) +
                    parseFloat(loan.cashAmount || 0),
                }
              : loan
          )
        );

        // If the updated loan is displayed in the Payment Modal, update modal values
        if (id === paymentId) {
          setPaymentGrossTotal(
            parseFloat(updatedLoan.loanAmount) + parseFloat(paymentCashAmount)
          );
          setPaymentCreditAmount(
            parseFloat(updatedLoan.loanAmount) - parseFloat(paymentCashAmount)
          );
        }

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

  const handlePayment = (loan) => {
    setPaymentId(loan.id); // Store the loan ID
    setPaymentGeneratedId(loan.generatedId);
    setPaymentGrossTotal(loan.totalAmount);
    setPaymentCashAmount(loan.cashAmount || 0);
    setPaymentOriginalCashAmount(loan.cashAmount || 0); // Store original cash amount
    setPaymentCreditAmount(loan.totalAmount - (loan.cashAmount || 0));
    setReferenceNumber(""); // Reset reference number
    setShowPaymentModal(true);
  };

  const handleCashAmountChange = (e) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === "") {
      setPaymentCashAmount("");
      setPaymentCreditAmount(paymentGrossTotal);
      return;
    }

    const newCashAmount = parseFloat(inputValue);

    // If input is not a valid number, don't update state
    if (isNaN(newCashAmount)) {
      return;
    }

    setPaymentCashAmount(newCashAmount);
    setPaymentCreditAmount(paymentGrossTotal - newCashAmount);
  };

  const handleUpdatePayment = async () => {
    if (!referenceNumber || paymentCashAmount === "") {
      Swal.fire(
        "Error",
        "Please enter a valid cash amount and reference number.",
        "error"
      );
      return;
    }
  
    console.log("Generated ID:", paymentGeneratedId);
  
    if (paymentCashAmount < paymentOriginalCashAmount) {
      Swal.fire(
        "Error",
        `The cash amount cannot be reduced below the original value of ${paymentOriginalCashAmount}.`,
        "error"
      );
      return;
    }
  
    if (paymentCashAmount > paymentGrossTotal) {
      Swal.fire(
        "Error",
        `The cash amount cannot exceed the gross total amount of ${paymentGrossTotal}.`,
        "error"
      );
      return;
    }
  
    const paymentDifference = paymentCashAmount - paymentOriginalCashAmount;
  
    if (paymentDifference === 0 && !paymentFile) {
      Swal.fire(
        "Info",
        "No changes in cash amount detected and no file uploaded.",
        "info"
      );
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("generatedId", paymentGeneratedId);
      formData.append("paymentAmount", paymentDifference);
      formData.append("referenceNumber", referenceNumber);
      if (paymentFile) {
        formData.append("file", paymentFile);
      }
  
      const addPaymentResponse = await fetch(
        `http://154.26.129.243:5000/api/suppliers/add_supplier_loan_payment`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      // Check if the response is not ok
      if (!addPaymentResponse.ok) {
        // Attempt to parse the error response
        try {
          const addPaymentData = await addPaymentResponse.json();
          throw new Error(
            addPaymentData.message || "Failed to save payment record."
          );
        } catch (jsonError) {
          throw new Error("Unexpected response format while saving payment record.", jsonError);
        }
      }
  
      const updateLoanResponse = await fetch(
        `http://154.26.129.243:5000/api/suppliers/update_supplier_loan_new/${paymentGeneratedId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cashAmount: paymentCashAmount,
            loanAmount: paymentCreditAmount,
          }),
        }
      );
  
      // Check if the update request was successful
      if (!updateLoanResponse.ok) {
        try {
          const updateLoanData = await updateLoanResponse.json();
          throw new Error(updateLoanData.message || "Failed to update loan.");
        } catch (jsonError) {
          throw new Error("Unexpected response format while updating loan.", jsonError);
        }
      }
  
      await fetchLoans();
  
      Swal.fire("Success", "Payment updated successfully.", "success");
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error updating payment:", error);
      Swal.fire("Error", error.message || "Failed to update payment.", "error");
    }
  };
  
  

  return (
    <div className="modal-overlay-view-loan-supplier">
      <div className="modal-container-view-loan-supplier">
        <button className="close-button-view-loan-supplier" onClick={onClose}>
          ×
        </button>
        <h2>View Loans</h2>

        {/* Date Filters and Settlement Dropdown */}
        <div className="date-picker-container">
          <div className="date-picker-group">
            <label htmlFor="datePicker-start-date">Start Date:</label>
            <DatePicker
              id="datePicker-start-date"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Select Start Date"
              dateFormat="yyyy-MM-dd"
            />
            <label htmlFor="datePicker-end-date">End Date:</label>
            <DatePicker
              id="datePicker-end-date"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="Select End Date"
              dateFormat="yyyy-MM-dd"
            />
            <button
              onClick={fetchLoansByDate}
              className="filter-button-add-loan-supplier"
            >
              Filter
            </button>
          </div>
          <div className="settlement-filter-group">
            <label htmlFor="settlement-filter">Settlement Status:</label>
            <select
              id="settlement-filter"
              value={settlementStatus}
              onChange={(e) => setSettlementStatus(e.target.value)}
              className="settlement-dropdown"
            >
              <option value="All">All</option>
              <option value="Settled">Settled</option>
              <option value="Unsettled">Unsettled</option>
            </select>
          </div>
        </div>

        {/* Loans Table */}
        <div className="table-container-view-loan-supplier">
          <table className="loans-table-view-loan-supplier">
            <thead>
              <tr>
                <th>Generated ID</th>
                <th>Loan Amount</th>
                <th>Cash Payment</th>
                <th>Total Amount</th>
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
                          setUpdatedLoan({
                            ...updatedLoan,
                            loanAmount: e.target.value,
                          })
                        }
                      />
                    ) : (
                      `${loan.loanAmount}`
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {loan.cashAmount ? `${loan.cashAmount}` : "N/A"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {loan.totalAmount ? `${loan.totalAmount}` : "N/A"}
                  </td>
                  <td>
                    {editingLoan === loan.id ? (
                      <input
                        type="text"
                        value={updatedLoan.billNumber}
                        onChange={(e) =>
                          setUpdatedLoan({
                            ...updatedLoan,
                            billNumber: e.target.value,
                          })
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
                          setUpdatedLoan({
                            ...updatedLoan,
                            description: e.target.value,
                          })
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


       {/* Payment Modal */}
       {showPaymentModal && (
          <div id="modal-overlay">
            <div id="modal-content">
              <h3>Update Payment Amounts</h3>
              <div className="modal-field">
                <label>Generated ID:</label>
                <span>{paymentGeneratedId}</span>
              </div>
              <div className="modal-field">
                <label>Gross Total:</label>
                <span>{paymentGrossTotal.toFixed(2)}</span>
              </div>
              <div className="modal-field">
                <label>Cash Amount:</label>
                <input
                  type="number"
                  value={paymentCashAmount}
                  onChange={handleCashAmountChange}
                />
              </div>
              <div className="modal-field">
                <label>Credit Amount:</label>
                <input
                  type="number"
                  value={paymentCreditAmount.toFixed(2)}
                  readOnly
                />
              </div>
              <div className="modal-field">
                <label>Reference Number:</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
              <div className="modal-field">
                <label>Upload File:</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={(e) => setPaymentFile(e.target.files[0])} // Handle file selection
                />
              </div>
              <div className="modal-buttons">
                <button onClick={handleUpdatePayment}>Update</button>
                <button onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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