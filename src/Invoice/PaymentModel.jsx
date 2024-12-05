import { useState, useEffect } from "react";
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

import Bill from "./Bill"; // Import the Bill component

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
  const [cashPayment, setCashPayment] = useState("0");
  const [cardPayment, setCardPayment] = useState("0");
  const [netAmount, setNetAmount] = useState(totalAmount);
  const [balance, setBalance] = useState(totalAmount);
  const [paymentType, setPaymentType] = useState("Credit Payment");
  const [invoiceId, setInvoiceId] = useState(null);
  const [isInvoiceDataLoaded, setIsInvoiceDataLoaded] = useState(false);
  const [printAfterConfirm, setPrintAfterConfirm] = useState(false); // Flag to print after user confirms success message

  // Reset values when modal loads
  useEffect(() => {
    if (show) {
      setDiscountPercent("0");
      setDiscountAmount("0");
      setCashPayment("");
      setCardPayment("");
      setNetAmount(totalAmount);
      setBalance(totalAmount);

      if (totalAmount < 0) {
        setCashPayment("0");
        setCardPayment("0");
        setPaymentType("Return Payment");
      } else {
        updatePaymentTypeForZeroValues();
      }
    }
  }, [show, totalAmount]);

  const updatePaymentTypeForZeroValues = () => {
    if (
      parseFloat(netAmount) === 0 &&
      parseFloat(cashPayment) === 0 &&
      parseFloat(cardPayment) === 0
    ) {
      setPaymentType("Cash Payment");
    }
  };

  const handleCustomerMobileChange = async (e) => {
    const input = e.target.value;
    setCustomerMobile(input);

    if (input.length >= 3) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/customer/customers?mobile=${input}`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch customer suggestions", "error");
        console.error("Error fetching customer suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (customer) => {
    setCustomerMobile(customer.cusId);
    setSuggestions([]);
  };

  const handleBackToEdit = () => {
    setCustomerMobile("");
    setSuggestions([]);
    setDiscountPercent("0");
    setDiscountAmount("0");
    setCashPayment("0");
    setCardPayment("0");
    setNetAmount(totalAmount);
    setBalance(totalAmount);
    setPaymentType("Credit Payment");
    onClose();
  };

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
        resetAfterPrint();
      }
    });
  };

  const resetAfterPrint = () => {
    setCustomerMobile("");
    setSuggestions([]);
    setDiscountPercent("0");
    setDiscountAmount("0");
    setCashPayment("0");
    setCardPayment("0");
    setNetAmount(totalAmount);
    setBalance(totalAmount);
    setPaymentType("Credit Payment");

    clearInvoiceTable();
    onClose();
  };

  const calculateNetAmount = (discountValue) => {
    const net = totalAmount - discountValue;
    setNetAmount(net.toFixed(2));

    if (net < 0) {
      setCashPayment("0");
      setCardPayment("0");
      setPaymentType("Return Payment");
    } else {
      setBalance(net.toFixed(2));
      setPaymentType("Credit Payment");
    }

    updatePaymentTypeForZeroValues();
  };

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

    updatePaymentTypeForZeroValues();
  };

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

    updatePaymentTypeForZeroValues();
  };

  const handlePayment = async () => {
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

      // Fetch the latest saved invoice
      const fetchResponse = await fetch("http://localhost:5000/api/invoices/last");
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch the last invoice");
      }

      const lastInvoice = await fetchResponse.json();
      if (!Array.isArray(lastInvoice) || lastInvoice.length === 0) {
        Swal.fire("Error", "No invoice data found!", "error");
        return;
      }

      setInvoiceId(lastInvoice[0].invoiceId);

      // Show success message and wait for user to click OK
      Swal.fire("Success", "Invoice saved successfully!", "success").then(
        (result) => {
          if (result.isConfirmed) {
            // User clicked OK, now we want to print the invoice
            // If invoice data is already loaded, print now
            // If not, set a flag to print after data loads
            if (isInvoiceDataLoaded) {
              handlePrintInvoice();
            } else {
              setPrintAfterConfirm(true);
            }
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

  const handlePrintInvoice = () => {
    const printContent = document.getElementById("printable-receipt");
    if (!printContent) {
      Swal.fire("Error", "Unable to find invoice content to print.", "error");
      return;
    }

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

    // After printing, reset and close Payment Model
    resetAfterPrint();
  };

  const getBalanceStyle = () => {
    if (balance < 0) return { backgroundColor: "red", color: "white" };
    if (balance > 0) return { backgroundColor: "yellow", color: "black" };
    return { backgroundColor: "green", color: "white" };
  };

  // When Bill data is loaded, if user already confirmed success message and wants to print, print now
  useEffect(() => {
    if (isInvoiceDataLoaded && printAfterConfirm) {
      handlePrintInvoice();
    }
  }, [isInvoiceDataLoaded, printAfterConfirm]);

  return (
    show && (
      <>
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

        {/* Conditionally render the Bill component */}
        {invoiceId && (
          <div style={{ display: "none" }}>
            <Bill invoiceId={invoiceId} onDataLoaded={() => setIsInvoiceDataLoaded(true)} />
          </div>
        )}
      </>
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
