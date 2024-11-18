import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "../css/AddLoanModal.css";

const AddLoanModal = ({ supplier, onClose, onSave, onViewLoan }) => {
  const [loanAmount, setLoanAmount] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSave = () => {
    if (!loanAmount || loanAmount <= 0 || !billNumber.trim()) {
      Swal.fire("Error", "Please fill all required fields correctly.", "error");
      return;
    }

    if (!selectedFile) {
      Swal.fire("Error", "Please select a file to upload.", "error");
      return;
    }

    // Prepare data for saving
    const loanData = {
      supid: supplier.Supid,
      supname: supplier.Supname,
      loanamount: parseFloat(loanAmount),
      billnumber: billNumber.trim(),
      description: description.trim(),
      date: new Date().toISOString(),
      file: selectedFile, // Handle file upload appropriately
    };

    onSave(loanData);
    onClose();
  };

  const handleViewLoan = () => {
    if (onViewLoan) {
      onViewLoan(supplier.Supid); // Trigger the view loan handler with supplier ID
    } else {
      Swal.fire("Feature Coming Soon", "View loan feature is not yet implemented.", "info");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validFileTypes = [
        "application/pdf", // PDF
        "application/msword", // Word
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word (docx)
        "application/vnd.ms-excel", // Excel
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel (xlsx)
        "text/plain", // Text files
        "image/jpeg", // JPEG images
        "image/png", // PNG images
        "image/jpg", // JPG images
      ];

      if (!validFileTypes.includes(file.type)) {
        Swal.fire(
          "Error",
          "Please upload a valid file (PDF, Word, Excel, Text, or Image).",
          "error"
        );
        e.target.value = null; // Clear the file input
        return;
      }

      setSelectedFile(file);
    }
  };

  // Close modal on `Escape` key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Add Loan Details</h2>
        <form>
          <div className="form-group-add-loan-model">
            <label>Supplier ID:</label>
            <input type="text" value={supplier.Supid} readOnly />
          </div>
          <div className="form-group-add-loan-model">
            <label>Supplier Name:</label>
            <input type="text" value={supplier.Supname} readOnly />
          </div>
          <div className="form-group-add-loan-model">
            <label>Loan Amount:</label>
            <input
              type="number"
              placeholder="Enter Loan Amount"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>
          <div className="form-group-add-loan-model">
            <label>Bill Number:</label>
            <input
              type="text"
              placeholder="Enter Bill Number"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
            />
          </div>
          <div className="form-group-add-loan-model">
            <label>Description:</label>
            <textarea
              placeholder="Enter Details About The Loan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group-add-loan-model">
            <label>Upload File:</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </div>
        </form>
        <div className="modal-actions">
          <button onClick={handleSave} className="save-button-add-loan">
            Save
          </button>
          <button onClick={handleViewLoan} className="view-loan-button-add-loan">
            View Loan
          </button>
        </div>
      </div>
    </div>
  );
};

AddLoanModal.propTypes = {
  supplier: PropTypes.shape({
    Supid: PropTypes.string.isRequired,
    Supname: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onViewLoan: PropTypes.func, // Optional handler for viewing loan details
};

export default AddLoanModal;
