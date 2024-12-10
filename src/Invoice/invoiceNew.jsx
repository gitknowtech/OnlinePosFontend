// src/components/InvoiceNew.jsx

import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../css1/invoice.css"; // Ensure this path is correct

// Import only necessary images
import payment from "../assets/images/payment.png";
import discount from "../assets/images/discount.png";
import wholesale from "../assets/images/wholesale.png";
import removeImage from "../assets/images/remove.png";

import PaymentModel from "./PaymentModel";

export default function InvoiceNew() {
  const location = useLocation();
  const [user, setUser] = useState("Guest");
  const [store, setStore] = useState("Default Store");
  const [startTime, setStartTime] = useState("");
  const [barcode, setBarcode] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [lockedPrice, setLockedPrice] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [productId, setProductId] = useState(""); // State to store productId
  const [totalAmount, setTotalAmount] = useState("0.00");
  const [isWholesale, setIsWholesale] = useState(false);
  const [isDiscount, setIsDiscount] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState("0.00");
  const [itemCount, setItemCount] = useState(0);
  const [percentage, setPercentage] = useState(""); // State for percentage input
  const [productName, setProductName] = useState(""); // Added state for productName
  const [costPrice, setCostPrice] = useState(""); // Added state for costPrice
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false); // Flag for suggestion selection

  const barcodeInputRef = useRef(null);
  const priceInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const suggestionsRef = useRef(null); // Ref for suggestions dropdown

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (location.state) {
      const { UserName, Store } = location.state;
      setUser(UserName || "Guest");
      setStore(Store || "Default Store");
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setStartTime(formattedTime);
  }, [location.state]);

  useEffect(() => {
    calculateTotals();
  }, [tableData]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "F1":
          e.preventDefault();
          barcodeInputRef.current?.focus();
          break;
        case "F9":
          e.preventDefault();
          toggleWholesale();
          break;
        case "F8":
          e.preventDefault();
          toggleDiscount();
          break;
        case "F10":
          e.preventDefault();
          handleOpenPaymentModal();
          break;
        case "Escape":
          e.preventDefault();
          closeAllModals();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isWholesale, isDiscount, tableData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !barcodeInputRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleWholesale = () => {
    setIsWholesale((prev) => !prev);
    if (!isWholesale) {
      setIsDiscount(false);
    }
  };

  const toggleDiscount = () => {
    setIsDiscount((prev) => !prev);
    if (!isDiscount) {
      setIsWholesale(false);
    }
  };

  const closeAllModals = () => {
    setIsPaymentModalOpen(false);
  };

  const handleAddOtherItem = (item) => {
    const { productName, productCost, productMRP, productRate, qty, discount } = item;
    const amount = parseFloat(productRate) * parseFloat(qty); // Calculate amount based on Rate and Quantity

    setTableData((prevData) => [
      ...prevData,
      {
        name: productName,
        cost: parseFloat(productCost).toFixed(2), // Cost
        mrp: parseFloat(productMRP).toFixed(2), // MRP
        discount: parseFloat(discount).toFixed(2), // Discount calculated as MRP - Rate
        rate: parseFloat(productRate).toFixed(2), // Rate
        quantity: parseFloat(qty).toFixed(2), // Quantity
        amount: amount.toFixed(2), // Total amount (Rate * Quantity)
      },
    ]);
  };

  const handleOpenPaymentModal = () => {
    if (tableData.length === 0) {
      Swal.fire("Error", "Please add products to the table before proceeding to payment.", "error");
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModal = () => {
    handleOpenPaymentModal();
  };

  const handleClosePaymentModal = () => setIsPaymentModalOpen(false);

  const handleProductSelect = (product) => {
    if (!product || !product.barcode) {
      console.error("Invalid product data:", product);
      Swal.fire("Error", "Invalid product data", "error");
      return;
    }

    setBarcode(product.barcode);
    setPrice(product.salePrice);
    setSuggestedPrice(product.mrpPrice);
    setLockedPrice(product.lockedPrice);

    barcodeInputRef.current.focus();
  };

  const handleBarcodeChange = async (e) => {
    const input = e.target.value;
    setBarcode(input);

    if (isSelectingSuggestion) {
      // If a suggestion is being selected, do not fetch suggestions
      return;
    }

    if (input.length > 1) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/search_invoice_by_store`,
          {
            params: { query: input, store },
          }
        );

        const products = response.data;

        if (products.length === 0) {
          Swal.fire("Not Found", "No products found for this barcode.", "warning");
          setSuggestions([]);
        } else {
          setSuggestions(products);
        }
      } catch (error) {
        Swal.fire("Error", "Failed to fetch product suggestions.", "error");
        console.error("Error fetching product suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setIsSelectingSuggestion(true); // Indicate that a suggestion is being selected

    // Set all necessary fields from the selected suggestion
    setBarcode(suggestion.barcode);
    setProductId(suggestion.productId); // Save productId to state
    setCostPrice(suggestion.costPrice);
    setLockedPrice(suggestion.lockedPrice);
    setProductName(suggestion.productName);
    setSuggestedPrice(suggestion.mrpPrice);

    // Determine the default price based on conditions
    if (isWholesale) {
      setPrice(suggestion.wholesalePrice);
    } else if (isDiscount) {
      setPrice(suggestion.discountPrice);
    } else {
      setPrice(suggestion.mrpPrice);
    }

    // Clear the suggestions dropdown
    setSuggestions([]);

    // Refocus the price input field reliably
    setTimeout(() => {
      setIsSelectingSuggestion(false); // Reset the flag
      if (priceInputRef.current) {
        priceInputRef.current.focus();
        priceInputRef.current.select(); // Highlight the price for easy overwrite
      }
    }, 100); // Delay ensures focus works even after state updates
  };

  const handleBarcodeEnter = async () => {
    if (!barcode) {
      Swal.fire("Invalid Barcode", "Please enter a barcode.", "error");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/search_by_barcode`,
        {
          params: { query: barcode },
        }
      );

      if (response.data.length > 0) {
        const product = response.data[0];
        setBarcode(product.barcode);
        setLockedPrice(product.lockedPrice);
        setSuggestedPrice(product.mrpPrice);
        setProductId(product.productId); // Save productId to state
        setProductName(product.productName); // Set product name
        setCostPrice(product.costPrice); // Set cost price

        // Set the default price based on wholesale or discount
        if (isWholesale) {
          setPrice(product.wholesalePrice);
        } else if (isDiscount) {
          setPrice(product.discountPrice);
        } else {
          setPrice(product.mrpPrice);
        }

        setTableData((prevData) => {
          const existingIndex = prevData.findIndex(
            (item) => item.barcode === product.barcode
          );

          if (existingIndex !== -1) {
            const existingItem = prevData[existingIndex];
            const updatedQuantity = parseFloat(existingItem.quantity) + 1;
            const updatedAmount = updatedQuantity * parseFloat(existingItem.rate);

            const updatedItem = {
              ...existingItem,
              quantity: updatedQuantity.toFixed(2),
              amount: updatedAmount.toFixed(2),
            };

            const updatedData = [...prevData];
            updatedData[existingIndex] = updatedItem;
            return updatedData;
          } else {
            return [
              ...prevData,
              {
                productId: product.productId, // Fetched directly from backend
                name: product.productName,
                mrp: parseFloat(product.mrpPrice).toFixed(2),
                discount: 0,
                rate: parseFloat(product.mrpPrice).toFixed(2),
                quantity: "1.00",
                amount: parseFloat(product.mrpPrice).toFixed(2),
                barcode: product.barcode,
                type: "new",
              },
            ];
          }
        });

        setSuggestions([]);
        // Focus on price input to allow editing
        priceInputRef.current.focus();
      } else {
        Swal.fire("Not Found", "Product with this barcode does not exist", "warning");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to fetch product by barcode", "error");
      console.error("Error fetching product by barcode:", error);
    }
  };

  const handleQtyEnter = async () => {
    if (!qty || isNaN(parseFloat(qty)) || parseFloat(qty) <= 0) {
      Swal.fire("Invalid Quantity", "Please enter a valid quantity.", "error");
      return;
    }

    const requestedQuantity = parseFloat(qty);
    const enteredPrice = parseFloat(price);

    if (!enteredPrice || enteredPrice <= 0) {
      Swal.fire("Invalid Price", "Please enter a valid price.", "error");
      return;
    }

    // Add a new row with the requested quantity
    setTableData((prevData) => [
      ...prevData,
      {
        productId, // Use productId from state
        barcode, // Optionally keep barcode for reference
        name: productName,
        cost: parseFloat(costPrice || 0).toFixed(2),
        mrp: parseFloat(suggestedPrice || 0).toFixed(2),
        discount: (parseFloat(suggestedPrice || 0) - enteredPrice).toFixed(2),
        rate: enteredPrice.toFixed(2),
        quantity: requestedQuantity.toFixed(2),
        amount: (requestedQuantity * enteredPrice).toFixed(2),
        type: "new",
      },
    ]);

    // Clear input fields after adding item
    setProductName("");
    setBarcode("");
    setPrice("");
    setQty("");
    setProductId(""); // Clear productId
    setSuggestedPrice("");
    barcodeInputRef.current.focus();
  };

  const handleQuantityChange = (e, index) => {
    const newQuantity = e.target.value;
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index].quantity = newQuantity;
      return newData;
    });
  };

  const handleDeleteRow = (index) => {
    setTableData((prevData) => prevData.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    // Filter out items with negative discount or quantity
    const validItems = tableData.filter(
      (item) => parseFloat(item.discount) >= 0 && parseFloat(item.quantity) >= 0
    );

    const totalAmount = tableData.reduce(
      (total, item) => total + parseFloat(item.amount),
      0
    );

    const totalQuantity = validItems.reduce(
      (total, item) => total + parseFloat(item.quantity),
      0
    );

    const totalDiscount = validItems.reduce(
      (total, item) =>
        total + parseFloat(item.discount) * parseFloat(item.quantity),
      0
    );

    setTotalAmount(totalAmount.toFixed(2));
    setTotalQuantity(totalQuantity);
    setTotalDiscount(totalDiscount.toFixed(2));
    setItemCount(validItems.length);
  };

  const handlePercentageChange = (value) => {
    setPercentage(value);
  };

  const handlePercentageEnter = () => {
    const enteredPercentage = parseFloat(percentage);

    if (isNaN(enteredPercentage) || enteredPercentage <= 0) {
      Swal.fire("Invalid Percentage", "Please enter a valid percentage", "warning");
      return;
    }

    const calculatedPrice = parseFloat(price) * (1 - enteredPercentage / 100);

    setPrice(calculatedPrice.toFixed(2)); // Update the price based on percentage
    setPercentage(""); // Clear the percentage input
    qtyInputRef.current.focus(); // Move focus to the quantity input
  };

  const handlePriceEnter = () => {
    const enteredPrice = parseFloat(price);
    const originalPrice = parseFloat(suggestedPrice);

    if (isWholesale || isDiscount) {
      // Allow any price in wholesale or discount mode
    } else {
      if (enteredPrice < lockedPrice || enteredPrice > originalPrice) {
        Swal.fire(
          "Invalid Price",
          `The price should be between the locked price of ${lockedPrice} and the MRP of ${originalPrice}`,
          "error"
        );
        priceInputRef.current.focus();
        return;
      }
    }
    setQty("1");
    qtyInputRef.current.focus();
  };

  const handleVirtualEnter = () => {
    if (document.activeElement === barcodeInputRef.current) {
      handleBarcodeEnter();
    } else if (document.activeElement === priceInputRef.current) {
      handlePriceEnter();
    } else if (document.activeElement === qtyInputRef.current) {
      handleQtyEnter();
    }
  };

  const handleNumericInput = (value) => {
    if (document.activeElement) {
      document.activeElement.value += value;
      document.activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const handleClear = () => {
    if (document.activeElement) {
      document.activeElement.value = "";
      document.activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  return (
    <div className="invoice-container">
      <div className="left-panel">
        <div className="header-info" id="header-info-invoice">
          <div>
            <label id="user-label">
              User: <span id="user_span">{user}</span>
            </label>
          </div>
          <div>
            <label id="user-label">
              Store: <span id="store_span">{store}</span>
            </label>
          </div>
          <div>
            <label id="user-label">
              Start Time: <span id="start_time_span">{startTime}</span>
            </label>
          </div>
        </div>

        <div className="scan-barcode">
          <input
            type="text"
            autoComplete="off"
            placeholder="Scan Barcode (F1)"
            className="barcode-input"
            value={barcode}
            onChange={handleBarcodeChange}
            onKeyDown={(e) => e.key === "Enter" && handleBarcodeEnter()}
            ref={barcodeInputRef}
          />
          <input
            type="text"
            autoComplete="off"
            placeholder="PRICE"
            className="price-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePriceEnter()}
            ref={priceInputRef}
            readOnly={isWholesale || isDiscount}
          />
          <input
            type="text"
            autoComplete="off"
            placeholder="%"
            style={{ width: "70px" }}
            className="percentage-input"
            onChange={(e) => handlePercentageChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePercentageEnter()}
            value={percentage}
          />
          <input
            type="text"
            autoComplete="off"
            placeholder="QTY"
            className="qty-input"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQtyEnter()}
            ref={qtyInputRef}
          />

          {suggestions.length > 0 && (
            <div
              id="suggestions_dropdown"
              className="suggestions-dropdown"
              ref={suggestionsRef}
            >
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <strong>
                    {suggestion.barcode}
                    <br />
                    {suggestion.productId} - {suggestion.productName} - RS:{" "}
                    {suggestion.mrpPrice}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="table-container" id="table_container_div">
          <table className="product-table" id="product-table-invoice">
            <thead>
              <tr>
                <th>Product ID</th> {/* Add Product ID Column */}
                <th>Name</th>
                <th style={{ textAlign: "center" }}>Cost</th>
                <th>MRP</th>
                <th>Discount</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Amount</th>
                <th style={{ width: "10px" }}>Actions</th> {/* Added header for actions */}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr
                  key={index}
                  className={
                    item.type === "return"
                      ? "return-row"
                      : item.type === "new"
                      ? "new-row"
                      : ""
                  }
                  style={
                    item.type === "return"
                      ? { backgroundColor: "#fcd8d8" } // Light red for return
                      : item.type === "new"
                      ? { backgroundColor: "#d8fcdb" } // Light green for new items
                      : {}
                  }
                >
                  <td>{item.productId}</td> {/* Render Product ID */}
                  <td>{item.name}</td>
                  <td style={{ textAlign: "center" }}>{item.cost}</td>
                  <td style={{ textAlign: "center" }}>{item.mrp}</td>
                  <td style={{ textAlign: "center" }}>{item.discount}</td>
                  <td style={{ textAlign: "center" }}>{item.rate}</td>
                  {/* Quantity Cell */}
                  <td
                    style={{ textAlign: "center" }}
                    onDoubleClick={() =>
                      // Optional: Implement quantity editing if needed
                      // setEditingCell({ rowIndex: index, field: "quantity" })
                      null
                    }
                  >
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: "center" }}>{item.amount}</td>
                  <td style={{ textAlign: "center" }}>
                    <img
                      src={removeImage}
                      alt="Delete"
                      onClick={() => {
                        Swal.fire({
                          title: "Are you sure?",
                          text: "You won't be able to revert this!",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#3085d6",
                          cancelButtonColor: "#d33",
                          confirmButtonText: "Yes, delete it!",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleDeleteRow(index); // Call the delete function if confirmed
                            Swal.fire(
                              "Deleted!",
                              "The row has been deleted.",
                              "success"
                            );
                          }
                        });
                      }}
                      style={{
                        cursor: "pointer",
                        width: "20px",
                        height: "20px",
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="total-display">
          <div className="item-count" style={{ marginRight: "40px" }}>
            <span>{itemCount} Item(s)</span>
          </div>
          <div className="total-quantity" style={{ marginRight: "40px" }}>
            <span>{totalQuantity} Quantity(s)</span>
          </div>
          <div className="total-discount" style={{ marginRight: "40px" }}>
            <span>Discount: {totalDiscount}</span>
          </div>
          <div className="total-amount">
            <span>{totalAmount}</span>
          </div>
        </div>

        <div className="footer-container">
          <div className="footer-options">
            <div className="option-box">
              <label htmlFor="wholesale">
                <img
                  src={wholesale}
                  alt="Wholesale"
                  style={{ marginLeft: "35px" }}
                />
                <br />
                <input
                  type="checkbox"
                  id="wholesale"
                  checked={isWholesale}
                  onChange={toggleWholesale}
                  style={{ marginLeft: "5px", marginRight: "5px" }}
                />
                <span>Wholesale (F9)</span>
              </label>
            </div>
            <div className="option-box">
              <label htmlFor="special">
                <img
                  src={discount}
                  alt="Special"
                  style={{ marginLeft: "25px" }}
                />
                <br />
                <input
                  type="checkbox"
                  id="special"
                  checked={isDiscount}
                  onChange={toggleDiscount}
                  style={{ marginLeft: "5px", marginRight: "5px" }}
                />
                <span>Special (F8)</span>
              </label>
            </div>
            <div className="option-box" onClick={handlePaymentModal}>
              <label htmlFor="payment">
                <img
                  src={payment}
                  alt="Payment"
                  style={{ marginLeft: "20px" }}
                />
                <br />
                <span>Payment (F10)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Numeric and Alphabet Keyboards */}
      <div className="right-panel">
        {/* Optional: Implement virtual keyboards if needed */}
      </div>

      {/* Render the PaymentModel */}
      <PaymentModel
        show={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        totalAmount={parseFloat(totalAmount || 0)}
        clearInvoiceTable={() => {
          setTableData([]);
          setTotalAmount("0.00");
          setTotalQuantity(0);
          setTotalDiscount("0.00");
          setItemCount(0);
        }}
        tableData={tableData} // Pass table data for invoice items
        user={user} // Pass UserName
        store={store} // Pass Store
      />
    </div>
  );
}

// Remove the unused 'store' prop validation
// If you plan to use 'store', implement its functionality accordingly
InvoiceNew.propTypes = {
  // store: PropTypes.string.isRequired, // Commented out or remove
};
