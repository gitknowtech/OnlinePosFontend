import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "../css/AddLoanModal.css"; // Add appropriate styles here

const AddCashModal = ({ supplier, onClose, onSave }) => {
  const [cashAmount, setCashAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Direct Payment");
  const [handoverDate, setHandoverDate] = useState("");
  const [chequeDate, setChequeDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSave = () => {
    if (
      !cashAmount ||
      cashAmount <= 0 ||
      !referenceNumber.trim() ||
      (paymentMethod === "Cheque Payment" &&
        (!handoverDate || !chequeDate))
    ) {
      Swal.fire("Error", "Please fill all required fields correctly.", "error");
      return;
    }

    if (!selectedFile) {
      Swal.fire("Error", "Please upload a valid file.", "error");
      return;
    }

    // Prepare the data to be sent back
    onSave({
      supid: supplier.Supid,
      supname: supplier.Supname,
      cashamount: parseFloat(cashAmount),
      referencenumber: referenceNumber.trim(),
      description: description.trim(),
      paymentmethod: paymentMethod,
      handoverdate: paymentMethod === "Cheque Payment" ? handoverDate : null,
      chequedate: paymentMethod === "Cheque Payment" ? chequeDate : null,
      file: selectedFile, // Send the selected file
      date: new Date().toISOString(),
    });

    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validFileTypes = [
        "image/jpeg", // JPEG images
        "image/png",  // PNG images
        "image/jpg",  // JPG images
        "application/pdf", // PDF
        "application/msword", // Word documents
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word (docx)
        "application/vnd.ms-excel", // Excel files
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (xlsx)
      ];

      if (!validFileTypes.includes(file.type)) {
        Swal.fire("Error", "Invalid file type. Please upload a valid file.", "error");
        e.target.value = null; // Clear the input field
        return;
      }

      setSelectedFile(file);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Add Cash Details</h2>
        <form className="two-column-layout">
          {/* Row 1 */}
          <div className="form-group-add-loan-model">
            <label>Supplier ID:</label>
            <input type="text" value={supplier.Supid} readOnly />
          </div>
          <div className="form-group-add-loan-model">
            <label>Supplier Name:</label>
            <input type="text" value={supplier.Supname} readOnly />
          </div>
          {/* Row 2 */}
          <div className="form-group-add-loan-model">
            <label>Cash Amount:</label>
            <input
              type="number"
              placeholder="Enter Cash Amount"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
            />
          </div>
          <div className="form-group-add-loan-model">
            <label>Reference Number:</label>
            <input
              type="text"
              placeholder="Enter Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>
          {/* Row 3 */}
          <div className="form-group-add-loan-model">
            <label>Payment Method:</label>
            <select
              id="combobox-add-loan-model"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Direct Payment">Direct Payment</option>
              <option value="Cheque Payment">Cheque Payment</option>
            </select>
          </div>
          {paymentMethod === "Cheque Payment" && (
            <>
              <div className="form-group-add-loan-model">
                <label>Handover Date:</label>
                <input
                  type="date"
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                />
              </div>
              <div className="form-group-add-loan-model">
                <label>Cheque Date:</label>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                />
              </div>
            </>
          )}
          {/* Row 4 */}
          <div className="form-group-add-loan-model full-width">
            <label>Description:</label>
            <textarea
              placeholder="Enter Details About The Cash Payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          {/* Row 5 */}
          <div className="form-group-add-loan-model full-width">
            <label>Upload File:</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
            />
          </div>
        </form>
        <div className="modal-actions">
          <button onClick={handleSave} className="save-button-add-loan">
            Save
          </button>
          <button
            onClick={() => window.location.reload()}
            className="view-loan-button-add-loan"
          >
            View Cash
          </button>
        </div>
      </div>
    </div>
  );
};

AddCashModal.propTypes = {
  supplier: PropTypes.shape({
    Supid: PropTypes.string.isRequired,
    Supname: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddCashModal;
