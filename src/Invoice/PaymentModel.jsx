// PaymentModel.jsx

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import "../css1/payment.css";

import cashImage from "../assets/icons/cash.png";
import cardImage from "../assets/icons/card.png";
import customerPaymentImage from "../assets/icons/customerPayment.png";
import discountPercentageImage from "../assets/icons/discountPer.png";
import discountPriceImage from "../assets/icons/discounts.png";
import paymentTypeImage from "../assets/icons/paymentType.png";
import netAmountImage from "../assets/icons/netAmount.png";

export default function PaymentModel({
  show,
  onClose,
  totalAmount,
  clearInvoiceTable,
  tableData,
  user,
  store,
}) {
  const [customerMobile, setCustomerMobile] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [discountPercent, setDiscountPercent] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [cashPayment, setCashPayment] = useState(""); // Initialized to ""
  const [cardPayment, setCardPayment] = useState(""); // Initialized to ""
  const [netAmount, setNetAmount] = useState(totalAmount);
  const [balance, setBalance] = useState(totalAmount);
  const [paymentType, setPaymentType] = useState("Credit Payment");
  const [invoiceId, setInvoiceId] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null); // State to store fetched invoice data
  const [isPrinting, setIsPrinting] = useState(false); // Flag to prevent multiple prints

  const printIframeRef = useRef(null); // Reference to the iframe

  // Reset values when modal loads
  useEffect(() => {
    if (show) {
      resetAllFields();
    }

    // Cleanup on unmount or when show changes
    return () => {
      clearTimeout(debounceTimeoutRef.current);
      if (printIframeRef.current) {
        document.body.removeChild(printIframeRef.current);
        printIframeRef.current = null;
      }
    };
  }, [show, totalAmount]);

  // Handle Customer Mobile Input Change with Debounce
  const debounceTimeoutRef = useRef(null);

  const handleCustomerMobileChange = (e) => {
    const input = e.target.value;
    setCustomerMobile(input);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (input.length >= 3) {
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/customer/customers?mobile=${input}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch customer suggestions");
          }
          const data = await response.json();
          setSuggestions(data);
        } catch (error) {
          Swal.fire("Error", "Failed to fetch customer suggestions", "error");
          console.error("Error fetching customer suggestions:", error);
        }
      }, 300); // Debounce delay of 300ms
    } else {
      setSuggestions([]);
    }
  };

  // Handle Customer Suggestion Click
  const handleSuggestionClick = (customer) => {
    setCustomerMobile(customer.cusId);
    setSuggestions([]);
  };

  // Handle Back to Edit
  const handleBackToEdit = () => {
    resetAllFields();
    onClose();
  };

  // Handle Close Bill
  const handleCloseBill = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will clear the bill and reset all fields!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, close it!",
    }).then((result) => {
      if (result.isConfirmed) {
        resetAllFields();
        clearInvoiceTable(); // Clear data from the invoice table in the parent
        onClose();
      }
    });
  };

  // Reset All Fields
  const resetAllFields = () => {
    setCustomerMobile("");
    setSuggestions([]);
    setDiscountPercent("0");
    setDiscountAmount("0");
    setCashPayment(""); // Set to ""
    setCardPayment(""); // Set to ""
    setNetAmount(totalAmount);
    setBalance(totalAmount);
    setPaymentType(totalAmount < 0 ? "Return Payment" : "Credit Payment");
    setInvoiceId(null);
    setInvoiceData(null);
    setIsPrinting(false);
  };

  // Calculate Net Amount based on Discount
  const calculateNetAmount = (discountValue) => {
    const net = totalAmount - discountValue;
    setNetAmount(net.toFixed(2));

    if (net < 0) {
      setCashPayment("");
      setCardPayment("");
      setPaymentType("Return Payment");
    } else {
      setBalance(net.toFixed(2));
      setPaymentType("Credit Payment");
    }

    updatePaymentTypeForZeroValues(net, cashPayment, cardPayment);
  };

  // Update Payment Type if All Values are Zero
  const updatePaymentTypeForZeroValues = (net = netAmount, cash = cashPayment, card = cardPayment) => {
    if (
      parseFloat(net) === 0 &&
      parseFloat(cash) === 0 &&
      parseFloat(card) === 0
    ) {
      setPaymentType("Cash Payment");
    }
  };

  // Handle Cash Payment Change
  const handleCashPaymentChange = (e) => {
    const inputValue = e.target.value;
    if (!/^\d*\.?\d*$/.test(inputValue)) return;

    const cash = parseFloat(inputValue) || 0;
    const net = parseFloat(netAmount) || 0;

    setCashPayment(inputValue);
    const balanceAmount = cash - net;
    setBalance(balanceAmount.toFixed(2));

    if (cash >= net) {
      setPaymentType("Cash Payment");
    } else {
      setPaymentType("Credit Payment");
    }

    updatePaymentTypeForZeroValues(net, cash, cardPayment);
  };

  // Handle Card Payment Change
  const handleCardPaymentChange = (e) => {
    const inputValue = e.target.value;
    if (!/^\d*\.?\d*$/.test(inputValue)) return;

    const card = parseFloat(inputValue) || 0;
    const cash = parseFloat(cashPayment) || 0;
    const net = parseFloat(netAmount) || 0;

    setCardPayment(inputValue);

    const balanceAmount = cash + card - net;
    setBalance(balanceAmount.toFixed(2));

    if (cash + card >= net) {
      if (cash > 0 && card > 0) {
        setPaymentType("Cash and Card Payment");
      } else if (cash > 0) {
        setPaymentType("Cash Payment");
      } else if (card > 0) {
        setPaymentType("Card Payment");
      }
    } else {
      setPaymentType("Credit Payment");
    }

    updatePaymentTypeForZeroValues(net, cash, card);
  };

  // Handle Complete Payment
  const handlePayment = async () => {
    // Basic validation can be added here if needed

    const paymentData = {
      GrossTotal: parseFloat(totalAmount) || 0,
      CustomerId: customerMobile || "Unknown",
      discountPercent: parseFloat(discountPercent) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      netAmount: parseFloat(netAmount) || 0,
      CashPay: parseFloat(cashPayment) || 0,
      CardPay: parseFloat(cardPayment) || 0,
      PaymentType: paymentType || "Cash Payment",
      Balance: parseFloat(balance) || 0,
      invoiceItems: tableData.map((item) => ({
        productId: item.productId || "Unknown",
        name: item.name || "Unnamed Product",
        cost: parseFloat(item.cost) || 0,
        mrp: parseFloat(item.mrp) || 0,
        discount: parseFloat(item.discount) || 0,
        rate: parseFloat(item.rate) || 0,
        quantity: parseFloat(item.quantity) || 0,
        amount: parseFloat(item.amount) || 0,
        barcode: item.barcode || null,
      })),
      user,
      store,
    };

    try {
      // Save invoice data
      const saveResponse = await fetch("http://localhost:5000/api/invoices/add_sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        Swal.fire("Error", `Failed to save payment: ${error.message}`, "error");
        return;
      }

      console.log("Payment saved successfully.");

      // Fetch the latest saved invoice
      const fetchResponse = await fetch("http://localhost:5000/api/invoices/last");
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch the last invoice");
      }

      const lastInvoice = await fetchResponse.json();
      console.log("Last Invoice fetched:", lastInvoice);

      if (!Array.isArray(lastInvoice) || lastInvoice.length === 0) {
        Swal.fire("Error", "No invoice data found!", "error");
        return;
      }

      const latestInvoiceId = lastInvoice[0].invoiceId;
      setInvoiceId(latestInvoiceId);

      // Fetch the invoice data
      const invoiceDataResponse = await fetch(
        `http://localhost:5000/api/invoices/fetchInvoiceData?invoiceId=${latestInvoiceId}`
      );
      if (!invoiceDataResponse.ok) {
        throw new Error("Failed to fetch invoice data");
      }

      const fetchedInvoiceData = await invoiceDataResponse.json();
      console.log("Fetched Invoice Data:", fetchedInvoiceData);

      setInvoiceData(fetchedInvoiceData);

      // Show success message and wait for user to click OK
      Swal.fire("Success", "Invoice saved successfully!", "success").then(
        (result) => {
          if (result.isConfirmed && !isPrinting) {
            setIsPrinting(true);
            handlePrintInvoice(fetchedInvoiceData);
          }
        }
      );
    } catch (error) {
      console.error("Error processing payment:", error);
      Swal.fire(
        "Error",
        "An unexpected error occurred while processing payment.",
        "error"
      );
    }
  };



  // Handle Print Invoice via iframe
  const handlePrintInvoice = (invoiceDataToPrint) => {
    if (!invoiceDataToPrint) {
      Swal.fire("Error", "Invoice data is not available for printing.", "error");
      return;
    }

    console.log("Printing Invoice:", invoiceDataToPrint);

    // Create a hidden iframe for printing
    let printIframe = printIframeRef.current;
    if (!printIframe) {
      printIframe = document.createElement("iframe");
      printIframeRef.current = printIframe;
      printIframe.style.position = "absolute";
      printIframe.style.width = "0";
      printIframe.style.height = "0";
      printIframe.style.border = "none";
      document.body.appendChild(printIframe);
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          <style>
      @page {
        size: 80mm auto; /* Set paper size to 80mm width */
        margin: 0;
      }
      body {
        font-family: Arial, sans-serif;
        padding: 10px;
        width: 302px; /* 80mm width in pixels at 96 DPI */
        box-sizing: border-box;
      }
      /* Wrapper for the entire receipt with a light border */
      .receipt {
        border: 1px solid #ccc; /* Light gray border around the receipt */
        padding: 10px; /* Optional padding inside the receipt */
      }
      .header {
        text-align: center;
        margin-bottom: 10px;
      }
      .header img {
        max-width: 100px;
        height: auto;
      }
      .header h2 {
        margin: 5px 0;
        font-size: 16px;
      }
      .header p {
        margin: 2px 0;
        font-size: 12px;
      }
      .divider {
        border-bottom: 1px dashed #000;
        margin: 10px 0;
      }
      table {
        width: 100%;
        font-size: 12px;
        margin-bottom: 10px;
        border-collapse: collapse;
      }
      table th, table td {
        text-align: center;
        padding: 4px;
        border: none; /* Remove borders from cells */
      }
      /* Specific class to left-align Product Name */
      .product-name {
        text-align: left;
        white-space: normal; /* Allows text to wrap */
        word-wrap: break-word; /* Breaks long words if necessary */
      }
      .summary {
        margin-top: 10px;
        font-size: 12px;
      }
      .summary div {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .footer {
        text-align: center;
        margin-top: 10px;
        font-size: 12px;
      }
      /* Styling for the first row of each item */
      .item-header {
        background-color: #f9f9f9;
        font-weight: bold;
      }
      /* Remove top border for the second row to merge seamlessly */
      .item-details td {
        border-top: none;
        margin-left:  20px;
      }
      /* Hide empty cells */
      .empty-cell {
        border: none;
        padding: 0;
      }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header Section -->
          <div class="header">
            <img src="${invoiceDataToPrint.company.LogoUrl || 'https://via.placeholder.com/120'}" alt="Company Logo" />
            <h2>${invoiceDataToPrint.company.Comname || "Store Name"}</h2>
            <p>${invoiceDataToPrint.company.Location || "Store Address"}</p>
            <p>Phone: ${invoiceDataToPrint.company.Mobile || "123-456-7890"}</p>
            <p>Date: ${new Date(invoiceDataToPrint.sales.createdAt).toLocaleString()}</p>
          </div>
  
          <div class="divider"></div>
  
          <!-- Invoice Information -->
          <div class="invoice-details">
            <div><strong>Invoice #:</strong> ${invoiceDataToPrint.sales.invoiceId}</div>
            <div><strong>Cashier:</strong> ${invoiceDataToPrint.sales.UserName}</div>
            <div><strong>Customer ID:</strong> ${invoiceDataToPrint.sales.CustomerId}</div>
          </div>
  
          <div class="divider"></div>
  
          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Disc</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
            ${invoiceDataToPrint.invoices
              .map(
                (item, index) => `
                  <tr>
                    <td colspan="5" style="text-align: left; font-weight: bold;">${index + 1}. ${item.name}</td>
                  </tr>
                  <tr>
                    <td></td> <!-- Empty cell for alignment -->
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: center;">${parseFloat(item.rate).toFixed(2)}</td>
                    <td style="text-align: center;">${item.discount ? ` ${parseFloat(item.discount).toFixed(2)}` : "-"}</td>
                    <td style="text-align: center;">${parseFloat(item.totalAmount).toFixed(2)}</td>
                  </tr>
                `
              )
              .join("")}
            </tbody>
          </table>
  
          <div class="divider"></div>
  
          <!-- Totals Section -->
          <table class="totals">
            <tbody>
              <tr>
                <td class="label"><strong>Gross Total:</strong></td>
                <td class="value"> ${parseFloat(invoiceDataToPrint.sales.GrossTotal).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label"><strong>Discount:</strong></td>
                <td class="value">-  ${parseFloat(invoiceDataToPrint.sales.discountAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label"><strong>Net Amount:</strong></td>
                <td class="value"> ${parseFloat(invoiceDataToPrint.sales.netAmount).toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label"><strong>Payment:</strong></td>
                <td class="value"> ${(
        parseFloat(invoiceDataToPrint.sales.CashPay) +
        parseFloat(invoiceDataToPrint.sales.CardPay)
      ).toFixed(2)}</td>.0

                
              </tr>
              <tr>
                <td class="label"><strong>Balance:</strong></td>
                <td class="value">₹ ${parseFloat(invoiceDataToPrint.sales.Balance).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
  
          <div class="divider"></div>
  
          <!-- Footer Section -->
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>Visit again!</p>
          </div>
  
          <!-- Cut Line -->
          <div class="cut-line">
          </div>
        </div>
      </body>
      </html>
    `;

    // Write the receipt content to the iframe's document
    const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(receiptHTML);
    iframeDoc.close();

    // Define a handler that prints and cleans up after the print is done
    const handlePrint = () => {
      try {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } catch (error) {
        console.error("Error during printing:", error);
        Swal.fire("Error", "Failed to print the invoice.", "error");
      } finally {
        // Clean up: remove the iframe after printing
        setTimeout(() => {
          if (printIframe && printIframe.parentNode) {
            printIframe.parentNode.removeChild(printIframe);
            printIframeRef.current = null;
          }
          resetAllFields();
          clearInvoiceTable(); // Clear data from the invoice table in the parent
          onClose();
        }, 1000); // Delay to ensure print dialog has been triggered
      }
    };

    // Attach the onload event only once
    if (iframeDoc.readyState === "complete") {
      handlePrint();
    } else {
      // Otherwise, wait for the iframe to load and then print
      printIframe.onload = handlePrint;
    }
  };


  // Determine Balance Style
  const getBalanceStyle = () => {
    if (balance < 0) return { backgroundColor: "red", color: "white" };
    if (balance > 0) return { backgroundColor: "yellow", color: "black" };
    return { backgroundColor: "green", color: "white" };
  };

  return (
    show && (
      <div id="payment-modal">
        <div id="payment-container">
          <h1 id="total-amount-payment-model">
            RS: {parseFloat(totalAmount || 0).toFixed(2)}
          </h1>

          {/* Customer Mobile */}
          <div id="customer-mobile-group">
            <label>
              <img
                id="customer-payment-image"
                src={customerPaymentImage}
                alt="Customer"
              />
              Customer Mobile
            </label>
            <input
              type="text"
              placeholder="Enter Mobile / ID / Name"
              value={customerMobile}
              onChange={handleCustomerMobileChange}
            />
            {suggestions.length > 0 && (
              <div id="suggestions-dropdown">
                {suggestions.map((customer) => (
                  <div
                    key={customer.id}
                    id="suggestion-item"
                    onClick={() => handleSuggestionClick(customer)}
                  >
                    {customer.cusId} - {customer.cusName} -{" "}
                    {customer.mobile1 || customer.mobile2}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount Section */}
          <div id="discount-percent-group">
            <label>
              <img
                id="discount-percentage-image"
                src={discountPercentageImage}
                alt="Discount Percent"
              />
              Discount (%)
            </label>
            <input
              type="text"
              placeholder="Enter Discount (%)"
              value={discountPercent}
              onChange={(e) => {
                const value = e.target.value;
                setDiscountPercent(value);
                const percent = parseFloat(value);
                const discountValue = isNaN(percent)
                  ? 0
                  : (totalAmount * percent) / 100;
                setDiscountAmount(discountValue.toFixed(2));
                calculateNetAmount(discountValue);
              }}
            />
          </div>
          <div id="discount-amount-group">
            <label>
              <img
                id="discount-price-image"
                src={discountPriceImage}
                alt="Discount Amount"
              />
              Discount Amount
            </label>
            <input
              type="text"
              placeholder="Enter Discount Amount"
              value={discountAmount}
              onChange={(e) => {
                const value = e.target.value;
                setDiscountAmount(value);
                const amount = parseFloat(value);
                const percent =
                  isNaN(amount) || amount > totalAmount
                    ? 0
                    : (amount / totalAmount) * 100;
                setDiscountPercent(percent.toFixed(2));
                calculateNetAmount(amount);
              }}
            />
          </div>

          {/* Net Amount Section */}
          <div id="net-amount-group">
            <label>
              <img
                id="net-amount-image"
                src={netAmountImage}
                alt="Net Amount"
              />
              Net Amount
            </label>
            <input type="text" value={netAmount} readOnly />
          </div>

          {/* Payment Section */}
          <div id="cash-payment-group">
            <label>
              <img
                id="cash-payment-image"
                src={cashImage}
                alt="Cash Payment"
              />
              Cash Payment
            </label>
            <input
              type="text"
              placeholder="Enter Cash Payment"
              value={cashPayment}
              onChange={handleCashPaymentChange}
              disabled={paymentType === "Return Payment"}
            />
          </div>
          <div id="card-payment-group">
            <label>
              <img
                id="card-payment-image"
                src={cardImage}
                alt="Card Payment"
              />
              Card Payment
            </label>
            <input
              type="text"
              placeholder="Enter Card Payment"
              value={cardPayment}
              onChange={handleCardPaymentChange}
              disabled={paymentType === "Return Payment"}
            />
          </div>

          {/* Payment Type */}
          <div id="payment-type-group">
            <label>
              <img
                id="payment-type-image"
                src={paymentTypeImage}
                alt="Payment Type"
              />
              Payment Type
            </label>
            <input type="text" value={paymentType} readOnly />
          </div>

          {/* Balance Section */}
          <div id="balance-group">
            <label>Balance</label>
            <input
              type="text"
              value={balance}
              readOnly
              style={getBalanceStyle()}
            />
          </div>

          {/* Action Buttons */}
          <div id="action-buttons">
            <button onClick={handlePayment}>Complete Payment</button>
            <button onClick={handleBackToEdit}>Back to Edit</button>
            <button onClick={handleCloseBill}>Close Bill</button>
          </div>
        </div>
      </div>
    )
  );
}

PaymentModel.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  totalAmount: PropTypes.number.isRequired,
  clearInvoiceTable: PropTypes.func.isRequired,
  tableData: PropTypes.arrayOf(
    PropTypes.shape({
      productId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      cost: PropTypes.string.isRequired,
      mrp: PropTypes.string.isRequired,
      discount: PropTypes.string.isRequired,
      rate: PropTypes.string.isRequired,
      quantity: PropTypes.string.isRequired,
      amount: PropTypes.string.isRequired,
      barcode: PropTypes.string,
    })
  ).isRequired,
  user: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
