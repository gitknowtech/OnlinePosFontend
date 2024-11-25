import { useEffect, useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import PropTypes from "prop-types";

const InvoiceEditModel = ({ isOpen, onClose, invoiceId, onUpdate }) => {
  const [sales, setSales] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch invoice details when modal opens
  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/fetch_invoice_details/${invoiceId}`);
      setSales(response.data.sales);
      setInvoiceItems(response.data.invoiceItems);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching invoice details:", err);
      setError("Failed to load invoice details");
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index][field] = value;
    setInvoiceItems(updatedItems);
  };

  const handleSalesChange = (field, value) => {
    setSales({ ...sales, [field]: value });
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        sales,
        invoiceItems,
      };
      await axios.put(`/api/invoices/update/${invoiceId}`, payload);
      onUpdate(); // Trigger a refresh or callback in the parent component
      onClose();
    } catch (err) {
      console.error("Error updating invoice:", err);
      setError("Failed to update invoice");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} ariaHideApp={false}>
      <h2>Edit Invoice Details</h2>

      {/* Sales Details */}
      {sales && (
        <div>
          <h3>Other Details</h3>
          <div>
            <label>Customer:</label>
            <input
              type="text"
              value={sales.CustomerId || ""}
              onChange={(e) => handleSalesChange("CustomerId", e.target.value)}
            />
          </div>
          <div>
            <label>Cash Payment:</label>
            <input
              type="number"
              value={sales.CashPay || ""}
              onChange={(e) => handleSalesChange("CashPay", e.target.value)}
            />
          </div>
          <div>
            <label>Card Payment:</label>
            <input
              type="number"
              value={sales.CardPay || ""}
              onChange={(e) => handleSalesChange("CardPay", e.target.value)}
            />
          </div>
          <div>
            <label>Discount:</label>
            <input
              type="number"
              value={sales.discountAmount || ""}
              onChange={(e) => handleSalesChange("discountAmount", e.target.value)}
            />
          </div>
          <div>
            <label>Sale Time:</label>
            <input
              type="datetime-local"
              value={new Date(sales.createdAt).toISOString().slice(0, -1)}
              onChange={(e) => handleSalesChange("createdAt", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Invoice Items */}
      <h3>Item Details</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Cost</th>
            <th>MRP</th>
            <th>Sale</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoiceItems.map((item, index) => (
            <tr key={item.id}>
              <td>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.cost || ""}
                  onChange={(e) =>
                    handleItemChange(index, "cost", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.mrp || ""}
                  onChange={(e) =>
                    handleItemChange(index, "mrp", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.rate || ""}
                  onChange={(e) =>
                    handleItemChange(index, "rate", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.totalAmount || ""}
                  onChange={(e) =>
                    handleItemChange(index, "totalAmount", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Actions */}
      <button onClick={handleUpdate}>Update Invoice</button>
      <button onClick={onClose}>Cancel</button>
    </Modal>
  );
};

InvoiceEditModel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  invoiceId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default InvoiceEditModel;
