import { useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "../css/AddLoanModal.css";
import SupplierViewLoanModel from "./SupplierViewLoanModel";

const AddLoanModal = ({ supplier, onClose }) => {
  const [loanAmount, setLoanAmount] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [description, setDescription] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const handleViewLoanClick = () => {
    setShowLoanModal(true); // Show the modal when "View Loan" is clicked
  };

  const handleCloseModal = () => {
    setShowLoanModal(false); // Hide the modal
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

 

  const handleSave = async () => {
    // Ensure loanAmount can be 0 and only reject negative values
    if (
      loanAmount === undefined || 
      loanAmount < 0 || 
      !billNumber.trim() || 
      cashAmount === undefined || 
      cashAmount < 0
    ) {
      Swal.fire("Error", "Please fill all required fields correctly.", "error");
      return;
    }
  
    // Create form data
    const formData = new FormData();
    formData.append("supId", supplier.Supid);
    formData.append("supName", supplier.Supname);
    formData.append("loanAmount", loanAmount);
    formData.append("cashAmount", cashAmount);
    formData.append("billNumber", billNumber.trim());
    formData.append("description", description.trim());
  
    // Only append the file if it is selected
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
  
    try {
      const response = await fetch("http://154.26.129.243:5000/api/suppliers/add_loan", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        Swal.fire("Success", data.message, "success");
        onClose(); // Close the modal
      } else {
        Swal.fire("Error", data.message || "Failed to save loan details.", "error");
      }
    } catch (error) {
      console.error("Error saving loan:", error);
      Swal.fire("Error", "Failed to save loan details.", "error");
    }
  };

  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Add Loan Details</h2>
        <form className="three-column-layout">
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
            <label>Cash Amount:</label>
            <input
              type="number"
              placeholder="Enter Cash Amount"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
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
          <div className="form-group-add-loan-model full-width">
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
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
          </div>
        </form>
        <div className="modal-actions">
          <button onClick={handleSave} className="save-button-add-loan">
            Save
          </button>
          <button
            onClick={handleViewLoanClick}
            className="view-loan-button-add-loan"
          >
            View Loan
          </button>

          {showLoanModal && (
            <SupplierViewLoanModel
              supplierId={supplier.Supid}
              onClose={handleCloseModal}
            />
          )}
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
};

export default AddLoanModal;
