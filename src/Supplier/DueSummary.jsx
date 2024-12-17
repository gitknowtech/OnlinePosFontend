import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/DueSummary.css"; // CSS file for styling
import paymentImage from "../assets/icons/money.png";
import deleteImage from "../assets/icons/bin.png";
import viewImage from "../assets/icons/view.png";
import historyImage from "../assets/icons/history.png";

export default function DueSummary() {
  const [summaries, setSummaries] = useState([]);
  const [searchInvoiceId, setSearchInvoiceId] = useState("");

  // State variables for the payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentGeneratedId, setPaymentGeneratedId] = useState("");
  const [paymentGrossTotal, setPaymentGrossTotal] = useState(0);
  const [paymentCashAmount, setPaymentCashAmount] = useState(0);
  const [paymentCreditAmount, setPaymentCreditAmount] = useState(0);

  const [showHistoryModal, setShowHistoryModal] = useState(false); // New state for history modal
  const [paymentHistory, setPaymentHistory] = useState([]); // Payment history data
  const [referenceNumber, setReferenceNumber] = useState(""); // Reference number for payments

  // Fetch summaries on component mount
  useEffect(() => {
    fetchSummaries();
  }, []);

  // Fetch summaries, optionally filtering by Invoice ID
  const fetchSummaries = async (invoiceId = "") => {
    try {
      let response;
      if (invoiceId) {
        response = await axios.get(`http://154.26.129.243:5000/api/purchases/get_purchase/${invoiceId}`);
        const data = response.data;

        if (!data || !data.summary) {
          Swal.fire("Info", "No purchase summaries found for the given Invoice ID.", "info");
          return;
        }

        const summary = data.summary;
        summary.SupplierName = summary.SupplierName || "";
        summary.id = summary.id || Math.random();

        setSummaries([summary]);
      } else {
        response = await axios.get(`http://154.26.129.243:5000/api/purchases/get_purchase_summaries`);
        const data = response.data;

        if (!data || data.length === 0) {
          Swal.fire("Info", "No purchase summaries found.", "info");
          return;
        }

        setSummaries(data);
      }
    } catch (error) {
      console.error("Error fetching purchase summaries:", error);
      Swal.fire("Error", "Failed to fetch purchase summaries.", "error");
    }
  };

  // Handle search by Invoice ID
  const handleSearch = () => {
    fetchSummaries(searchInvoiceId.trim());
  };

  // Handle payment action
  const handlePayment = (generatedId) => {
    const summary = summaries.find((item) => item.generatedid === generatedId);
    if (summary) {
      setPaymentGeneratedId(summary.generatedid);
      setPaymentGrossTotal(parseFloat(summary.gross_total) || 0);
      setPaymentCashAmount(parseFloat(summary.cash_amount) || 0);
      setPaymentCreditAmount(parseFloat(summary.credit_amount) || 0);
      setReferenceNumber(""); // Clear reference number for each new payment entry
      setShowPaymentModal(true);
    } else {
      Swal.fire("Error", "Purchase summary not found.", "error");
    }
  };

  // Handle update payment
  const handleUpdatePayment = async () => {
    const newCashAmount = parseFloat(paymentCashAmount);
    const currentCashAmount =
      summaries.find((summary) => summary.generatedid === paymentGeneratedId)?.cash_amount || 0;

    if (newCashAmount < currentCashAmount) {
      Swal.fire("Error", "New cash amount cannot be less than the current cash amount.", "error");
      return;
    }

    if (newCashAmount > paymentGrossTotal) {
      Swal.fire("Error", "Cash amount cannot exceed the gross total.", "error");
      return;
    }

    if (!referenceNumber) {
      Swal.fire("Error", "Reference number is required for updates.", "error");
      return;
    }

    try {
      const updateData = {
        cashAmount: newCashAmount,
        creditAmount: paymentGrossTotal - newCashAmount,
        referenceNumber,
      };

      const response = await axios.put(
        `http://154.26.129.243:5000/api/purchases/update_payment/${paymentGeneratedId}`,
        updateData
      );

      if (response.status === 200) {
        Swal.fire("Success", "Payment amounts updated successfully.", "success");
        fetchSummaries();
        setShowPaymentModal(false);
      } else {
        Swal.fire("Error", "Failed to update payment amounts.", "error");
      }
    } catch (error) {
      console.error("Error updating payment amounts:", error);
      Swal.fire("Error", "Failed to update payment amounts.", "error");
    }
  };

  const handleDelete = async (generatedId) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "This will delete all related data for the selected purchase.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });
  
      if (!confirm.isConfirmed) return;
  
      const response = await axios.delete(
        `http://154.26.129.243:5000/api/purchases/delete_whole_data/${generatedId}`
      );
  
      if (response.status === 200) {
        Swal.fire("Deleted!", "All related data has been deleted.", "success");
        
        // Remove the deleted item from the local state
        setSummaries((prevSummaries) => 
          prevSummaries.filter((summary) => summary.generatedid !== generatedId)
        );
  
        // Fetch data again to ensure the state is consistent
        fetchSummaries();
      } else {
        Swal.fire("Error", "Failed to delete the data.", "error");
      }
    } catch (error) {
      console.error("Error deleting related data:", error);
      Swal.fire("Error", "Failed to delete the data.", "error");
    }
  };
  

  // Handle payment history action
  const handleHistory = async (generatedId) => {
    try {
      const response = await axios.get(
        `http://154.26.129.243:5000/api/purchases/get_payment_history/${generatedId}`
      );
      setPaymentHistory(response.data || []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      Swal.fire("Error", "Failed to fetch payment history.", "error");
    }
  };

  const handleDeleteHistory = async (historyId, payment, savedTime) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: `This will delete the payment of ${payment} saved on ${new Date(
          savedTime
        ).toLocaleString()}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });
  
      if (!confirm.isConfirmed) return;
  
      const response = await axios.delete(
        `http://154.26.129.243:5000/api/purchases/delete_payment/${historyId}`,
        {
          data: { payment }, // Pass `payment` in the request body
        }
      );
  
      if (response.status === 200) {
        Swal.fire("Deleted!", "Payment history entry has been deleted.", "success");
        
        // Fetch data again to ensure the state is consistent
        fetchSummaries();
        setPaymentHistory((prev) => prev.filter((item) => item.id !== historyId));
      } else {
        Swal.fire("Error", "Failed to delete payment history.", "error");
      }
    } catch (error) {
      console.error("Error deleting payment history:", error);
      Swal.fire("Error", "Failed to delete payment history.", "error");
    }
  };
  
  const handleCashAmountChange = (e) => {
    let newCashAmount = parseFloat(e.target.value) || 0;
    if (newCashAmount < 0) newCashAmount = 0;
    if (newCashAmount > paymentGrossTotal) newCashAmount = paymentGrossTotal;
    setPaymentCashAmount(newCashAmount);
    setPaymentCreditAmount(paymentGrossTotal - newCashAmount);
  };

  return (
    <div id="due-summary">
      <h2 id="due-summary-header">Supplier Purchase Summaries</h2>

      {/* Search Section */}
      <div id="search-container">
        <input
          type="text"
          placeholder="Enter Invoice ID"
          value={searchInvoiceId}
          onChange={(e) => setSearchInvoiceId(e.target.value)}
        />
        <button id="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>

      <table id="due-summary-table">
        <thead>
          <tr>
            <th>Generated ID</th>
            <th>Gross Total</th>
            <th>Total Quantity</th>
            <th>Total Items</th>
            <th>Cash Amount</th>
            <th>Credit Amount</th>
            <th>Invoice Date</th>
            <th>Supplier Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => (
            <tr key={summary.id}>
              <td>{summary.generatedid}</td>
              <td>{parseFloat(summary.gross_total).toFixed(2)}</td>
              <td>{parseFloat(summary.total_quantity).toFixed(4)}</td>
              <td>{summary.total_items}</td>
              <td>{parseFloat(summary.cash_amount).toFixed(2)}</td>
              <td>{parseFloat(summary.credit_amount).toFixed(2)}</td>
              <td>
                {new Date(summary.invoice_date).toLocaleDateString("en-GB")}
              </td>
              <td>{summary.SupplierName}</td>
              <td>
                <button
                  id={`payment-button-${summary.id}`}
                  title="Payment"
                  onClick={() => handlePayment(summary.generatedid)}
                >
                  <img
                    src={paymentImage}
                    alt="Payment"
                    id={`payment-image-${summary.id}`}
                  />
                </button>
                <button
                  id={`delete-button-${summary.id}`}
                  title="Delete"
                  onClick={() => handleDelete(summary.generatedid)}
                >
                  <img
                    src={deleteImage}
                    alt="Delete"
                    id={`delete-image-${summary.id}`}
                  />
                </button>
                <button
                  id={`view-document-${summary.id}`}
                  title="View Document"
                  onClick={() =>
                    window.open(
                      summary.document_link,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <img
                    src={viewImage}
                    alt="View"
                    id={`view-image-${summary.id}`}
                  />
                </button>
                <button
                  id={`history-button-${summary.id}`}
                  title="History"
                  onClick={() => handleHistory(summary.generatedid)}
                >
                  <img src={historyImage} alt="History" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div id="modal-overlay">
          <div id="modal-content">
            <h3>Update Payment Amounts</h3>
            <div id="modal-field-generatedid" className="modal-field">
              <label>Generated ID:</label>
              <span>{paymentGeneratedId}</span>
            </div>
            <div id="modal-field-grosstotal" className="modal-field">
              <label>Gross Total:</label>
              <span>{paymentGrossTotal.toFixed(2)}</span>
            </div>
            <div id="modal-field-cashamount" className="modal-field">
              <label>Cash Amount:</label>
              <input
                type="number"
                value={paymentCashAmount}
                onChange={handleCashAmountChange}
              />
            </div>
            <div id="modal-field-creditamount" className="modal-field">
              <label>Credit Amount:</label>
              <input
                type="number"
                value={paymentCreditAmount.toFixed(2)}
                readOnly
              />
            </div>
            <div id="modal-field-reference" className="modal-field">
              <label>Reference Number:</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
            <div id="modal-buttons">
              <button id="update-button" onClick={handleUpdatePayment}>
                Update
              </button>
              <button
                id="cancel-button"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div id="modal-overlay">
          <div id="modal-content">
            <h3>Payment History</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Payment</th>
                  <th>Reference</th>
                  <th>Saved Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((history) => (
                  <tr key={history.id}>
                    <td>{history.id}</td>
                    <td>{history.payment}</td>
                    <td>{history.refference}</td>
                    <td>{new Date(history.saved_time).toLocaleString()}</td>
                    <td>
                      <button
                        id="delete-button-due-summery"
                        title="Delete Payment"
                        onClick={() =>
                          handleDeleteHistory(
                            history.id,
                            history.payment,
                            history.saved_time
                          )
                        }
                      >
                        <img src={deleteImage} alt="Delete Payment" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              id="close-button-due-summery"
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
