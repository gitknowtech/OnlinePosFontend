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

  // Function to validate form data
  const validateFormData = () => {
    console.log("Validating form data...");
    if (cusId.trim() === "" || cusName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Customer ID and Customer Name are required!",
      });
      console.error("Validation failed: Customer ID or Customer Name is empty");
      return false;
    }

    if (mobile1.length !== 10 || isNaN(mobile1)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Mobile number must be 10 digits!",
      });
      console.error("Validation failed: Mobile number is invalid");
      return false;
    }

    return true;
  };

  // Function to check for duplicate data
  const checkForDuplicates = async () => {
    console.log("Checking for duplicate data...");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/customer/customer_check_duplicate",
        {
          cusId,
          mobile1,
          mobile2,
          idNumber,
        }
      );

      if (response.status === 409) {
        console.log("Duplicate found:", response.data.message);
        Swal.fire({
          icon: "error",
          title: "Duplicate Found",
          text: response.data.message, // Display detailed message from the server
        });
        return true; // Indicate a duplicate was found
      }
      console.log("No duplicates found");
      return false; // No duplicates found
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "An error occurred while checking for duplicates.",
      });
      return false;
    }
  };

  // Function to handle save
  const handleSave = async () => {
    console.log("Handle save initiated...");
    if (!validateFormData()) return;

    const isDuplicate = await checkForDuplicates();
    if (isDuplicate) {
      console.log("Save aborted due to duplicate data");
      return; // Stop the process if a duplicate is found
    }

    const customerData = {
      cusId,
      cusName,
      address1,
      address2,
      mobile1,
      mobile2,
      idNumber,
      user: UserName,
      store,
    };

    console.log("Customer data prepared for saving:", customerData);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/customer/add_customer",
        customerData
      );

      console.log("Response received from server:", response);

      if (response.status === 201) {
        console.log("Customer added successfully");
        resetFormFields();
        Swal.fire({
          icon: "success",
          title: "Customer Added",
          text: "Customer has been added successfully!",
        });
      } else {
        throw new Error("Failed to save customer");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || `Error saving customer: ${error.message}`,
      });
    }
  };

  const resetFormFields = () => {
    console.log("Resetting form fields...");
    setCusId("");
    setCusName("");
    setAddress1("");
    setAddress2("");
    setMobile1("");
    setMobile2("");
    setIdNumber("");
  };

  return (
    <div id="customer-model">
      <div id="customer-form">
        <div id="cusId-group">
          <label htmlFor="cusId">Customer ID</label>
          <input
            type="text"
            id="cusId"
            value={cusId}
            onChange={(e) => setCusId(e.target.value)}
            placeholder="Enter Customer ID"
          />
        </div>

        <div id="cusName-group">
          <label htmlFor="cusName">Customer Name</label>
          <input
            type="text"
            id="cusName"
            value={cusName}
            onChange={(e) => setCusName(e.target.value)}
            placeholder="Enter Customer Name"
          />
        </div>

        <div id="address1-group">
          <label htmlFor="address1">Address 1</label>
          <input
            type="text"
            id="address1"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="Enter Address 1"
          />
        </div>

        <div id="address2-group">
          <label htmlFor="address2">Address 2</label>
          <input
            type="text"
            id="address2"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="Enter Address 2"
          />
        </div>

        <div id="mobile1-group">
          <label htmlFor="mobile1">Mobile 1</label>
          <input
            type="text"
            id="mobile1"
            value={mobile1}
            onChange={(e) => setMobile1(e.target.value)}
            placeholder="Enter Mobile 1"
          />
        </div>

        <div id="mobile2-group">
          <label htmlFor="mobile2">Mobile 2</label>
          <input
            type="text"
            id="mobile2"
            value={mobile2}
            onChange={(e) => setMobile2(e.target.value)}
            placeholder="Enter Mobile 2"
          />
        </div>

        <div id="idNumber-group">
          <label htmlFor="idNumber">ID Number</label>
          <input
            type="text"
            id="idNumber"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="Enter ID Number"
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
