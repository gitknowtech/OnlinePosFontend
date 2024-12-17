import PropTypes from "prop-types";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../css1/AddCustomer.css"; // Custom CSS for styling

export default function AddCustomer({ UserName, store }) {
  const [cusId, setCusId] = useState("");
  const [cusName, setCusName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [mobile1, setMobile1] = useState("");
  const [mobile2, setMobile2] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  // Validate form data
  const validateFormData = () => {
    if (cusId.trim() === "" || cusName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Customer ID and Customer Name are required!",
      });
      return false;
    }
    if (mobile1.length !== 10 || isNaN(mobile1)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Mobile number must be 10 digits!",
      });
      return false;
    }
    if (creditLimit && isNaN(creditLimit)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Credit Limit",
        text: "Credit limit must be a valid number!",
      });
      return false;
    }
    return true;
  };

  // Check for duplicates
  const checkForDuplicates = async () => {
    try {
      const response = await axios.post(
        "http://154.26.129.243:5000/api/customer/customer_check_duplicate",
        { cusId, mobile1, mobile2, idNumber }
      );
      if (response.status === 409) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Found",
          text: response.data.message,
        });
        return true;
      }
      return false;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Error checking duplicates.",
      });
      return false;
    }
  };

  
  // Save customer
  const handleSave = async () => {
    if (!validateFormData()) return;
    const isDuplicate = await checkForDuplicates();
    if (isDuplicate) return;

    const customerData = {
      cusId,
      cusName,
      address1,
      address2,
      mobile1,
      mobile2,
      idNumber,
      creditLimit,
      user: UserName,
      store,
    };

    try {
      const response = await axios.post(
        "http://154.26.129.243:5000/api/customer/add_customer",
        customerData
      );
      if (response.status === 201) {
        resetFormFields();
        Swal.fire({
          icon: "success",
          title: "Customer Added",
          text: "Customer added successfully!",
        });
      } else {
        throw new Error("Failed to save customer");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || `Error saving customer: ${error.message}`,
      });
    }
  };

  // Reset form fields
  const resetFormFields = () => {
    setCusId("");
    setCusName("");
    setAddress1("");
    setAddress2("");
    setMobile1("");
    setMobile2("");
    setIdNumber("");
    setCreditLimit("");
  };

  return (
    <div id="customer-model">
      <div id="customer-form">
        <div id="cusId-group">
          <label htmlFor="cusId" id="cusId-label">Customer ID</label>
          <input
            type="text"
            id="cusId"
            value={cusId}
            onChange={(e) => setCusId(e.target.value)}
            placeholder="Enter Customer ID"
          />
        </div>
        <div id="cusName-group">
          <label htmlFor="cusName" id="cusName-label">Customer Name</label>
          <input
            type="text"
            id="cusName"
            value={cusName}
            onChange={(e) => setCusName(e.target.value)}
            placeholder="Enter Customer Name"
          />
        </div>
        <div id="address1-group">
          <label htmlFor="address1" id="address1-label">Address 1</label>
          <input
            type="text"
            id="address1"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="Enter Address 1"
          />
        </div>
        <div id="address2-group">
          <label htmlFor="address2" id="address2-label">Address 2</label>
          <input
            type="text"
            id="address2"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="Enter Address 2"
          />
        </div>
        <div id="mobile1-group">
          <label htmlFor="mobile1" id="mobile1-label">Mobile 1</label>
          <input
            type="text"
            id="mobile1"
            value={mobile1}
            onChange={(e) => setMobile1(e.target.value)}
            placeholder="Enter Mobile 1"
          />
        </div>
        <div id="mobile2-group">
          <label htmlFor="mobile2" id="mobile2-label">Mobile 2</label>
          <input
            type="text"
            id="mobile2"
            value={mobile2}
            onChange={(e) => setMobile2(e.target.value)}
            placeholder="Enter Mobile 2"
          />
        </div>
        <div id="idNumber-group">
          <label htmlFor="idNumber" id="idNumber-label">ID Number</label>
          <input
            type="text"
            id="idNumber"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="Enter ID Number"
          />
        </div>
        <div id="creditLimit-group">
          <label htmlFor="creditLimit" id="creditLimit-label">Credit Limit</label>
          <input
            type="text"
            id="creditLimit"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            placeholder="Enter Credit Limit"
          />
        </div>
        <div id="button-group">
          <button id="saveButton" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

AddCustomer.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
