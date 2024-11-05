import { useState } from "react";
import "../css/CreateNewPercheses.css"; // Assuming a CSS file for styling

export default function CreateNewPercheses() {
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(0);
  const [purchases, setPurchases] = useState([]);

  // Calculate total when quantity or unit price changes
  const calculateTotal = () => {
    const price = parseFloat(unitPrice);
    const qty = parseInt(quantity, 10);
    if (!isNaN(price) && !isNaN(qty)) {
      setTotal(price * qty);
    } else {
      setTotal(0);
    }
  };

  // Handle adding product data to the table
  const handleAdd = () => {
    if (productCode && productName && unitPrice && quantity) {
      const newPurchase = {
        productCode,
        productName,
        unitPrice: parseFloat(unitPrice),
        quantity: parseInt(quantity, 10),
        total: parseFloat(unitPrice) * parseInt(quantity, 10),
      };
      setPurchases([...purchases, newPurchase]);

      // Clear input fields
      setProductCode("");
      setProductName("");
      setUnitPrice("");
      setQuantity("");
      setTotal(0);
    } else {
      alert("Please fill in all fields before adding.");
    }
  };

  return (
    <div id="purchase-panel" className="create-new-purchases">
      <h2 id="panel-header" style={{marginTop:"50px"}}>Add New Purchase</h2>
      <div id="form-container">
        <input
          id="product-code"
          type="text"
          placeholder="Product Code"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
        />
        <input
          id="product-name"
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <input
          id="unit-price"
          type="number"
          placeholder="Unit Price"
          value={unitPrice}
          onChange={(e) => {
            setUnitPrice(e.target.value);
            calculateTotal();
          }}
        />
        <input
          id="quantity"
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => {
            setQuantity(e.target.value);
            calculateTotal();
          }}
        />
        <input
          id="total"
          type="number"
          placeholder="Total"
          value={total}
          readOnly
        />
      </div>
      <button id="add-button" onClick={handleAdd}>Add</button>
      <div id="table-container">
        <h3>Purchases</h3>
        <table id="purchase-table">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) => (
              <tr key={index}>
                <td>{purchase.productCode}</td>
                <td>{purchase.productName}</td>
                <td>{purchase.unitPrice.toFixed(2)}</td>
                <td>{purchase.quantity}</td>
                <td>{purchase.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
