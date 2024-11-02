import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import "./OtherItemModel.css";
import Swal from 'sweetalert2';


function OtherItemModel({ show, onClose, onAdd }) {
    const [productName, setProductName] = useState('');
    const [productCost, setProductCost] = useState('');
    const [productSale, setProductSale] = useState('');
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
      if (!isDecimal(productSale) || productSale <= 0) {
        Swal.fire('Error', 'Please enter a valid sale price with up to 2 decimals', 'error');
        return;
      }
      if (!isDecimal(qty) || qty <= 0) {
        Swal.fire('Error', 'Please enter a valid quantity with up to 2 decimals', 'error');
        return;
      }
  
      // Check if sale price is not greater than cost price
      if (parseFloat(productSale) < parseFloat(productCost)) {
        Swal.fire('Error', 'Sale price cannot be greater than cost price', 'error');
        return;
      }
  
      // Calculate discount
      const discount =  parseFloat(productSale) - parseFloat(productCost);
  
      onAdd({
        productName,
        productCost,
        productSale,
        qty,
        discount: discount.toFixed(2) // Send the discount value to Invoice component
      });
  
      // Clear fields and close modal
      setProductName('');
      setProductCost('');
      setProductSale('');
      setQty('');
      onClose();
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
          placeholder="Product Sale"
          value={productSale}
          onChange={(e) => setProductSale(e.target.value)}
        />
        <input
          type="text"
          placeholder="Quantity"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <button className="add-button" onClick={handleAddToList}>Add to List</button>
      </div>
    </div>,
    document.body
  );
}

export default OtherItemModel;
