import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css1/SupplierUpdate.css"; // Import the updated CSS

export default function SupplierUpdate({ supplierId, onClose, onUpdate }) {
  const [supplierData, setSupplierData] = useState({
    Supid: "",
    Supname: "",
    address1: "",
    address2: "",
    address3: "",
    email: "",
    idno: "",
    mobile1: "",
    mobile2: "",
    mobile3: "",
    company: "",
    faxnum: "",
    website: "",
    bankName: "",
    accountNumber: "",
  });

  const [bankList, setBankList] = useState([]);

  // Fetch existing supplier data when the modal opens
  useEffect(() => {
    const fetchSupplierData = async () => {
      if (supplierId) {
        try {
          const response = await axios.get(`http://localhost:5000/api/suppliers/get_supplier/${supplierId}`);
          setSupplierData(response.data);
        } catch (error) {
          console.error("Error fetching supplier details:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Could not fetch supplier details.",
          });
        }
      }
    };

    const fetchBanks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/banks/get_banks");
        setBankList(response.data);
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };

    fetchSupplierData();
    fetchBanks();
  }, [supplierId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/suppliers/update_supplier/${supplierId}`, supplierData);
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Supplier details updated successfully!",
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update supplier: ${error.response?.data?.message || error.message}`,
      });
    }
  };

  return (
    <div id="supplier-update-modal">
      <h2>Update Supplier</h2>
      <form onSubmit={handleSubmit}>
        <div id="form-container">
          <div id="form-group-Supid">
            <label htmlFor="Supid">Supplier ID</label>
            <input type="text" id="Supid" name="Supid" value={supplierData.Supid} readOnly />
          </div>

          <div id="form-group-Supname">
            <label htmlFor="Supname">Supplier Name</label>
            <input type="text" id="Supname" name="Supname" value={supplierData.Supname} onChange={handleChange} />
          </div>

          <div id="form-group-address1">
            <label htmlFor="address1">Address 1</label>
            <input type="text" id="address1" name="address1" value={supplierData.address1} onChange={handleChange} />
          </div>

          <div id="form-group-address2">
            <label htmlFor="address2">Address 2</label>
            <input type="text" id="address2" name="address2" value={supplierData.address2} onChange={handleChange} />
          </div>

          <div id="form-group-address3">
            <label htmlFor="address3">Address 3</label>
            <input type="text" id="address3" name="address3" value={supplierData.address3} onChange={handleChange} />
          </div>

          <div id="form-group-mobile1">
            <label htmlFor="mobile1">Mobile 1</label>
            <input type="text" id="mobile1" name="mobile1" value={supplierData.mobile1} onChange={handleChange} />
          </div>

          <div id="form-group-mobile2">
            <label htmlFor="mobile2">Mobile 2</label>
            <input type="text" id="mobile2" name="mobile2" value={supplierData.mobile2} onChange={handleChange} />
          </div>

          <div id="form-group-mobile3">
            <label htmlFor="mobile3">Mobile 3</label>
            <input type="text" id="mobile3" name="mobile3" value={supplierData.mobile3} onChange={handleChange} />
          </div>

          <div id="form-group-email">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={supplierData.email} onChange={handleChange} />
          </div>

          <div id="form-group-website">
            <label htmlFor="website">Website</label>
            <input type="text" id="website" name="website" value={supplierData.website} onChange={handleChange} />
          </div>

          <div id="form-group-idno">
            <label htmlFor="idno">ID Number</label>
            <input type="text" id="idno" name="idno" value={supplierData.idno} onChange={handleChange} />
          </div>

          <div id="form-group-company">
            <label htmlFor="company">Company</label>
            <input type="text" id="company" name="company" value={supplierData.company} onChange={handleChange} />
          </div>

          <div id="form-group-faxnum">
            <label htmlFor="faxnum">Fax Number</label>
            <input type="text" id="faxnum" name="faxnum" value={supplierData.faxnum} onChange={handleChange} />
          </div>

          <div id="form-group-bankName">
            <label htmlFor="bankName">Bank Name</label>
            <select id="bankName" name="bankName" value={supplierData.bankName} onChange={handleChange}>
              <option value="">Select Bank</option>
              {bankList.map((bank) => (
                <option key={bank.id} value={bank.bankName}>
                  {bank.bankName}
                </option>
              ))}
            </select>
          </div>

          <div id="form-group-accountNumber">
            <label htmlFor="accountNumber">Account Number</label>
            <input type="text" id="accountNumber" name="accountNumber" value={supplierData.accountNumber} onChange={handleChange} />
          </div>
        </div>

        <div id="button-group">
          
          <button type="button" onClick={onClose} id="cancelButton">Cancel</button>
          <button type="submit" id="saveButton">Update</button>
        </div>
      </form>
    </div>
  );
}

SupplierUpdate.propTypes = {
  supplierId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
