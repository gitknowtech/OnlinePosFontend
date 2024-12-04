import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../css2/bill.css"; // Ensure this CSS contains styles for 80mm layout

const Bill = ({ invoiceId, onPrintComplete }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch invoice data from the backend using invoiceId
    const fetchInvoiceData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/invoices/fetchInvoiceData?invoiceId=${invoiceId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch invoice data");
        }

        const data = await response.json();
        setInvoiceData(data);
        setLoading(false);

        // Trigger print after data is loaded
        setTimeout(() => printReceipt(data), 500);
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [invoiceId]);

  const printReceipt = (data) => {
    const printContent = document.getElementById("printable-receipt");
    const printWindow = window.open("", "_blank", "width=300,height=600");
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              width: 80mm;
              margin: 0;
              padding: 0;
            }
            .receipt-container {
              width: 80mm;
              margin: auto;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
            }
            .divider {
              text-align: center;
              margin: 5px 0;
              font-size: 10px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
            }
            .item-row span {
              font-size: 12px;
            }
            .totals-section, .footer {
              text-align: center;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    if (onPrintComplete) {
      onPrintComplete();
    }
  };

  if (loading) {
    return <p>Loading receipt...</p>;
  }

  if (!invoiceData) {
    return <p>Error loading receipt data.</p>;
  }

  const { company, sales, invoices } = invoiceData;

  return (
    <div id="printable-receipt" className="receipt-container">
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
  onPrintComplete: PropTypes.func.isRequired,
};

export default Bill;
