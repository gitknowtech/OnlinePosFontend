import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import OtherItemModel from "../models/OtherItemModel";
import ReturnModel from "../models/ReturnModel";
import StockModel from "../models/StockModel";
import ExpensesModel from "../models/ExpensesModel";
import "../css1/invoice.css";
import PaymentModel from "./PaymentModel";
import Calculator from "../models/Calculator";
import TodaySales from "./TodaySales";
import TodayIssueBillCheck from "./TodayIssueBillCheck";



// Ensure these image paths are correct in your project structure
import productimage from "../assets/images/products.png";
import bill from "../assets/images/bill.png";
import customer from "../assets/images/customer.png";
import expensesImage from "../assets/images/expenses.png";
import otheritem from "../assets/images/otheritem.png";
import quatation from "../assets/images/quotation.png";
import returnimage from "../assets/images/return.png";
import salesimage from "../assets/images/sales.png";
import dayend from "../assets/images/end.png";
import payment from "../assets/images/payment.png";
import discount from "../assets/images/discount.png";
import wholesale from "../assets/images/wholesale.png";
import removeImage from "../assets/images/remove.png";
import calculatorImage from "../assets/icons/calculator.png";
import CustomerBalance from "../CustomerFile/customerBalance";

export default function Invoice() {
  const location = useLocation();
  const [user, setUser] = useState("Guest");
  const [store, setStore] = useState("Default Store");
  const [startTime, setStartTime] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [qty, setQty] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [tableData, setTableData] = useState([]);
  const [productName, setProductName] = useState("");
  const [lockedPrice, setLockedPrice] = useState(null);
  const [totalAmount, setTotalAmount] = useState("0.00");
  const [isWholesale, setIsWholesale] = useState(false);
  const [isDiscount, setIsDiscount] = useState(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [productId, setProductId] = useState(""); // State to store productId
  const [totalDiscount, setTotalDiscount] = useState("0.00");
  const [itemCount, setItemCount] = useState(0);
  const [activeKeyboard, setActiveKeyboard] = useState("numeric");
  const [editingCell, setEditingCell] = useState({
    rowIndex: null,
    field: null,
  });
  const [percentage, setPercentage] = useState(""); // State for percentage input

  const priceInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  const [isTodaySalesOpen, setIsTodaySalesOpen] = useState(false); // State for modal

  const handleTodaySalesClick = () => {
    setIsTodaySalesOpen(true);
  };

  const [isTodayIssueBillCheckOpen, setIsTodayIssueBillCheckOpen] =
    useState(false); // State for the modal

  const handleTodayIssueBillCheckClick = () => {
    setIsTodayIssueBillCheckOpen(true);
  };

  const handleCloseTodayIssueBillCheck = () => {
    setIsTodayIssueBillCheckOpen(false);
  };

  const handleCloseTodaySales = () => {
    setIsTodaySalesOpen(false);
  };


  // OtherItem model related contents
  const [isOtherItemModalOpen, setIsOtherItemModalOpen] = useState(false);
  const handleOtherItemClick = () => setIsOtherItemModalOpen(true);
  const handleCloseOtherItemModal = () => setIsOtherItemModalOpen(false);
  // State to control expenses modal visibility
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const handleExpensesClick = () => setIsExpensesModalOpen(true);
  const handleCloseExpensesModal = () => setIsExpensesModalOpen(false);
  // State to control the visibility of the ReturnModel
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  // State to control the visibility of the StockModel
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const handleCalculatorClick = () => setIsCalculatorOpen(true);
  const handleCloseCalculator = () => setIsCalculatorOpen(false);  
  const [isCustomerBalanceModalOpen, setIsCustomerBalanceModalOpen] =
  useState(false);


  const handleOpenCustomerBalanceModal = () => {
    setIsCustomerBalanceModalOpen(true);
  };

  const handleCloseCustomerBalanceModal = () => {
    setIsCustomerBalanceModalOpen(false);
  };


  const handleOpenPaymentModal = () => {
    console.log("Payment button clicked");
    console.log("tableData:", tableData); // Check tableData contents
    if (tableData.length === 0) {
      Swal.fire(
        "Error",
        "Please add products to the table before proceeding to payment.",
        "error"
      );
      return;
    }

    setIsPaymentModalOpen(false); // Force a rerender
    setTimeout(() => setIsPaymentModalOpen(true), 0);
  };

  const handleClosePaymentModal = () => setIsPaymentModalOpen(false);

  // Function to open the StockModel
  const handleStockClick = () => {
    setIsStockModalOpen(true);
  };

  // Function to close the StockModel
  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
  };

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "F1":
          e.preventDefault();
          barcodeInputRef.current?.focus();
          break;
        case "F4":
          e.preventDefault();
          setIsOtherItemModalOpen((prev) => !prev);
          break;
        case "F7":
          e.preventDefault();
          handleReturnClick();
          break;
        case "F3":
          e.preventDefault();
          setIsExpensesModalOpen((prev) => !prev);
          break;
        case "F6":
          e.preventDefault();
          setIsStockModalOpen((prev) => !prev);
          break;
        case "F10":
          e.preventDefault();
          handleOpenPaymentModal();
          break;
        case "Escape":
          e.preventDefault();
          setIsOtherItemModalOpen(false);
          setIsExpensesModalOpen(false);
          setIsReturnModalOpen(false);
          setIsStockModalOpen(false);
          setIsPaymentModalOpen(false);
          setIsTodaySalesOpen(false);
          setIsTodayIssueBillCheckOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
      if (e.key === "F9") {
        e.preventDefault(); // Prevent default browser action
        setIsWholesale((prev) => !prev); // Toggle wholesale checkbox
        if (!isWholesale) {
          setIsDiscount(false); // Ensure discount is unchecked if wholesale is toggled on
        }
      } else if (e.key === "F8") {
        e.preventDefault(); // Prevent default browser action
        setIsDiscount((prev) => !prev); // Toggle discount checkbox
        if (!isDiscount) {
          setIsWholesale(false); // Ensure wholesale is unchecked if discount is toggled on
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isWholesale, isDiscount]); // Add dependencies to keep the hook up-to-date

  const handleAddOtherItem = (item) => {
    const { productName, productCost, productMRP, productRate, qty, discount } =
      item;
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

    setIsOtherItemModalOpen(false); // Close the modal after adding the item
  };

  // Function to handle when the "Return" button is clicked
  const handleReturnClick = () => {
    console.log("Return button clicked"); // Debugging log
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
  };

  const handleAddReturnItem = (item) => {
    // Adjust the data to have negative values
    const amount = -Math.abs(
      parseFloat(item.productSale) * parseFloat(item.qty)
    );

    setTableData((prevData) => [
      ...prevData,
      {
        productId: item.productId, // Add productId
        name: item.productName,
        cost: (-Math.abs(parseFloat(item.productCost))).toFixed(2),
        mrp: -Math.abs(parseFloat(item.mrp).toFixed(2)), // Ensure MRP retains original value
        discount: (-Math.abs(parseFloat(item.discount))).toFixed(2),
        rate: (-Math.abs(parseFloat(item.productSale))).toFixed(2),
        quantity: (-Math.abs(parseFloat(item.qty))).toFixed(2),
        amount: amount.toFixed(2),
        type: "return", // Add a 'type' field to mark this as a return
      },
    ]);

    setIsReturnModalOpen(false);
  };

  const handleQuantityChange = (e, index) => {
    const newQuantity = e.target.value;
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index].quantity = newQuantity;
      return newData;
    });
  };

  const clearInvoiceTable = () => {
    setTableData([]); // Clears the table data
    setTotalAmount("0.00");
    setTotalQuantity(0);
    setTotalDiscount("0.00");
    setItemCount(0);
  };

  const handleQuantityEditEnterKeyPress = async (e, index) => {
    if (e.key === "Enter") {
      const updatedQuantity = parseFloat(tableData[index].quantity);
      const barcode = tableData[index].barcode; // Retrieve barcode from row data
      const productId = tableData[index].productId; // Retrieve productId from row data
      const productName = tableData[index].name;
      const rate = parseFloat(tableData[index].rate);

      // Save the old values before proceeding
      const previousQuantity =
        tableData[index].previousQuantity || tableData[index].quantity;
      const previousAmount =
        tableData[index].previousAmount || tableData[index].amount;

      // Validate quantity
      if (isNaN(updatedQuantity)) {
        Swal.fire(
          "Invalid Quantity",
          "Please enter a valid quantity",
          "warning"
        );
        return;
      }

      // If the rate is negative, assume it's a return and skip stock checking
      if (rate < 0) {
        // Calculate the amount with positive quantity first
        const positiveAmount = rate * Math.abs(updatedQuantity);

        // Ensure both quantity and amount are negative
        setTableData((prevData) => {
          const newData = [...prevData];
          newData[index] = {
            ...newData[index],
            quantity: (-Math.abs(updatedQuantity)).toFixed(2), // Make quantity negative and format
            amount: (-Math.abs(positiveAmount)).toFixed(2), // Make amount negative and format
          };
          return newData;
        });

        // Exit editing mode
        setEditingCell({ rowIndex: null, field: null });
        return; // Skip further checks
      }

      // For non-negative rates, proceed with stock checking
      try {
        // Fetch available stock for the product
        const response = await axios.get(
          `http://localhost:5000/api/invoices/stock_quantity?barcode=${barcode}`
        );
        const availableStock = response.data.stockQuantity;

        // Calculate the total quantity across all rows for the same productId
        const totalQuantityInTable = tableData
          .filter((item) => item.productId === productId)
          .reduce((total, item, idx) => {
            if (idx === index) {
              return total; // Exclude the current row's quantity
            }
            return total + parseFloat(item.quantity);
          }, 0);

        // Total quantity after updating the current row
        const totalQuantity = totalQuantityInTable + updatedQuantity;

        // Check if the total quantity exceeds the available stock
        if (totalQuantity > availableStock) {
          Swal.fire(
            "Insufficient Stock",
            `Only ${availableStock} units of ${productName} are available in stock. Currently in table: ${totalQuantityInTable} units.`,
            "warning"
          ).then(() => {
            // Restore the previous quantity and amount
            setTableData((prevData) => {
              const newData = [...prevData];
              newData[index] = {
                ...newData[index],
                quantity: previousQuantity.toFixed(2),
                amount: previousAmount.toFixed(2),
              };
              return newData;
            });

            // Exit editing mode
            setEditingCell({ rowIndex: null, field: null });
          });
          return;
        }

        // Calculate the new amount
        const newAmount = rate * updatedQuantity;

        // Update the quantity and amount
        setTableData((prevData) => {
          const newData = [...prevData];
          newData[index] = {
            ...newData[index],
            quantity: updatedQuantity.toFixed(2), // Ensure float with two decimals
            amount: newAmount.toFixed(2), // Ensure float with two decimals
            previousQuantity: updatedQuantity, // Save as new previous value
            previousAmount: newAmount,
          };
          return newData;
        });

        // Exit editing mode
        setEditingCell({ rowIndex: null, field: null });
      } catch (error) {
        Swal.fire("Error", "Failed to fetch stock quantity", "error");
        console.error("Error fetching stock quantity:", error);
      }
    }
  };

  const handleBarcodeChange = async (e) => {
    const input = e.target.value;
    setBarcode(input);

    if (input.length > 1) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/search_invoice_by_store?query=${input}&store=${store}`
        );

        const products = response.data;

        if (products.length === 0) {
          Swal.fire(
            "Not Found",
            "No products found for this barcode.",
            "warning"
          );
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

  const handlePercentageChange = (value) => {
    setPercentage(value);
  };

  const handlePercentageEnter = () => {
    const enteredPercentage = parseFloat(percentage);

    if (isNaN(enteredPercentage) || enteredPercentage <= 0) {
      Swal.fire(
        "Invalid Percentage",
        "Please enter a valid percentage",
        "warning"
      );
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

    if (!isWholesale && !isDiscount) {
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

  const handleBarcodeEnter = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/products/search_by_barcode?query=${barcode}`
      );

      if (response.data.length > 0) {
        const product = response.data[0];
        setBarcode(product.barcode);
        setLockedPrice(product.lockedPrice);
        setSuggestedPrice(product.mrpPrice);
        setProductId(product.productId); // Save productId to state
        setBarcode(product.barcode);

        // Set the default price but allow user to edit
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
            const updatedAmount =
              updatedQuantity * parseFloat(existingItem.rate);

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
        Swal.fire(
          "Not Found",
          "Product with this barcode does not exist",
          "warning"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Failed to fetch product by barcode", error.message);
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

    try {
      // Fetch available stock for the product
      const response = await axios.get(
        `http://localhost:5000/api/invoices/stock_quantity?barcode=${barcode}`
      );

      const availableQuantity = response.data.stockQuantity;

      // Calculate the total quantity for the same product ID across all rows
      const existingQuantity = tableData
        .filter((item) => item.productId === productId)
        .reduce((total, item) => total + parseFloat(item.quantity), 0);

      // Total quantity after adding the new requested quantity
      const totalQuantity = existingQuantity + requestedQuantity;

      // Check if the total quantity exceeds available stock
      if (totalQuantity > availableQuantity) {
        Swal.fire(
          "Insufficient Stock",
          `Only ${availableQuantity} units are available in stock. Currently in table: ${existingQuantity} units.`,
          "error"
        );
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
    } catch (error) {
      Swal.fire("Error", "Failed to check stock availability.", "error");
      console.error("Error checking stock:", error);
    }
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

  const handleVirtualEnter = () => {
    if (document.activeElement === barcodeInputRef.current) {
      handleBarcodeEnter();
    } else if (document.activeElement === priceInputRef.current) {
      handlePriceEnter();
    } else if (document.activeElement === qtyInputRef.current) {
      handleQtyEnter();
    }
  };

  const handleCheckboxChange = (type) => {
    if (type === "wholesale") {
      setIsWholesale(!isWholesale);
      setIsDiscount(false);
    } else if (type === "discount") {
      setIsDiscount(!isDiscount);
      setIsWholesale(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
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
      if (priceInputRef.current) {
        priceInputRef.current.focus();
        priceInputRef.current.select(); // Highlight the price for easy overwrite
      }
    }, 100); // Delay ensures focus works even after state updates
  };

  const handleNumericInput = (value) => {
    if (document.activeElement) {
      document.activeElement.value += value;
      document.activeElement.dispatchEvent(
        new Event("input", { bubbles: true })
      );
    }
  };

  const handleAlphabetInput = (value) => {
    if (document.activeElement) {
      document.activeElement.value += value;
      document.activeElement.dispatchEvent(
        new Event("input", { bubbles: true })
      );
    }
  };

  const handleClear = () => {
    if (document.activeElement) {
      document.activeElement.value = "";
      document.activeElement.dispatchEvent(
        new Event("input", { bubbles: true })
      );
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
            <div id="suggestions_dropdown" className="suggestions-dropdown">
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
                      setEditingCell({ rowIndex: index, field: "quantity" })
                    }
                  >
                    {editingCell.rowIndex === index &&
                    editingCell.field === "quantity" ? (
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(e, index)}
                        onKeyDown={(e) =>
                          handleQuantityEditEnterKeyPress(e, index)
                        } // Call the async function here
                        onBlur={() =>
                          setEditingCell({ rowIndex: null, field: null })
                        }
                        style={{ width: "50px", textAlign: "center" }}
                        autoFocus
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{item.amount}</td>
                  <td style={{ width: "10px" }}>
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

        <div className="product-info" style={{ display: "none" }}>
          {productName && (
            <div>
              <strong>Product Name:</strong> {productName}
            </div>
          )}
          {costPrice && (
            <div>
              <strong>Cost Price:</strong> {costPrice}
            </div>
          )}
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
                  onChange={() => handleCheckboxChange("wholesale")}
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
                  onChange={() => handleCheckboxChange("discount")}
                  style={{ marginLeft: "5px", marginRight: "5px" }}
                />
                <span>Special (F8)</span>
              </label>
            </div>
            <div className="option-box" onClick={handleReturnClick}>
              <label htmlFor="return">
                <img
                  src={returnimage}
                  alt="Return"
                  style={{ marginLeft: "5px" }}
                />
                <br />
                <span>Return (F7)</span>
              </label>
            </div>
            <div className="option-box" onClick={handleStockClick}>
              <label htmlFor="stock">
                <img
                  src={productimage}
                  alt="Stock"
                  style={{ marginLeft: "5px" }}
                />
                <br />
                <span>Stock (F6)</span>
              </label>
            </div>
            <div className="option-box">
              <label htmlFor="dayend">
                <img src={dayend} alt="Day End" style={{ marginLeft: "5px" }} />
                <br />
                <span>Day End</span>
              </label>
            </div>
            <div className="option-box" onClick={handleOpenPaymentModal}>
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
        <div className="display-panels" style={{ display: "none" }}>
          <div className="keyboard-toggle">
            <button
              onClick={() => setActiveKeyboard("numeric")}
              className={activeKeyboard === "numeric" ? "active" : ""}
            >
              Numeric
            </button>
            <button
              onClick={() => setActiveKeyboard("alphabet")}
              className={activeKeyboard === "alphabet" ? "active" : ""}
            >
              Alphabet
            </button>
          </div>

          {/* Numeric Keyboard */}
          {activeKeyboard === "numeric" && (
            <div className="numeric-keypad">
              <div className="keypad-row">
                {[1, 2, 3].map((num) => (
                  <button key={num} onClick={() => handleNumericInput(num)}>
                    {num}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {[4, 5, 6].map((num) => (
                  <button key={num} onClick={() => handleNumericInput(num)}>
                    {num}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {[7, 8, 9].map((num) => (
                  <button key={num} onClick={() => handleNumericInput(num)}>
                    {num}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                <button onClick={handleClear}>Clear</button>
                <button onClick={() => handleNumericInput(0)}>0</button>
                <button onClick={handleVirtualEnter}>Enter</button>
              </div>
            </div>
          )}

          {/* Alphabet Keyboard */}
          {activeKeyboard === "alphabet" && (
            <div id="alphabet-keypad">
              <div className="keypad-row">
                {["A", "B", "C", "D", "E", "F"].map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleAlphabetInput(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {["G", "H", "I", "J", "K", "L"].map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleAlphabetInput(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {["M", "N", "O", "P", "Q", "R"].map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleAlphabetInput(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {["S", "T", "U", "V", "W", "X"].map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleAlphabetInput(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {["Y", "Z"].map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleAlphabetInput(letter)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <button onClick={handleClear}>Clear</button>
            </div>
          )}
        </div>

        <div className="button-grid">
          {/* Action buttons with icons */}
          <button onClick={handleOtherItemClick}>
            <img
              src={otheritem}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Other Item (F4)
          </button>
          <button>
            <img
              src={quatation}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Quotation List
          </button>
          <button onClick={handleOpenCustomerBalanceModal}>
          <img
            src={customer}
            style={{ width: "20px", height: "20px", marginRight: "5px" }}
          />
          Customer Balance
        </button>

          <button onClick={handleTodayIssueBillCheckClick}>
            <img
              src={bill}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Issue Bill Check
          </button>
          <button onClick={handleExpensesClick}>
            <img
              src={expensesImage}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            My Expenses (F3)
          </button>
          <button onClick={handleTodaySalesClick}>
            <img
              src={salesimage}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Today Sale
          </button>
          <button onClick={handleCalculatorClick}>
            <img
              src={calculatorImage}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Calculater
          </button>
        </div>

        <ExpensesModel
          show={isExpensesModalOpen}
          onClose={handleCloseExpensesModal}
          user={user}
          store={store}
          onAdd={() => {}}
        />

        {/* Render the OtherItemModel */}
        <OtherItemModel
          show={isOtherItemModalOpen}
          onClose={handleCloseOtherItemModal}
          onAdd={handleAddOtherItem}
        />

        {/* Render the ReturnModel */}
        <ReturnModel
          show={isReturnModalOpen}
          onClose={handleCloseReturnModal}
          onAdd={handleAddReturnItem}
        />

        {/* Render the StockModel */}
        <StockModel
          show={isStockModalOpen}
          onClose={handleCloseStockModal}
          onProductSelect={handleProductSelect}
        />

        <PaymentModel
          show={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          totalAmount={parseFloat(totalAmount || 0)}
          clearInvoiceTable={clearInvoiceTable}
          tableData={tableData} // Pass table data for invoice items
          user={user} // Pass UserName
          store={store} // Pass Store
        />

        <Calculator show={isCalculatorOpen} onClose={handleCloseCalculator} />

        {/* Include the TodaySales modal */}
        <TodaySales
          show={isTodaySalesOpen}
          onClose={handleCloseTodaySales}
          store={store} // Pass the store prop
        />

        {/* Include the TodayIssueBillCheck modal */}
        <TodayIssueBillCheck
          show={isTodayIssueBillCheckOpen}
          onClose={handleCloseTodayIssueBillCheck}
          store={store} // Pass the store prop
        />

          {/* Customer Balance Modal */}
      {isCustomerBalanceModalOpen && (
        <div id="modal-overlay-customer-balance-invoice">
          <div id="modal-content-customer-balance-invoice">
          <button
              id="close-modal-button-customer-balance"
              onClick={handleCloseCustomerBalanceModal}
            >
              X
            </button>
            <CustomerBalance /> {/* Render the CustomerBalance component */}
            
          </div>
          
        </div>
      )}

      </div>
    </div>
  );
}
