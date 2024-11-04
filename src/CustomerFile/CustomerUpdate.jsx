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
          <label>Customer ID</label>
          <input type="text" name="cusId" value={formData.cusId} readOnly />

          <label>Customer Name</label>
          <input type="text" name="cusName" value={formData.cusName} onChange={handleChange} />

          <label>Address 1</label>
          <input type="text" name="address1" value={formData.address1} onChange={handleChange} />

          <label>Address 2</label>
          <input type="text" name="address2" value={formData.address2} onChange={handleChange} />

          <label>Mobile 1</label>
          <input type="text" name="mobile1" value={formData.mobile1} onChange={handleChange} />

          <label>Mobile 2</label>
          <input type="text" name="mobile2" value={formData.mobile2} onChange={handleChange} />

          <label>ID Number</label>
          <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} />

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
  customer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};
