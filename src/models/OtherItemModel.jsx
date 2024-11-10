import { useState } from 'react';
import ReactDOM from 'react-dom';
import "./OtherItemModel.css";
import PropTypes from "prop-types";
import Swal from 'sweetalert2';

function OtherItemModel({ show, onClose, onAdd }) {
  const [productName, setProductName] = useState('');
  const [productCost, setProductCost] = useState('');
  const [productMRP, setProductMRP] = useState('');
  const [productRate, setProductRate] = useState('');
  const [qty, setQty] = useState('');

  if (!show) return null;

  const isDecimal = (value) => {
    return /^\d+(\.\d{1,2})?$/.test(value); // Matches values with up to 2 decimal places
  };

  const handleAddToList = () => {
    // Validation
    if (!productName) {
      Swal.fire('Error', 'Please enter a product name', 'error');
      return;
    }
    if (!isDecimal(productCost) || productCost <= 0) {
      Swal.fire('Error', 'Please enter a valid cost price with up to 2 decimals', 'error');
      return;
    }
    if (!isDecimal(productMRP) || productMRP <= 0) {
      Swal.fire('Error', 'Please enter a valid MRP price with up to 2 decimals', 'error');
      return;
    }
    if (!isDecimal(productRate) || productRate <= 0) {
      Swal.fire('Error', 'Please enter a valid rate with up to 2 decimals', 'error');
      return;
    }
    if (!isDecimal(qty) || qty <= 0) {
      Swal.fire('Error', 'Please enter a valid quantity with up to 2 decimals', 'error');
      return;
    }

    // Check if rate is not greater than MRP
    if (parseFloat(productRate) > parseFloat(productMRP)) {
      Swal.fire('Error', 'Rate cannot be greater than MRP', 'error');
      return;
    }

    // Calculate discount
    const discount = parseFloat(productMRP) - parseFloat(productRate);

    onAdd({
      productName,
      productCost,
      productMRP,
      productRate,
      qty,
      discount: discount.toFixed(2), // Send the discount value to Invoice component
    });

    // Clear fields and close modal
    setProductName('');
    setProductCost('');
    setProductMRP('');
    setProductRate('');
    setQty('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddToList();
    }
  };

  return ReactDOM.createPortal(
    <div id='modal-overlay-other-item'>
      <div id='modal-content-other-item'>
        <button id='modal-close-button-other-item' onClick={onClose}>×</button>
        <h2>Add New Other Item</h2>
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Product Cost"
          value={productCost}
          onChange={(e) => setProductCost(e.target.value)}
        />
        <input
          type="text"
          placeholder="Product MRP"
          value={productMRP}
          onChange={(e) => setProductMRP(e.target.value)}
        />
        <input
          type="text"
          placeholder="Rate"
          value={productRate}
          onChange={(e) => setProductRate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Quantity"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="add-button" onClick={handleAddToList}>Add to List</button>
      </div>
    </div>,
    document.body
  );
}

// Define prop types for the component
OtherItemModel.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default OtherItemModel;
