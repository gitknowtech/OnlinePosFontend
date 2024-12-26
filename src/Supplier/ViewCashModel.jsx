import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "../css2/SupplierViewLoanModel.css";

const ViewCashModel = ({ supplierId, onClose }) => {
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedGeneratedId, setSelectedGeneratedId] = useState(null);

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

  // Fetch payment history for a generated ID
  const fetchHistory = async (generatedId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/suppliers/get_loan_payment_history/${generatedId}`
      );
      const data = await response.json();

      if (response.ok) {
        setHistoryData(data);
        setSelectedGeneratedId(generatedId);
        setHistoryModalVisible(true);
      } else {
        Swal.fire("Error", data.message || "Failed to fetch history.", "error");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      Swal.fire("Error", "Failed to fetch history.", "error");
    }
  };


  
  const handleDeletePayment = async (paymentId, generatedId, paymentAmount) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the payment and update the loan record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    });
  
    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/suppliers/delete_supplier_payment/${paymentId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ generatedId, paymentAmount }), // Send the required data to update supplier_loan
          }
        );
  
        const data = await response.json();
  
        if (response.ok) {
          console.log("Delete successful:", data); // Log success response
          setHistoryData(historyData.filter((payment) => payment.id !== paymentId));
          Swal.fire("Deleted!", "Payment and related file deleted successfully.", "success");
          fetchLoans(); // Refresh loans table after deletion
        } else {
          console.error("Error response from server:", data); // Log server error response
          Swal.fire("Error", data.message || "Failed to delete payment.", "error");
        }
      } catch (error) {
        console.error("Error occurred during delete operation:", error);
        Swal.fire("Error", "Failed to delete payment.", "error");
      }
    }
  };
  


  // View document
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

  

  const handleViewDocumentNew = (filePath) => {
    if (!filePath) {
      Swal.fire("Error", "No document available to view.", "error");
      return;
    }

    const url = `http://localhost:5000/api/suppliers/view_file_new?filePath=${encodeURIComponent(
      filePath
    )}`;
    window.open(url, "_blank");
  };




  // Filter loans by bill number
  const filteredLoans = loans.filter((loan) =>
    loan?.billNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close the history modal
  const closeHistoryModal = () => {
    setHistoryModalVisible(false);
    setHistoryData([]);
    setSelectedGeneratedId(null);
  };

  return (
    <div className="modal-overlay-view-loan-supplier">
      <div className="modal-container-view-loan-supplier">
        <button className="close-button-view-loan-supplier" onClick={onClose}>
          ×
        </button>
        <h2>View Cash</h2>

        {/* Search Box */}
        <div className="search-box-view-loan-supplier">
          <label htmlFor="search-bill-number">Search Bill Number:</label>
          <input
            type="text"
            id="search-bill-number"
            placeholder="Enter bill number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.generatedId}</td>
                    <td style={{ textAlign: "center" }}>{loan.loanAmount}</td>
                    <td style={{ textAlign: "center" }}>
                      {loan.cashAmount ? `${loan.cashAmount}` : "N/A"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {loan.totalAmount ? `${loan.totalAmount}` : "N/A"}
                    </td>
                    <td>{loan.billNumber}</td>
                    <td>{loan.description}</td>
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
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        className="history-button-view-loan-supplier"
                        onClick={() => fetchHistory(loan.generatedId)}
                      >
                        History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No records found for the entered bill number.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* History Modal */}
        {historyModalVisible && (
          <div id="supplier_payment_history_model_overlay">
            <div id="supplier_payment_history_model_content">
              <h3>Payment History for Generated ID: {selectedGeneratedId}</h3>
              <div id="supplier_payment_history_model_table_container">
                <table id="supplier_payment_history_model_table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Payment Amount</th>
                      <th>Reference Number</th>
                      <th>Saved Time</th>
                      <th>Document</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.length > 0 ? (
                      historyData.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.id}</td>
                          <td>{payment.paymentAmount}</td>
                          <td>{payment.referenceNumber}</td>
                          <td>
                            {payment.saveTime
                              ? new Date(payment.saveTime).toLocaleString()
                              : "N/A"}
                          </td>
                          <td>
                            {payment.filePath ? (
                              <button
                                onClick={() => handleViewDocument(payment.filePath)}
                              >
                                View
                              </button>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td>
                            <button
                              className="delete-button-history"
                              onClick={() =>
                                handleDeletePayment(payment.id, payment.generatedId, payment.paymentAmount)
                              }
                            >
                              Delete
                            </button>

                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          No payment history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button
                id="supplier_payment_history_model_close"
                className="close-history-modal"
                onClick={closeHistoryModal}
              >
                Close
              </button>
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

ViewCashModel.propTypes = {
  supplierId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ViewCashModel;