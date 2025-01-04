// Import necessary modules and components
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// Importing Modal Components
import OtherItemModel from "../models/OtherItemModel";
import ReturnModel from "../models/ReturnModel";
import StockModel from "../models/StockModel";
import ExpensesModel from "../models/ExpensesModel";
import PaymentModel from "./PaymentModel";
import Calculator from "../models/Calculator";
import TodaySales from "./TodaySales";
import TodayIssueBillCheck from "./TodayIssueBillCheck";
import CustomerBalance from "../CustomerFile/customerBalance";

// Importing CSS
import "../css1/invoice.css";

// Importing Images
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

// Define the base URL for the backend API
const API_BASE_URL = "http://localhost:5000"; // Adjust this if your backend runs on a different URL or port

export default function Invoice() {
  const location = useLocation();

  // User and Store Information
  const [user, setUser] = useState("Guest");
  const [store, setStore] = useState("Default Store");
  const [startTime, setStartTime] = useState("");

  // Product and Invoice Data
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
  const [productId, setProductId] = useState("");
  const [totalDiscount, setTotalDiscount] = useState("0.00");
  const [itemCount, setItemCount] = useState(0);
  const [activeKeyboard, setActiveKeyboard] = useState("numeric");
  const [editingCell, setEditingCell] = useState({
    rowIndex: null,
    field: null,
  });
  const [percentage, setPercentage] = useState("");
  const [imageLink, setImageLink] = useState(""); // Added imageLink state

  // References for Input Fields
  const priceInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  // Modal Visibility States
  const [isTodaySalesOpen, setIsTodaySalesOpen] = useState(false);
  const [isTodayIssueBillCheckOpen, setIsTodayIssueBillCheckOpen] =
    useState(false);
  const [isOtherItemModalOpen, setIsOtherItemModalOpen] = useState(false);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCustomerBalanceModalOpen, setIsCustomerBalanceModalOpen] =
    useState(false);

  // New State for Display Mode
  const [displayMode, setDisplayMode] = useState("Normal"); // "Normal" or "Promode"

  // Handlers to Open and Close Modals
  const handleTodaySalesClick = () => {
    setIsTodaySalesOpen(true);
  };

  const handleTodayIssueBillCheckClick = () => {
    setIsTodayIssueBillCheckOpen(true);
  };

  const handleCloseTodayIssueBillCheck = () => {
    setIsTodayIssueBillCheckOpen(false);
  };

  const handleCloseTodaySales = () => {
    setIsTodaySalesOpen(false);
  };

  const handleOtherItemClick = () => setIsOtherItemModalOpen(true);
  const handleCloseOtherItemModal = () => setIsOtherItemModalOpen(false);

  const handleExpensesClick = () => setIsExpensesModalOpen(true);
  const handleCloseExpensesModal = () => setIsExpensesModalOpen(false);

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

  const handleStockClick = () => {
    setIsStockModalOpen(true);
  };

  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
  };

  const handleCalculatorClick = () => setIsCalculatorOpen(true);
  const handleCloseCalculator = () => setIsCalculatorOpen(false);

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
    setImageLink(product.imageLink || ""); // Set imageLink

    barcodeInputRef.current.focus();
  };

  // Keyboard Shortcuts
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
          setIsCalculatorOpen(false);
          setIsCustomerBalanceModalOpen(false);
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

  // Initialize User and Store Information
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

  // Calculate Totals Whenever tableData Changes
  useEffect(() => {
    calculateTotals();
  }, [tableData]);

  // Handle Wholesale and Discount Toggle via Keyboard
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
  }, [isWholesale, isDiscount]);

  // Function to Add Other Item to Invoice
  const handleAddOtherItem = (item) => {
    const {
      productName,
      productCost,
      productMRP,
      productRate,
      qty,
      discount,
      imageLink,
    } = item;
    const amount = parseFloat(productRate) * parseFloat(qty);

    setTableData((prevData) => [
      ...prevData,
      {
        productId: item.productId || "",
        name: productName,
        cost: parseFloat(productCost).toFixed(2),
        mrp: parseFloat(productMRP).toFixed(2),
        discount: parseFloat(discount).toFixed(2),
        rate: parseFloat(productRate).toFixed(2),
        quantity: parseFloat(qty).toFixed(2),
        amount: amount.toFixed(2),
        barcode: item.barcode || "",
        imageLink: imageLink || "",
        type: "new",
      },
    ]);

    setIsOtherItemModalOpen(false);
  };

  // Function to Handle Return Button Click
  const handleReturnClick = () => {
    console.log("Return button clicked");
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
  };

  // Function to Add Return Item to Invoice
  const handleAddReturnItem = (item) => {
    const amount = -Math.abs(parseFloat(item.productSale) * parseFloat(item.qty));

    setTableData((prevData) => [
      ...prevData,
      {
        productId: item.productId || "",
        name: item.productName,
        cost: (-Math.abs(parseFloat(item.productCost))).toFixed(2),
        mrp: (-Math.abs(parseFloat(item.mrp))).toFixed(2),
        discount: (-Math.abs(parseFloat(item.discount))).toFixed(2),
        rate: (-Math.abs(parseFloat(item.productSale))).toFixed(2),
        quantity: (-Math.abs(parseFloat(item.qty))).toFixed(2),
        amount: amount.toFixed(2),
        type: "return",
        barcode: item.barcode || "",
        imageLink: item.imageLink || "",
      },
    ]);

    setIsReturnModalOpen(false);
  };

  // Function to Handle Quantity Change in Editable Cell
  const handleQuantityChange = (e, index) => {
    const newQuantity = e.target.value;
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index].quantity = newQuantity;
      return newData;
    });
  };

  // Function to Clear the Invoice Table
  const clearInvoiceTable = () => {
    setTableData([]);
    setTotalAmount("0.00");
    setTotalQuantity(0);
    setTotalDiscount("0.00");
    setItemCount(0);
  };

  // Function to Handle Quantity Editing with Enter Key
  const handleQuantityEditEnterKeyPress = async (e, index) => {
    if (e.key === "Enter") {
      const updatedQuantity = parseFloat(tableData[index].quantity);
      const barcode = tableData[index].barcode;
      const productId = tableData[index].productId;
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
            quantity: (-Math.abs(updatedQuantity)).toFixed(2),
            amount: (-Math.abs(positiveAmount)).toFixed(2),
          };
          return newData;
        });

        // Exit editing mode
        setEditingCell({ rowIndex: null, field: null });
        return;
      }

      // For non-negative rates, proceed with stock checking
      try {
        // Fetch available stock for the product
        const response = await axios.get(
          `${API_BASE_URL}/api/invoices/stock_quantity?barcode=${barcode}`
        );
        const availableStock = response.data.stockQuantity;

        // Calculate the total quantity across all rows for the same productId
        const totalQuantityInTable = tableData
          .filter((item) => item.productId === productId)
          .reduce((total, item, idx) => {
            if (idx === index) {
              return total;
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
            quantity: updatedQuantity.toFixed(2),
            amount: newAmount.toFixed(2),
            previousQuantity: updatedQuantity,
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

  // Function to Handle Barcode Input Change and Fetch Suggestions
  // Function to Handle Barcode Input Change and Fetch Suggestions
  const handleBarcodeChange = async (e) => {
    const input = e.target.value;
    setBarcode(input);

    if (input.length > 1) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/products/search_invoice_by_store?query=${input}&store=${store}`
        );

        const products = response.data;

        if (products.length === 0) {
          // Optionally, you can remove the Swal alert to avoid spamming alerts
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

  // Function to Handle Percentage Input Change
  const handlePercentageChange = (value) => {
    setPercentage(value);
  };

  // Function to Apply Percentage Discount
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

    setPrice(calculatedPrice.toFixed(2));
    setPercentage("");
    qtyInputRef.current.focus();
  };

  // Function to Validate and Set Price
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

  // Function to Handle Enter Key on Barcode Input
  const handleBarcodeEnter = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/products/search_by_barcode?query=${barcode}`
      );

      if (response.data.length > 0) {
        const product = response.data[0];
        setBarcode(product.barcode);
        setLockedPrice(product.lockedPrice);
        setSuggestedPrice(product.mrpPrice);
        setProductId(product.productId);
        setProductName(product.productName || "");
        setCostPrice(product.costPrice || "");
        setImageLink(product.imageLink || "");

        // Set the default price but allow user to edit
        if (isWholesale) {
          setPrice(product.wholesalePrice);
        } else if (isDiscount) {
          setPrice(product.discountPrice);
        } else {
          setPrice(product.mrpPrice);
        }

        setSuggestions([]);
        priceInputRef.current.focus();
      } else {
        Swal.fire(
          "Not Found",
          "Product with this barcode does not exist",
          "warning"
        );
      }
    } catch (error) {
      Swal.fire("Error", "Failed to fetch product by barcode", "error");
      console.error("Error fetching product by barcode:", error);
    }
  };

  // Function to Handle Enter Key on Quantity Input
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
        `${API_BASE_URL}/api/invoices/stock_quantity?barcode=${barcode}`
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
          productId,
          barcode,
          name: productName,
          cost: parseFloat(costPrice || 0).toFixed(2),
          mrp: parseFloat(suggestedPrice || 0).toFixed(2),
          discount: (
            parseFloat(suggestedPrice || 0) - enteredPrice
          ).toFixed(2),
          rate: enteredPrice.toFixed(2),
          quantity: requestedQuantity.toFixed(2),
          amount: (requestedQuantity * enteredPrice).toFixed(2),
          imageLink: imageLink || "",
          type: "new",
        },
      ]);

      // Clear input fields after adding item
      setProductName("");
      setBarcode("");
      setPrice("");
      setQty("");
      setProductId("");
      setSuggestedPrice("");
      setImageLink("");
      barcodeInputRef.current.focus();
    } catch (error) {
      Swal.fire("Error", "Failed to check stock availability.", "error");
      console.error("Error checking stock:", error);
    }
  };

  // Function to Delete a Row from the Invoice Table
  const handleDeleteRow = (index) => {
    setTableData((prevData) => prevData.filter((_, i) => i !== index));
  };

  // Function to Calculate Totals
  const calculateTotals = () => {
    const validItems = tableData.filter(
      (item) =>
        parseFloat(item.discount) >= 0 && parseFloat(item.quantity) >= 0
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

  // Function to Handle Virtual Keyboard Enter
  const handleVirtualEnter = () => {
    if (document.activeElement === barcodeInputRef.current) {
      handleBarcodeEnter();
    } else if (document.activeElement === priceInputRef.current) {
      handlePriceEnter();
    } else if (document.activeElement === qtyInputRef.current) {
      handleQtyEnter();
    }
  };

  // Function to Handle Checkbox Changes
  const handleCheckboxChange = (type) => {
    if (type === "wholesale") {
      setIsWholesale(!isWholesale);
      setIsDiscount(false);
    } else if (type === "discount") {
      setIsDiscount(!isDiscount);
      setIsWholesale(false);
    }
  };

  // Function to Handle Suggestion Click
  const handleSuggestionClick = (suggestion) => {
    setBarcode(suggestion.barcode);
    setProductId(suggestion.productId || "");
    setCostPrice(suggestion.costPrice || "");
    setLockedPrice(suggestion.lockedPrice || "");
    setProductName(suggestion.productName || "");
    setSuggestedPrice(suggestion.mrpPrice || "");
    setImageLink(suggestion.imageLink || ""); // Set imageLink

    if (isWholesale) {
      setPrice(suggestion.wholesalePrice || suggestion.mrpPrice);
    } else if (isDiscount) {
      setPrice(suggestion.discountPrice || suggestion.mrpPrice);
    } else {
      setPrice(suggestion.mrpPrice || "");
    }

    setSuggestions([]);

    setTimeout(() => {
      if (priceInputRef.current) {
        priceInputRef.current.focus();
        priceInputRef.current.select();
      }
    }, 100);
  };

  // Functions to Handle Virtual Keyboard Inputs
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
        {/* Header Information */}
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

        {/* Barcode Scanning Section */}
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
            style={{ width: "70px" , padding:"8px", borderRadius:"5px"}}
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

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div id="suggestions_dropdown" className="suggestions-dropdown">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.productId}
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

        {/* Display Mode Selector */}
        <div
          className="display-mode-selector"
          style={{ marginBottom: "20px" }}
        >
          <label style={{ marginRight: "20px" }}>
            <input
              type="radio"
              value="Normal"
              checked={displayMode === "Normal"}
              onChange={() => setDisplayMode("Normal")}
            />
            Normal
          </label>
          <label>
            <input
              type="radio"
              value="Promode"
              checked={displayMode === "Promode"}
              onChange={() => setDisplayMode("Promode")}
            />
            Promode
          </label>
        </div>

        {/* Conditional Rendering: Table or Cards */}
        {displayMode === "Normal" ? (
          <div className="table-container" id="table_container_div">
            <table className="product-table" id="product-table-invoice">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th style={{ textAlign: "center", display: "none" }}>
                    Cost
                  </th>
                  <th>MRP</th>
                  <th>Discount</th>
                  <th>Rate</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Actions</th>
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
                        ? { backgroundColor: "#fcd8d8" }
                        : item.type === "new"
                        ? { backgroundColor: "#d8fcdb" }
                        : {}
                    }
                  >
                    <td>{item.productId}</td>
                    <td>{item.name}</td>
                    <td style={{ textAlign: "center", display: "none" }}>
                      {item.cost}
                    </td>
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
                          }
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
                    {/* Actions Cell */}
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
                              handleDeleteRow(index);
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
        ) : (
          <div
            id="invoice_promode"
            className="card-container"
            style={{ cursor: "pointer" }}
          >
            {tableData.map((item, index) => (
              <div
                key={index}
                className="product-card"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  margin: "10px",
                  width: "180px",
                  boxShadow: "2px 2px 12px rgba(0,0,0,0.1)",
                  backgroundColor: "#fff",
                  position: "relative", // Added to position the delete icon
                }}
              >
                {/* Delete Icon */}
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
                        handleDeleteRow(index);
                        Swal.fire(
                          "Deleted!",
                          "The item has been deleted.",
                          "success"
                        );
                      }
                    });
                  }}
                  style={{
                    cursor: "pointer",
                    width: "20px",
                    height: "20px",
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                  }}
                />
                {item.imageLink ? (
                  <img
                    src={
                      item.imageLink.startsWith("data:image")
                        ? item.imageLink
                        : item.imageLink.startsWith("http")
                        ? item.imageLink
                        : `${API_BASE_URL}/${item.imageLink}`
                    }
                    alt={item.name}
                    loading="lazy"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      margin: "0 auto",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${API_BASE_URL}/images/placeholder.png`;
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      color: "#888",
                      margin: "0 auto",
                    }}
                  >
                    No Image
                  </div>
                )}
                <h3
                  style={{
                    fontSize: "12px",
                    margin: "10px 0 5px 0",
                    textAlign: "center",
                  }}
                >
                  {item.name}
                </h3>
                <p
                  style={{
                    margin: "5px 0",
                    textAlign: "center",
                    fontSize: "10px",
                    display: "none",
                  }}
                >
                  MRP: Rs. {item.mrp}
                </p>
                <p
                  style={{
                    margin: "5px 0",
                    textAlign: "center",
                    fontSize: "10px",
                    display: "none",
                  }}
                >
                  Discount: Rs. {item.discount}
                </p>
                <p
                  style={{
                    margin: "5px 0",
                    textAlign: "center",
                    fontSize: "10px",
                  }}
                >
                  Rate: Rs. {item.rate}
                </p>
                {/* Quantity Cell */}
                <div
                  style={{
                    textAlign: "center",
                    margin: "5px 0",
                    cursor: "pointer",
                    fontSize: "10px",
                  }}
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
                      }
                      onBlur={() =>
                        setEditingCell({ rowIndex: null, field: null })
                      }
                      style={{ width: "50px", textAlign: "center" }}
                      autoFocus
                    />
                  ) : (
                    <span>Qty: {item.quantity}</span>
                  )}
                </div>
                <p
                  style={{
                    margin: "5px 0",
                    textAlign: "center",
                    fontSize: "10px",
                  }}
                >
                  Amount: Rs. {item.amount}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Product Information (Hidden) */}
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

        {/* Totals Display */}
        <div className="total-display">
          <div className="item-count" style={{ marginRight: "40px" }}>
            <span>{itemCount} Item(s)</span>
          </div>
          <div className="total-quantity" style={{ marginRight: "40px" }}>
            <span>{totalQuantity} Quantity(s)</span>
          </div>
          <div className="total-discount" style={{ marginRight: "40px" }}>
            <span>Discount: Rs. {totalDiscount}</span>
          </div>
          <div className="total-amount">
            <span>Total: Rs. {totalAmount}</span>
          </div>
        </div>

        {/* Footer Options */}
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
                <img
                  src={dayend}
                  alt="Day End"
                  style={{ marginLeft: "5px" }}
                />
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

      {/* Right Side - Virtual Keyboards */}
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

        {/* Action Buttons with Icons */}
        <div className="button-grid">
          <button onClick={handleOtherItemClick}>
            <img
              src={otheritem}
              alt="Other Item"
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Other Item (F4)
          </button>
          <button>
            <img
              src={quatation}
              alt="Quotation List"
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Quotation List
          </button>
          <button onClick={handleOpenCustomerBalanceModal}>
            <img
              src={customer}
              alt="Customer Balance"
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Customer Balance
          </button>

          <button onClick={handleTodayIssueBillCheckClick}>
            <img
              src={bill}
              alt="Issue Bill Check"
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Issue Bill Check
          </button>
          <button onClick={handleExpensesClick}>
            <img
              src={expensesImage}
              alt="My Expenses"
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            My Expenses (F3)
          </button>
          <button onClick={handleTodaySalesClick}>
            <img
              src={salesimage}
              alt="Today Sale"
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Today Sale
          </button>
          <button onClick={handleCalculatorClick}>
            <img
              src={calculatorImage}
              alt="Calculator"
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Calculator
          </button>
        </div>

        {/* Modal Components */}
        <ExpensesModel
          show={isExpensesModalOpen}
          onClose={handleCloseExpensesModal}
          user={user}
          store={store}
          onAdd={() => {}}
        />

        <OtherItemModel
          show={isOtherItemModalOpen}
          onClose={handleCloseOtherItemModal}
          onAdd={handleAddOtherItem}
        />

        <ReturnModel
          show={isReturnModalOpen}
          onClose={handleCloseReturnModal}
          onAdd={handleAddReturnItem}
        />

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

        <TodaySales
          show={isTodaySalesOpen}
          onClose={handleCloseTodaySales}
          store={store} // Pass the store prop
        />

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
