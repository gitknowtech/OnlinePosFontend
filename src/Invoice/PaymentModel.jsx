import  { useState } from "react";
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
      text: "This will close the bill and clear the invoice!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, close it!",
    }).then((result) => {
      if (result.isConfirmed) {
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

  // Handle cash payment
  const handleCashPaymentChange = (e) => {
    const cash = parseFloat(e.target.value) || 0;
    const card = parseFloat(cardPayment) || 0;

    if (cash + card > netAmount) {
      Swal.fire("Error", "The total payment cannot exceed the net amount!", "error");
      return;
    }

    setCashPayment(e.target.value);

    const totalPaid = cash + card;
    const remainingBalance = netAmount - totalPaid;

    setBalance(remainingBalance.toFixed(2));
    updatePaymentType(netAmount, totalPaid);
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
    if (balance > 0) {
      Swal.fire("Error", "Payment not completed. Balance is due.", "error");
      return;
    }
  
    const invoiceData = {
      customerMobile,
      user: "Guest", // Replace with the actual user from context or props
      store: "Default Store", // Replace with the actual store
      totalAmount: parseFloat(totalAmount),
      totalQuantity: parseInt(totalQuantity, 10),
      totalDiscount: parseFloat(totalDiscount),
      sales: tableData, // Pass the table data (sales items)
    };
  
    try {
      const response = await axios.post("http://localhost:5000/api/invoice", invoiceData);
      Swal.fire("Success", response.data.message, "success");
      clearInvoiceTable(); // Clear invoice table after successful payment
      onClose(); // Close the payment modal
    } catch (error) {
      Swal.fire("Error", "Failed to save payment data", "error");
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
              type="number"
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
            <button onClick={handlePayment}>Payment</button>
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
};
