import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../css/AddSupplier.css"; // Assuming a separate CSS file for AddSupplier

export default function AddSupplier({ UserName, store }) {
  const [Supid, setSupid] = useState("");
  const [Supname, setSupname] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [email, setEmail] = useState("");
  const [idno, setIdno] = useState("");
  const [mobile1, setMobile1] = useState("");
  const [mobile2, setMobile2] = useState("");
  const [mobile3, setMobile3] = useState("");
  const [company, setCompany] = useState("");
  const [faxnum, setFaxnum] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("active"); // Default status
  const [saveStoreAsAll, setSaveStoreAsAll] = useState(false); 
  const [bankList, setBankList] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");// Checkbox to manage the store status



  // Fetch the bank list when the component loads
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/get_banks");
        setBankList(response.data);
      } catch (error) {
        console.error("Error fetching banks: ", error);
      }
    };
    fetchBanks();
  }, []);



  // Regex for validating email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Function to validate the form data
  const validateFormData = () => {
    if (Supid.trim() === "" || Supname.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Supplier ID and Supplier Name are required!",
      });
      return false;
    }

    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address!",
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

    return true;
  };

  // Function to check if Supplier ID or Name is already taken
  const checkForDuplicates = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/check_duplicate",
        {
          Supid,
          Supname,
        }
      );
      return response.data.exists; // Returns true if a duplicate exists
    } catch (error) {
      console.error("Error checking for duplicates: ", error);
      return false;
    }
  };

   // Function to save the supplier details
   const handleSave = async () => {
    if (!validateFormData()) return;

    // Check if Supplier ID or Name is duplicate
    const isDuplicate = await checkForDuplicates();
    if (isDuplicate) {
      Swal.fire({
        icon: "error",
        title: "Duplicate Found",
        text: "Supplier ID or Name already exists!",
      });
      return;
    }

    const supplierData = {
      Supid,
      Supname,
      address1,
      address2,
      address3,
      email,
      idno,
      mobile1,
      mobile2,
      mobile3,
      company,
      faxnum,
      website,
      status,
      user: UserName,
      store: saveStoreAsAll ? "all" : store,
      bankName: selectedBank,
      accountNumber,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/create_supplier",
        supplierData
      );

      if (response.status === 201) {
        resetFormFields();

        Swal.fire({
          icon: "success",
          title: "Supplier Added",
          text: "Supplier has been added successfully!",
        });
      } else {
        throw new Error("Failed to save supplier");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error saving supplier: ${error.message}`,
      });
    }
  };

  const resetFormFields = () => {
    setSupid("");
    setSupname("");
    setAddress1("");
    setAddress2("");
    setAddress3("");
    setEmail("");
    setIdno("");
    setMobile1("");
    setMobile2("");
    setMobile3("");
    setCompany("");
    setFaxnum("");
    setWebsite("");
    setStatus("active");
    setSaveStoreAsAll(false);
    setSelectedBank("");
    setAccountNumber("");
  };

  return (
    <div className="supplier-model">
      <div className="check-box">
        <input
          type="checkbox"
          checked={saveStoreAsAll}
          onChange={(e) => setSaveStoreAsAll(e.target.checked)}
        />
        <label>All Store</label>
      </div>
      <div className="supplier-form">
        <div className="form-group">
          <label htmlFor="Supid">Supplier ID</label>
          <input
            type="text"
            id="Supid"
            value={Supid}
            onChange={(e) => setSupid(e.target.value)}
            placeholder="Enter Supplier ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="Supname">Supplier Name</label>
          <input
            type="text"
            id="Supname"
            value={Supname}
            onChange={(e) => setSupname(e.target.value)}
            placeholder="Enter Supplier Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address1">Address 1</label>
          <input
            type="text"
            id="address1"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="Enter Address 1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address2">Address 2</label>
          <input
            type="text"
            id="address2"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="Enter Address 2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address3">Address 3</label>
          <input
            type="text"
            id="address3"
            value={address3}
            onChange={(e) => setAddress3(e.target.value)}
            placeholder="Enter Address 3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="idno">ID Number</label>
          <input
            type="text"
            id="idno"
            value={idno}
            onChange={(e) => setIdno(e.target.value)}
            placeholder="Enter ID Number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobile1">Mobile 1</label>
          <input
            type="text"
            id="mobile1"
            value={mobile1}
            onChange={(e) => setMobile1(e.target.value)}
            placeholder="Enter Mobile 1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobile2">Mobile 2</label>
          <input
            type="text"
            id="mobile2"
            value={mobile2}
            onChange={(e) => setMobile2(e.target.value)}
            placeholder="Enter Mobile 2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobile3">Mobile 3</label>
          <input
            type="text"
            id="mobile3"
            value={mobile3}
            onChange={(e) => setMobile3(e.target.value)}
            placeholder="Enter Mobile 3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter Company Name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="faxnum">Fax Number</label>
          <input
            type="text"
            id="faxnum"
            value={faxnum}
            onChange={(e) => setFaxnum(e.target.value)}
            placeholder="Enter Fax Number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Enter Website"
          />
        </div>

        <div className="form-group">
          <label htmlFor="bank">Bank Name</label>
          <select 
            id="bank"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
          >
            <option value="">Select Bank</option>
            {bankList.map((bank) => (
              <option key={bank.id} value={bank.bankName}>
                {bank.bankName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="accountNumber">Account Number</label>
          <input
            type="text"
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Enter Account Number"
          />
        </div>


        {/* Container to group status radio buttons and checkbox in one row */}
        <div className="status-checkbox-container">
          <div className="status-section">
            <label>
              <input
                type="radio"
                name="status"
                value="active"
                checked={status === "active"}
                onChange={() => setStatus("active")}
              />
              Active
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={status === "inactive"}
                onChange={() => setStatus("inactive")}
              />
              Inactive
            </label>
          </div>
        </div>

        <div className="button-group">
          <button className="saveButton" onClick={handleSave}>Save Supplier</button>
        </div>
      </div>
    </div>
  );
}

// Validate props with PropTypes
AddSupplier.propTypes = {
  UserName: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
