import { useState } from "react";
import Swal from "sweetalert2";
import PropTypes from "prop-types"; // Import PropTypes for validation
import "../css1/payment.css";

import cashImage from "../assets/icons/cash.png";
import cardImage from "../assets/icons/card.png";
import customerPaymentImage from "../assets/icons/customerPayment.png";
import discountPercentageImage from "../assets/icons/discountPer.png";
import discountPriceImage from "../assets/icons/discounts.png";
import paymentTypeImage from "../assets/icons/paymentType.png";
import netAmountImage from "../assets/icons/netAmount.png"; // Add an appropriate image for Net Amount

export default function PaymentModel({ show, onClose, totalAmount, clearInvoiceTable }) {
  const [customerMobile, setCustomerMobile] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [cashPayment, setCashPayment] = useState("");
  const [cardPayment, setCardPayment] = useState("");
  const [netAmount, setNetAmount] = useState(totalAmount);
  const [balance, setBalance] = useState(totalAmount);
  const [paymentType, setPaymentType] = useState("Credit Payment");



  // Handle customer mobile input and fetch suggestions
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
        Swal.fire("Error", "Failed to fetch customer suggestions", error);
      }
    } else {
      setSuggestions([]);
    }
  };


  const handleSuggestionClick = (customer) => {
    setCustomerMobile(customer.id); // Display the customer ID in the input field
    setSuggestions([]); // Clear suggestions
  };




  const handleBackToEdit = () => {
    setCustomerMobile(""); // Clear customer mobile input
    setSuggestions([]); // Clear suggestions
    setDiscountPercent(""); // Clear discount percent
    setDiscountAmount(""); // Clear discount amount
    setCashPayment(""); // Clear cash payment
    setCardPayment(""); // Clear card payment
    setNetAmount(totalAmount); // Reset net amount to total amount
    setBalance(totalAmount); // Reset balance to total amount
    setPaymentType("Credit Payment"); // Reset payment type
    onClose(); // Close the modal
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
        // Clear all fields
        setCustomerMobile("");
        setSuggestions([]);
        setDiscountPercent("");
        setDiscountAmount("");
        setCashPayment("");
        setCardPayment("");
        setNetAmount(totalAmount);
        setBalance(totalAmount);
        setPaymentType("Credit Payment");

        clearInvoiceTable(); // Clears the invoice table
        onClose(); // Closes the modal
        Swal.fire("Closed!", "The invoice has been cleared.", "success");
      }
    });
  };




  // Handle discount percentage
  const handleDiscountPercentChange = (e) => {
    const value = e.target.value;
    setDiscountPercent(value);

    const percent = parseFloat(value);
    if (!isNaN(percent) && percent >= 0) {
      const discountValue = (totalAmount * percent) / 100;
      setDiscountAmount(discountValue.toFixed(2));
      calculateNetAmount(discountValue);
    } else {
      setDiscountAmount("");
      calculateNetAmount(0);
    }
  };

  // Handle discount amount
  const handleDiscountAmountChange = (e) => {
    const value = e.target.value;
    setDiscountAmount(value);

    const amount = parseFloat(value);
    if (!isNaN(amount) && amount >= 0 && amount <= totalAmount) {
      const percent = (amount / totalAmount) * 100;
      setDiscountPercent(percent.toFixed(2));
      calculateNetAmount(amount);
    } else {
      setDiscountPercent("");
      calculateNetAmount(0);
    }
  };

  const calculateNetAmount = (discountValue) => {
    const net = totalAmount - discountValue;
    setNetAmount(net.toFixed(2));
    setBalance(net.toFixed(2));
    updatePaymentType(net, 0);
  };



  const handleCashPaymentChange = (e) => {
    const inputValue = e.target.value;

    // Validate input to ensure it's a numeric value
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      return; // Ignore invalid input
    }

    const cash = parseFloat(inputValue) || 0; // Cash payment value entered by the user
    const net = parseFloat(netAmount) || 0; // Net amount from the state
    const card = net - cash; // Calculate card payment dynamically

    // Ensure cash does not exceed the net amount
    if (cash > net) {
      Swal.fire("Error", "Cash payment cannot exceed the net amount!", "error");
      setCashPayment(""); // Reset cash payment
      setCardPayment(net.toFixed(2)); // Reset card payment to full net amount
      setBalance(net.toFixed(2)); // Reset balance
      setPaymentType("Credit Payment"); // Set payment type as credit
      return;
    }

    // Update cash payment field
    setCashPayment(inputValue);

    // Update card payment field dynamically
    setCardPayment(card.toFixed(2));

    // Update balance
    setBalance("0.00"); // Balance should be zero after full payment

    // Determine the payment type
    if (cash + card < netAmount) {
      setPaymentType("Credit Payment"); // Insufficient payment made
    } else if (cash === 0 && card === 0) {
      setPaymentType("Credit Payment"); // No payment made
    } else if (cash > 0 && card > 0) {
      setPaymentType("Cash and Card Payment"); // Mixed payment
    } else if (cash > 0 && card === 0) {
      setPaymentType("Cash Payment"); // Fully paid in cash
    } else if (cash === 0 && card > 0) {
      setPaymentType("Card Payment"); // Fully paid by card
    }

  };




  // Handle card payment
  const handleCardPaymentChange = (e) => {
    const card = parseFloat(e.target.value) || 0;
    const cash = parseFloat(cashPayment) || 0;

    if (cash + card > netAmount) {
      Swal.fire("Error", "The total payment cannot exceed the net amount!", "error");
      return;
    }

    setCardPayment(e.target.value);

    const totalPaid = cash + card;
    const remainingBalance = netAmount - totalPaid;

    setBalance(remainingBalance.toFixed(2));
    updatePaymentType(netAmount, totalPaid);
  };


  const updatePaymentType = (net, paid) => {
    if (net - paid > 0) {
      setPaymentType("Credit Payment");
    } else {
      setPaymentType("Cash Payment");
    }
  };


  const handlePayment = async () => {
    if (balance < 0) {
      Swal.fire("Error", "Balance cannot be negative. Please check the payment details.", "error");
      return;
    }
  
    const paymentData = {
      GrossTotal: totalAmount,
      CustomerId: customerMobile || "Unknown", // Default to 'Unknown' if no customer
      discountPercent: discountPercent,
      discountAmount: discountAmount,
      netAmount: netAmount,
      CashPay: cashPayment,
      CardPay: cardPayment,
      PaymentType: paymentType,
      Balance: balance, // Allow saving with a remaining balance
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/invoices/add_sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });
  
      if (response.ok) {
        const result = await response.json();
        Swal.fire("Success", `Payment saved successfully! Invoice ID: ${result.invoiceId}`, "success");
  
        // Clear fields and reset state
        setCustomerMobile("");
        setSuggestions([]);
        setDiscountPercent("");
        setDiscountAmount("");
        setCashPayment("");
        setCardPayment("");
        setNetAmount(totalAmount);
        setBalance(totalAmount);
        setPaymentType("Credit Payment");
  
        clearInvoiceTable();
        onClose();
      } else {
        const error = await response.json();
        Swal.fire("Error", `Failed to save payment: ${error.message}`, "error");
      }
    } catch (err) {
      Swal.fire("Error", "An unexpected error occurred.", "error");
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
          <h1 id="total-amount-payment-model">RS: {totalAmount.toFixed(2)}</h1>

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
              onChange={handleDiscountPercentChange}
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
              onChange={handleDiscountAmountChange}
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
              type="number"
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

// Add PropTypes validation
PaymentModel.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  totalAmount: PropTypes.number.isRequired,
  clearInvoiceTable: PropTypes.func.isRequired,
  tableData: PropTypes.array.isRequired, // Pass table data for invoice
};