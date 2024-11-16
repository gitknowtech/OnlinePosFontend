import PropTypes from "prop-types";
import { useState } from "react";
import "../css1/CustomerUpdateModel.css";

export default function CustomerUpdate({ customer, onClose, onUpdate }) {
  const [formData, setFormData] = useState({ ...customer });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div id="modal-overlay-customer-model-update">
      <div id="modal-content-customer-model-update">
        <button id="modal-close-button-customer-model-update" onClick={onClose}>
          &times;
        </button>
        <h2>Update Customer</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="cusId">Customer ID</label>
          <input type="text" id="cusId" name="cusId" value={formData.cusId} readOnly />

          <label htmlFor="cusName">Customer Name</label>
          <input type="text" id="cusName" name="cusName" value={formData.cusName} onChange={handleChange} />

          <label htmlFor="address1">Address 1</label>
          <input type="text" id="address1" name="address1" value={formData.address1} onChange={handleChange} />

          <label htmlFor="address2">Address 2</label>
          <input type="text" id="address2" name="address2" value={formData.address2} onChange={handleChange} />

          <label htmlFor="mobile1">Mobile 1</label>
          <input type="text" id="mobile1" name="mobile1" value={formData.mobile1} onChange={handleChange} />

          <label htmlFor="mobile2">Mobile 2</label>
          <input type="text" id="mobile2" name="mobile2" value={formData.mobile2} onChange={handleChange} />

          <label htmlFor="idNumber">ID Number</label>
          <input type="text" id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleChange} />

          <label htmlFor="creditLimit">Credit Limit</label>
          <input
            type="text"
            id="creditLimit"
            name="creditLimit"
            value={formData.creditLimit || ""}
            onChange={handleChange}
            placeholder="Enter Credit Limit"
          />

          <div id="modal-actions-customer-model-update">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}

CustomerUpdate.propTypes = {
  customer: PropTypes.shape({
    cusId: PropTypes.string.isRequired,
    cusName: PropTypes.string.isRequired,
    address1: PropTypes.string,
    address2: PropTypes.string,
    mobile1: PropTypes.string.isRequired,
    mobile2: PropTypes.string,
    idNumber: PropTypes.string,
    creditLimit: PropTypes.string, // Add creditLimit as a string or number
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
