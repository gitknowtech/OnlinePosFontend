import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import "./Returnmodel.css";
import PropTypes from "prop-types";
import Swal from 'sweetalert2';
import axios from 'axios';

function ReturnModel({ show, onClose, onAdd }) {
  const [productName, setProductName] = useState('');
  const [productCost, setProductCost] = useState('');
  const [productSale, setProductSale] = useState('');
  const [productMRP, setProductMRP] = useState(''); // Keep MRP constant for reference
  const [qty, setQty] = useState('');
  const [barcode, setBarcode] = useState('');
  const barcodeInputRef = useRef(null);

  if (!show) return null;

  const isDecimal = (value) => {
    return /^\d+(\.\d{1,2})?$/.test(value); // Matches values with up to 2 decimal places
  };

  const handleBarcodeChange = async (e) => {
    const input = e.target.value;
    setBarcode(input);

    if (input.length > 1) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/search?query=${input}`
        );
        if (response.data.length > 0) {
          const product = response.data[0];
          setProductName(product.productName);
          setProductCost(parseFloat(product.costPrice).toFixed(2));
          setProductSale(parseFloat(product.mrpPrice).toFixed(2));
          setProductMRP(parseFloat(product.mrpPrice).toFixed(2)); // Set initial MRP value
        } else {
          Swal.fire("Not Found", "Product with this barcode does not exist", "warning");
          clearProductDetails();
        }
      } catch {
        Swal.fire("Error", "Failed to fetch product details", "error");
        clearProductDetails();
      }
    } else {
      clearProductDetails();
    }
  };

  const clearProductDetails = () => {
    setProductName('');
    setProductCost('');
    setProductSale('');
    setProductMRP('');
  };


  const handleKeyDown = (e) => {
    if(e.key === 'Enter'){
      handleAddToList();
    }
  }


  const handleAddToList = () => {
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
  
    // Calculate the discount based on the original MRP
    const discount = parseFloat(productMRP) - parseFloat(productSale);
    const negativeQty = -Math.abs(parseFloat(qty));
    const negativeAmount = -Math.abs(parseFloat(productSale) * negativeQty);
  
    onAdd({
      productName,
      productCost: (-Math.abs(productCost)).toFixed(2),
      productSale: (-Math.abs(productSale)).toFixed(2),
      qty: negativeQty.toFixed(2),
      discount: (-Math.abs(discount)).toFixed(2),
      amount: negativeAmount.toFixed(2),
      mrp: parseFloat(productMRP).toFixed(2), // Ensure MRP remains unchanged
    });
  
    clearInputs();
    onClose();
  };
  
  

  const clearInputs = () => {
    setProductName('');
    setProductCost('');
    setProductSale('');
    setProductMRP('');
    setQty('');
    setBarcode('');
  };

  return ReactDOM.createPortal(
    <div id='modal-overlay-return-item'>
      <div id='modal-content-return-item'>
        <button id='modal-close-button-return-item' onClick={onClose}>×</button>
        <h2>Return Item</h2>
        <input
          type="text"
          placeholder="Enter Product ID/Name/Barcode"
          value={barcode}
          onChange={handleBarcodeChange}
          ref={barcodeInputRef}
        />
        <input
          type="text"
          placeholder="Product Name"
          value={productName}
          readOnly
        />
        <input
          type="text"
          placeholder="Product Cost"
          value={productCost}
          readOnly
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
          onKeyDown={handleKeyDown}
        />
        <button className="add-button-return-item" onClick={handleAddToList}>Add to Return</button>
      </div>
    </div>,
    document.body
  );
}

// Define prop types for the component
ReturnModel.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default ReturnModel;
