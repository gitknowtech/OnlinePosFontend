// src/components/PurchasingDetails.jsx

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../css/CreateNewPercheses.css"; // Assuming a CSS file for styling

export default function PurchasingDetails() {
  // State variables
  const [searchInvoiceId, setSearchInvoiceId] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [supplierName, setSupplierName] = useState(""); // State for supplier name
  const [invoiceDate, setInvoiceDate] = useState("");
  const [cashAmount, setCashAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);
  const [grossTotal, setGrossTotal] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [documentLink, setDocumentLink] = useState(""); // New state variable for document link

  // Base URL for the backend
  const BASE_URL = "http://localhost:5000/api/purchases";
  const BACKEND_URL = "http://localhost:5000"; // Base URL of the backend server

  // Handle search
  const handleSearch = async () => {
    if (!searchInvoiceId) {
      Swal.fire("Warning", "Please enter an Invoice ID to search.", "warning");
      return;
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/get_purchase/${searchInvoiceId}`
      );
      const data = response.data;

      if (!data || !data.purchases || data.purchases.length === 0) {
        Swal.fire("Info", "No data found for the given Invoice ID.", "info");
        return;
      }

      // Map purchases data to the expected format
      const mappedPurchases = data.purchases.map((purchase) => ({
        id: purchase.id,
        productCode:
          purchase.ProCode || purchase.ProductCode || "", // Adjust based on your backend field name
        productName: purchase.ProName || "",
        unitPrice: parseFloat(purchase.UnitPrice) || 0,
        quantity: parseFloat(purchase.Quantity) || 0,
        total: parseFloat(purchase.Total) || 0,
      }));

      setPurchases(mappedPurchases);

      // Map summary data to expected format
      const summary = data.summary;

      setGrossTotal(parseFloat(summary.gross_total) || 0);
      setTotalQuantity(parseFloat(summary.total_quantity) || 0);
      setTotalItems(summary.total_items || 0);
      setInvoiceDate(
        summary.invoice_date ? summary.invoice_date.split("T")[0] : ""
      );
      setCashAmount(parseFloat(summary.cash_amount) || 0);
      setCreditAmount(parseFloat(summary.credit_amount) || 0);
      setSupplierName(summary.SupplierName || ""); // Set supplier name directly

      // Adjust the document link to include the backend server's base URL
      const adjustedDocumentLink = summary.document_link
        ? `${BACKEND_URL}${summary.document_link}`
        : "";
      setDocumentLink(adjustedDocumentLink); // Set document link

      // Log the adjusted document link for debugging
      console.log("Adjusted Document Link:", adjustedDocumentLink);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Failed to fetch data.", "error");
    }
  };

  return (
    <div id="purchase-panel-purchase" className="create-new-purchases">
      <h2 id="panel-header-purchase">Search Purchase by Invoice ID</h2>

      {/* Search Section */}
      <div id="search-container">
        <input
          type="text"
          placeholder="Enter Invoice ID"
          value={searchInvoiceId}
          onChange={(e) => setSearchInvoiceId(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

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
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
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
          <label htmlFor="supplier-name">Supplier:</label>
          <input id="supplier-name" type="text" value={supplierName} readOnly />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="invoice-date">Invoice Date:</label>
          <input id="invoice-date" type="date" value={invoiceDate} readOnly />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="cash-amount">Cash Amount:</label>
          <input id="cash-amount" type="number" value={cashAmount} readOnly />
        </div>

        <div className="input-group-purhase-supplier">
          <label htmlFor="credit-amount">Credit Amount:</label>
          <input id="credit-amount" type="number" value={creditAmount} readOnly />
        </div>
      </div>

      {/* View Document Link */}
      {documentLink && (
        <div id="document-link-section">
          <button onClick={() => window.open(documentLink, "_blank")}>
            View Document
          </button>
        </div>
      )}
    </div>
  );
}
