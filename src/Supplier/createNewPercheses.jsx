// src/components/CreateNewPurchases.jsx

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../css/CreateNewPercheses.css"; // Assuming a CSS file for styling
import PropTypes from "prop-types";

export default function CreateNewPurchases({ store }) {
  // State variables
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
  const [documentFiles, setDocumentFiles] = useState([]); // State for document files
  const [documentLink, setDocumentLink] = useState(""); // State for document link
  const [generatedId, setGeneratedId] = useState(""); // State to store generated ID
  const fileInputRef = useRef(null); // Reference for the file input

  // Base URL for the backend
  const BASE_URL = "http://154.26.129.243:5000/api/purchases";

  // Fetch suppliers from API on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://154.26.129.243:5000/api/suppliers/get_suppliers"
        );
        setSuppliers(response.data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        Swal.fire("Error", "Error fetching suppliers.", "error");
      }
    };
    fetchSuppliers();
  }, []);

  // Calculate total whenever quantity or unit price changes
  useEffect(() => {
    const price = parseFloat(unitPrice);
    const qty = parseFloat(quantity);
    if (!isNaN(price) && !isNaN(qty)) {
      setTotal(parseFloat((price * qty).toFixed(2))); // Set total with 2 decimal places
    } else {
      setTotal(0);
    }
  }, [unitPrice, quantity]);

  // Handle adding product data to the table
  const handleAdd = () => {
    if (productCode && productName && unitPrice && quantity) {
      const newPurchase = {
        id: Date.now(), // Unique identifier for the purchase
        productCode,
        productName,
        unitPrice: parseFloat(unitPrice),
        quantity: parseFloat(quantity),
        total: parseFloat(
          (parseFloat(unitPrice) * parseFloat(quantity)).toFixed(2)
        ),
      };
      setPurchases([...purchases, newPurchase]);

      // Update totals based on the new purchase
      setGrossTotal((prev) =>
        parseFloat((prev + newPurchase.total).toFixed(2))
      );
      setTotalQuantity((prev) =>
        parseFloat((prev + newPurchase.quantity).toFixed(4))
      );
      setTotalItems((prev) => prev + 1);

      // Clear input fields
      setProductCode("");
      setProductName("");
      setUnitPrice("");
      setQuantity("");
      setTotal(0);
    } else {
      Swal.fire(
        "Warning",
        "Please fill in all fields before adding.",
        "warning"
      );
    }
  };

  // Handle deleting a purchase item
  const handleDelete = (index) => {
    const itemToDelete = purchases[index];
    setGrossTotal((prev) =>
      parseFloat((prev - itemToDelete.total).toFixed(2))
    );
    setTotalQuantity((prev) =>
      parseFloat((prev - itemToDelete.quantity).toFixed(4))
    );
    setTotalItems((prev) => prev - 1);

    setPurchases(purchases.filter((_, i) => i !== index));
  };

  // Handle document file selection
  const handleDocumentChange = (e) => {
    setDocumentFiles(Array.from(e.target.files)); // Convert FileList to Array
  };

  // Upload documents to backend
  const handleUploadDocument = async () => {
    if (documentFiles.length === 0) {
      Swal.fire(
        "Warning",
        "Please choose at least one document to upload.",
        "warning"
      );
      return;
    }

    const formData = new FormData();
    documentFiles.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      const response = await axios.post(
        `${BASE_URL}/upload_document`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      Swal.fire(
        "Success",
        "Documents uploaded and combined into PDF successfully!",
        "success"
      );

      // Save the document link
      setDocumentLink(response.data.fileLink);
      setDocumentFiles([]); // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      Swal.fire("Error", "Failed to upload documents.", "error");
    }
  };

  // Handle cash amount change and auto-calculate credit amount
  const handleCashChange = (e) => {
    const cash = parseFloat(e.target.value);
    if (isNaN(cash)) {
      setCashAmount(0);
      setCreditAmount(parseFloat(grossTotal.toFixed(2)));
    } else {
      setCashAmount(cash);
      setCreditAmount(parseFloat((grossTotal - cash).toFixed(2)));
    }
  };

  // Handle saving purchases
  const handleSave = async () => {
    console.log("Store in frontend:", store);

    if (!invoiceId || !invoiceDate || !selectedSupplier) {
      Swal.fire(
        "Warning",
        "Please complete the Invoice ID, Date, and select a Supplier.",
        "warning"
      );
      return;
    }

    if (purchases.length === 0) {
      Swal.fire(
        "Warning",
        "Please add at least one purchase item.",
        "warning"
      );
      return;
    }

    if (!documentLink) {
      Swal.fire(
        "Warning",
        "Please upload the document before saving.",
        "warning"
      );
      return;
    }

    const saveData = {
      purchases: purchases.map((purchase) => ({
        InvoiceId: invoiceId,
        ProCode: purchase.productCode,
        ProName: purchase.productName,
        UnitPrice: purchase.unitPrice,
        Quantity: purchase.quantity,
        Total: purchase.total,
        Supplier: selectedSupplier,
      })),
      summary: {
        grossTotal,
        totalQuantity,
        totalItems,
        cashAmount,
        creditAmount,
        invoiceDate,
        documentLink,
        store, // Include the store here
      },
    };

    try {
      const response = await axios.post(
        `${BASE_URL}/save_Purchase_Supplier`,
        saveData
      );
      Swal.fire(
        "Success",
        `Data saved successfully! Generated ID: ${response.data.generatedid}`,
        "success"
      );

      setGeneratedId(response.data.generatedid); // Optionally display or use the generated ID

      // Clear purchases after saving
      setPurchases([]);
      setGrossTotal(0);
      setTotalQuantity(0);
      setTotalItems(0);
      setInvoiceId("");
      setInvoiceDate("");
      setCashAmount(0);
      setCreditAmount(0);
      setSelectedSupplier("");
      setDocumentLink("");
      // Reset the file input field
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire("Error", "Failed to save data.", "error");
    }
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
            autoComplete="off"
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
            autoComplete="off"
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
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            placeholder="Enter Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
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
      <button id="add-button-purchase" onClick={handleAdd}>
        Add
      </button>

      {/* Table Section */}
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) => (
              <tr key={purchase.id}>
                <td>{purchase.productCode}</td>
                <td>{purchase.productName}</td>
                <td style={{ textAlign: "center" }}>
                  {purchase.unitPrice.toFixed(2)}
                </td>
                <td style={{ textAlign: "center" }}>
                  {purchase.quantity.toFixed(4)}
                </td>
                <td style={{ textAlign: "center" }}>
                  {purchase.total.toFixed(2)}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    id="delete-button-perchase-table"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div id="totals-container-purchase">
        <div className="totals-label">
          <label>Gross Total:</label>
          <span>{grossTotal.toFixed(2)}</span>
        </div>
        <div className="totals-label">
          <label>Total Quantity:</label>
          <span>{totalQuantity.toFixed(4)}</span>
        </div>
        <div className="totals-label">
          <label>Total Items:</label>
          <span>{totalItems}</span>
        </div>
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
            autoComplete="off"
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
      <button id="save-button-purchase" onClick={handleSave}>
        Save
      </button>

      {/* Document Upload Section */}
      <div
        id="document-upload-section"
        className="input-group-purhase-supplier"
      >
        <label htmlFor="document-upload">Upload Documents:</label>
        <input
          id="document-upload"
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleDocumentChange}
          ref={fileInputRef}
        />
        <button onClick={handleUploadDocument}>Upload Documents</button>
        {documentLink && (
          <a
            href={documentLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: "10px" }}
          >
            View Uploaded Document
          </a>
        )}
      </div>

      {/* Display Generated ID if available */}
      {generatedId && (
        <div className="generated-id">
          <strong>Generated ID:</strong> {generatedId}
        </div>
      )}
    </div>
  );
}

CreateNewPurchases.propTypes = {
  store: PropTypes.string.isRequired,
};
