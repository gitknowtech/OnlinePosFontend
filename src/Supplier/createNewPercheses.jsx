import { useState, useEffect } from "react";
import axios from "axios";
import "../css/CreateNewPercheses.css"; // Assuming a CSS file for styling

export default function CreateNewPercheses() {
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [cashAmount, setCashAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);
  const [grossTotal, setGrossTotal] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch suppliers from API on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/suppliers/get_suppliers");
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

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

      // Update totals
      setGrossTotal((prev) => prev + newPurchase.total);
      setTotalQuantity((prev) => prev + newPurchase.quantity);
      setTotalItems((prev) => prev + 1);

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

  // Handle cash amount change and auto-calculate credit amount
  const handleCashChange = (e) => {
    const cash = parseFloat(e.target.value);
    setCashAmount(cash);
    setCreditAmount(grossTotal - cash);
  };

  return (
    <div id="purchase-panel-purchase" className="create-new-purchases">
      <h2 id="panel-header-purchase">Add New Purchase</h2>
      {/* Form Section */}
      <div id="form-container-purchase">
        <div className="input-group-purhase-supplier">
          <label htmlFor="product-code">Product Code:</label>
          <input
            id="product-code"
            type="text"
            placeholder="Enter Product Code"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
          />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="product-name">Product Name:</label>
          <input
            id="product-name"
            type="text"
            placeholder="Enter Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="unit-price">Unit Price:</label>
          <input
            id="unit-price"
            type="number"
            placeholder="Enter Unit Price"
            value={unitPrice}
            onChange={(e) => {
              setUnitPrice(e.target.value);
              calculateTotal();
            }}
          />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            placeholder="Enter Quantity"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              calculateTotal();
            }}
          />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="total">Total:</label>
          <input
            id="total"
            type="number"
            placeholder="Total Amount"
            value={total}
            readOnly
          />
        </div>
      </div>
      <button id="add-button-purchase" onClick={handleAdd}>Add</button>

      <div id="table-container-purchase">
        <h3>Purchases</h3>
        <table id="purchase-table-purchase">
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
                <td style={{ textAlign: "center" }}>{purchase.productCode}</td>
                <td>{purchase.productName}</td>
                <td style={{ textAlign: "center" }}>{purchase.unitPrice.toFixed(2)}</td>
                <td style={{ textAlign: "center" }}>{purchase.quantity}</td>
                <td style={{ textAlign: "center" }}>{purchase.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div id="summary-container-purchase">
        <div className="input-group-purhase-supplier">
          <label htmlFor="supplier-select">Supplier:</label>
          <select
            id="supplier-select"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.Supid} value={supplier.Supid}>
                {supplier.Supname}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="invoice-id">Invoice ID:</label>
          <input
            id="invoice-id"
            type="text"
            placeholder="Enter Invoice ID"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
          />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="invoice-date">Invoice Date:</label>
          <input
            id="invoice-date"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="cash-amount">Cash Amount:</label>
          <input
            id="cash-amount"
            type="number"
            placeholder="Enter Cash Amount"
            value={cashAmount}
            onChange={handleCashChange}
          />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="credit-amount">Credit Amount:</label>
          <input
            id="credit-amount"
            type="number"
            placeholder="Calculated Credit Amount"
            value={creditAmount}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
