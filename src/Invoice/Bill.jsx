import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../css2/bill.css";

const Bill = ({ invoiceId, onDataLoaded }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await fetch(
          `http://154.26.129.243:5000/api/invoices/fetchInvoiceData?invoiceId=${invoiceId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch invoice data");
        }

        const data = await response.json();
        setInvoiceData(data);
        setLoading(false);
        if (onDataLoaded) {
          onDataLoaded();
        }
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [invoiceId, onDataLoaded]);

  if (loading) {
    return <p>Loading receipt...</p>;
  }

  if (!invoiceData) {
    return <p>Error loading receipt data.</p>;
  }

  const { company, sales, invoices } = invoiceData;

  return (
    <div id="printable-receipt" className="receipt-container" >
      {/* Header Section */}
      <div className="receipt-header">
        <h2 className="store-name">{company.Comname || "Store Name"}</h2>
        <p className="store-details">
          {company.Location || "Store Address"}
          <br />
          Phone: {company.Mobile || "123-456-7890"}
        </p>
        <p className="receipt-date">{sales.createdAt}</p>
      </div>

      <div className="divider">-----------------------------------</div>

      {/* Invoice Info */}
      <div className="invoice-info">
        <p>Invoice #: {sales.invoiceId}</p>
        <p>Customer: {sales.CustomerId}</p>
        <p>Cashier: {sales.UserName}</p>
      </div>

      <div className="divider">-----------------------------------</div>

      {/* Items Section */}
      <div className="items-section">
        {invoices.map((item, index) => (
          <div className="item-row" key={index}>
            <span>{item.name}</span>
            <span>{item.quantity}</span>
            <span>{parseFloat(item.rate).toFixed(2)}</span>
            <span>{parseFloat(item.totalAmount).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="divider">-----------------------------------</div>

      {/* Totals Section */}
      <div className="totals-section">
        <p>Gross Total: {parseFloat(sales.GrossTotal).toFixed(2)}</p>
        <p>Discount: -{parseFloat(sales.discountAmount).toFixed(2)}</p>
        <p><strong>Net Amount: {parseFloat(sales.netAmount).toFixed(2)}</strong></p>
        <p>Payment: {parseFloat(sales.CashPay + sales.CardPay).toFixed(2)}</p>
        <p>Balance: {parseFloat(sales.Balance).toFixed(2)}</p>
        <p>Payment Type: {sales.PaymentType}</p>
      </div>

      <div className="divider">-----------------------------------</div>

      {/* Footer Section */}
      <div className="footer">
        <p>Thank you for shopping with us!</p>
        <p>Visit again!</p>
      </div>
    </div>
  );
};

Bill.propTypes = {
  invoiceId: PropTypes.string.isRequired,
  onDataLoaded: PropTypes.func.isRequired,
};

export default Bill;
