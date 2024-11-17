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

export default function PaymentModel({ show, onClose, totalAmount, clearInvoiceTable, tableData, user, store }) {
  const [customerMobile, setCustomerMobile] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [discountPercent, setDiscountPercent] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [cashPayment, setCashPayment] = useState("0");
  const [cardPayment, setCardPayment] = useState("0");
  const [netAmount, setNetAmount] = useState(totalAmount);
  const [balance, setBalance] = useState(totalAmount);
  const [paymentType, setPaymentType] = useState("Credit Payment");

  // Reset values when modal loads
  useEffect(() => {
    if (show) {
      setDiscountPercent("0");
      setDiscountAmount("0");
      setCashPayment("0");
      setCardPayment("0");
      setNetAmount(totalAmount);
      setBalance(totalAmount);

      if (totalAmount < 0) {
        setCashPayment("0");
        setCardPayment("0");
        setPaymentType("Return Payment");
      }
    }
  }, [show, totalAmount]);

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
        Swal.fire("Error", "Failed to fetch customer suggestions", error.message);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (customer) => {
    setCustomerMobile(customer.id);
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
        Swal.fire("Closed!", "The invoice has been cleared.", "success");
      }
    });
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
  };

  const handleCashPaymentChange = (e) => {
    const inputValue = e.target.value;

    if (!/^\d*\.?\d*$/.test(inputValue)) {
      return; // Ignore invalid input
    }

    const cash = parseFloat(inputValue) || 0;
    const net = parseFloat(netAmount) || 0;

    setCashPayment(inputValue);

    // Calculate balance and update payment type
    const balanceAmount = cash - net;
    setBalance(balanceAmount.toFixed(2)); // Balance = cashPayment - netAmount

    if (cash >= net) {
      setPaymentType("Cash Payment"); // Fully paid or overpaid
    } else {
      setPaymentType("Credit Payment"); // Underpaid
    }
  };

  const handleCardPaymentChange = (e) => {
    const inputValue = e.target.value;
  
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      return; // Ignore invalid input
    }
  
    const card = parseFloat(inputValue) || 0;
    const cash = parseFloat(cashPayment) || 0;
    const net = parseFloat(netAmount) || 0;
  
    setCardPayment(inputValue);
  
    // Calculate balance and update payment type
    const balanceAmount = cash + card - net;
    setBalance(balanceAmount.toFixed(2)); // Balance = (cash + card) - netAmount
  
    if (cash + card >= net) {
      if (cash > 0 && card > 0) {
        setPaymentType("Cash and Card Payment");
      } else if (cash > 0) {
        setPaymentType("Cash Payment");
      } else if (card > 0) {
        setPaymentType("Card Payment");
      }
    } else {
      setPaymentType("Credit Payment"); // Underpaid
    }
  };
  

  const handlePayment = async () => {
    // Remove negative balance restriction
    const paymentData = {
      GrossTotal: totalAmount,
      CustomerId: customerMobile || "Unknown",
      discountPercent,
      discountAmount,
      netAmount,
      CashPay: cashPayment,
      CardPay: cardPayment,
      PaymentType: paymentType,
      Balance: balance, // Allow negative balance
      invoiceItems: tableData,
      user,
      store,
    };
  
    try {
      const salesResponse = await fetch("http://localhost:5000/api/invoices/add_sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });
  
      if (!salesResponse.ok) {
        const error = await salesResponse.json();
        Swal.fire("Error", `Failed to save payment: ${error.message}`, "error");
        return;
      }
  
      const salesResult = await salesResponse.json();
      const { invoiceId } = salesResult;
  
      Swal.fire("Success", `Payment and invoice saved successfully! Invoice ID: ${invoiceId}`, "success");
  
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
    } catch (error) {
      Swal.fire("Error", "An unexpected error occurred.", error.message);
    }
  };
  

  const getBalanceStyle = () => {
    if (balance < 0) return { backgroundColor: "red", color: "white" };
    if (balance > 0) return { backgroundColor: "yellow", color: "black" };
    return { backgroundColor: "green", color: "white" };
  };

  return (
    show && (
      <div id="payment-modal">
        <div id="payment-container">
          <h1 id="total-amount-payment-model">RS: {parseFloat(totalAmount || 0).toFixed(2)}</h1>

          {/* Customer Mobile */}
          <div id="customer-mobile-group">
            <label>
              <img id="customer-payment-image" src={customerPaymentImage} alt="Customer" />
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
                    {customer.id} - {customer.cusName} - {customer.mobile1 || customer.mobile2}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount Section */}
          <div id="discount-percent-group">
            <label>
              <img id="discount-percentage-image" src={discountPercentageImage} alt="Discount Percent" />
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
                const discountValue = isNaN(percent) ? 0 : (totalAmount * percent) / 100;
                setDiscountAmount(discountValue.toFixed(2));
                calculateNetAmount(discountValue);
              }}
            />
          </div>
          <div id="discount-amount-group">
            <label>
              <img id="discount-price-image" src={discountPriceImage} alt="Discount Amount" />
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
                const percent = isNaN(amount) || amount > totalAmount ? 0 : (amount / totalAmount) * 100;
                setDiscountPercent(percent.toFixed(2));
                calculateNetAmount(amount);
              }}
            />
          </div>

          {/* Net Amount Section */}
          <div id="net-amount-group">
            <label>
              <img id="net-amount-image" src={netAmountImage} alt="Net Amount" />
              Net Amount
            </label>
            <input type="text" value={netAmount} readOnly />
          </div>

          {/* Payment Section */}
          <div id="cash-payment-group">
            <label>
              <img id="cash-payment-image" src={cashImage} alt="Cash Payment" />
              Cash Payment
            </label>
            <input
              type="text"
              placeholder="Enter Cash Payment"
              value={cashPayment}
              onChange={handleCashPaymentChange}
            />
          </div>
          <div id="card-payment-group">
            <label>
              <img id="card-payment-image" src={cardImage} alt="Card Payment" />
              Card Payment
            </label>
            <input
              type="text"
              placeholder="Enter Card Payment"
              value={cardPayment}
              onChange={handleCardPaymentChange}
            />
          </div>

          {/* Payment Type */}
          <div id="payment-type-group">
            <label>
              <img id="payment-type-image" src={paymentTypeImage} alt="Payment Type" />
              Payment Type
            </label>
            <input type="text" value={paymentType} readOnly />
          </div>

          {/* Balance Section */}
          <div id="balance-group">
            <label>Balance</label>
            <input type="text" value={balance} readOnly style={getBalanceStyle()} />
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
      productId: PropTypes.string.isRequired, // Add productId validation
      name: PropTypes.string.isRequired,
      cost: PropTypes.string.isRequired,
      mrp: PropTypes.string.isRequired,
      discount: PropTypes.string.isRequired,
      rate: PropTypes.string.isRequired,
      quantity: PropTypes.string.isRequired,
      amount: PropTypes.string.isRequired,
      barcode: PropTypes.string, // Include barcode if necessary (optional)
    })
  ).isRequired,
  user: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};
