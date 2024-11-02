import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import OtherItemModel from "../models/OtherItemModel";
import ExpensesModel from "../models/ExpensesModel";
import "../css1/invoice.css";

// Ensure these image paths are correct in your project structure
import productimage from "../assets/images/products.png";
import bill from "../assets/images/bill.png";
import customer from "../assets/images/customer.png";
import expensesImage from "../assets/images/expenses.png";
import monthsales from "../assets/images/month.png";
import otheritem from "../assets/images/otheritem.png";
import quatation from "../assets/images/quotation.png";
import returnimage from "../assets/images/return.png";
import salesimage from "../assets/images/sales.png";
import dayend from "../assets/images/end.png";
import discount from "../assets/images/discount.png";
import wholesale from "../assets/images/wholesale.png";
import removeImage from "../assets/images/remove.png";
import logout from "../assets/images/user-logout.png";

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
  const [totalDiscount, setTotalDiscount] = useState("0.00");
  const [itemCount, setItemCount] = useState(0);
  const [activeKeyboard, setActiveKeyboard] = useState("numeric");
  const [editingCell, setEditingCell] = useState({ rowIndex: null, field: null });

  const priceInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const barcodeInputRef = useRef(null);


  // OtherItem model related contents 
  const [isOtherItemModalOpen, setIsOtherItemModalOpen] = useState(false);

  const handleOtherItemClick = () => setIsOtherItemModalOpen(true);
  const handleCloseOtherItemModal = () => setIsOtherItemModalOpen(false);

  const handleAddOtherItem = (item) => {
    const { productName, productCost, productSale, qty, discount } = item;
    const amount = parseFloat(productSale) * parseFloat(qty);
  
    setTableData((prevData) => [
      ...prevData,
      {
        name: productName,
        cost: parseFloat(productCost).toFixed(2),
        mrp: parseFloat(productSale).toFixed(2),
        discount: discount,
        rate: parseFloat(productSale).toFixed(2),
        quantity: parseFloat(qty).toFixed(2),
        amount: amount.toFixed(2),
      },
    ]);
  
    setIsOtherItemModalOpen(false);
  };

  //Expenses Model Related Content

  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [ setExpenses] = useState([]);

  const handleExpensesClick = () => setIsExpensesModalOpen(true);
  const handleCloseExpensesModal = () => setIsExpensesModalOpen(false);

  const handleAddExpense = (newExpense) => {
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
  };
  


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


  const handleQuantityChange = (e, index) => {
    const newQuantity = e.target.value;
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index].quantity = newQuantity;
      return newData;
    });
  };
  

  const handleQuantityEnterKeyPress = (e, index) => {
    if (e.key === "Enter") {
      let quantity = parseFloat(tableData[index].quantity);
      if (isNaN(quantity) || quantity <= 0) {
        Swal.fire("Invalid Quantity", "Please enter a valid quantity", "warning");
        return;
      }
      const rate = parseFloat(tableData[index].rate) || 0;
      const amount = quantity * rate;
  
      setTableData((prevData) => {
        const newData = [...prevData];
        newData[index].quantity = quantity.toString();
        newData[index].amount = amount.toFixed(2);
        return newData;
      });
  
      // Exit edit mode
      setEditingCell({ rowIndex: null, field: null });
  
      // Refocus on the barcode input
      barcodeInputRef.current.focus();
    }
  };


  const handleBarcodeChange = async (e) => {
    const input = e.target.value;
    setBarcode(input);

    if (input.length > 1) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/search?query=${input}`
        );
        setSuggestions(response.data);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch product suggestions", error);
      }
    } else {
      setSuggestions([]);
    }
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
        `http://localhost:5000/api/products/search?query=${barcode}`
      );

      if (response.data.length > 0) {
        const product = response.data[0];
        setBarcode(product.barcode);
        setCostPrice(product.costPrice);
        setLockedPrice(product.lockedPrice);
        setProductName(product.productName);
        setSuggestedPrice(product.mrpPrice);

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
      Swal.fire("Error", "Failed to fetch product by barcode", error);
    }
  };







  const handleQtyEnter = () => {
    if (qty) {
      const discount = parseFloat(suggestedPrice) - parseFloat(price);
      const amount = parseFloat(price) * parseFloat(qty);

      setTableData((prevData) => [
        ...prevData,
        {
          name: productName,
          cost: costPrice.toFixed(2),
          mrp: suggestedPrice,
          discount: discount.toFixed(2),
          rate: price,
          quantity: qty,
          amount: amount.toFixed(2),
        },
      ]);

      setProductName("");
      setBarcode("");
      setPrice("");
      setQty("");
      setSuggestedPrice("");
      barcodeInputRef.current.focus();
    }
  };





  const handleDeleteRow = (index) => {
    setTableData((prevData) => prevData.filter((_, i) => i !== index));
  };




  const calculateTotals = () => {
    const totalAmount = tableData.reduce(
      (total, item) => total + parseFloat(item.amount),
      0
    );

    const totalQuantity = tableData.reduce(
      (total, item) => total + parseFloat(item.quantity),
      0
    );

    const totalDiscount = tableData.reduce(
      (total, item) =>
        total + parseFloat(item.discount) * parseFloat(item.quantity),
      0
    );

    setTotalAmount(totalAmount.toFixed(2));
    setTotalQuantity(totalQuantity);
    setTotalDiscount(totalDiscount.toFixed(2));
    setItemCount(tableData.length);
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
    setBarcode(suggestion.barcode);
    setCostPrice(suggestion.costPrice);
    setLockedPrice(suggestion.lockedPrice);
    setProductName(suggestion.productName);
    setSuggestedPrice(suggestion.mrpPrice);

    if (isWholesale) {
      setPrice(suggestion.wholesalePrice);
    } else if (isDiscount) {
      setPrice(suggestion.discountPrice);
    } else {
      setPrice(suggestion.mrpPrice);
    }

    setSuggestions([]);
    priceInputRef.current.focus();
  };



  const handleNumericInput = (value) => {
    if (document.activeElement) {
      document.activeElement.value += value;
      document.activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };
  
  const handleAlphabetInput = (value) => {
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
    <div className="invoice-container" id="invoice_container_id">
      <div className="left-panel">
        <div className="header-info">
          
          <div>
            <label>
              User: <span id="user_span">{user}</span>
            </label>
          </div>
          <div>
            <label>
              Store: <span id="store_span">{store}</span>
            </label>
          </div>
          <div>
            <label>
              Start Time: <span id="start_time_span">{startTime}</span>
            </label>
          </div>
        </div>

        <div className="scan-barcode">
          <input
            type="text"
            autoComplete="off"
            placeholder="Scan Barcode (Insert)"
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
          <table className="product-table">
            <thead>
              <tr>
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
                <tr key={index}>
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
                    {editingCell.rowIndex === index && editingCell.field === "quantity" ? (
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(e, index)}
                        onKeyDown={(e) => handleQuantityEnterKeyPress(e, index)}
                        onBlur={() => setEditingCell({ rowIndex: null, field: null })}
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
                      onClick={() => handleDeleteRow(index)}
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
                  onChange={() => handleCheckboxChange("wholesale")}
                  
                  style={{ marginLeft: "5px", marginRight: "5px" }}
                />
                <span>Wholesale (F8)</span>
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
                <span>Special (F9)</span>
              </label>
            </div>
            <div className="option-box">
              <label htmlFor="return">
                <img
                  src={returnimage}
                  alt="Return"
                  style={{ marginLeft: "5px" }}
                />
                <br />
                <span>Return</span>
              </label>
            </div>
            <div className="option-box">
              <label htmlFor="stock">
                <img
                  src={productimage}
                  alt="Stock"
                  style={{ marginLeft: "5px" }}
                />
                <br />
                <span>Stock</span>
              </label>
            </div>
            <div className="option-box">
              <label htmlFor="dayend">
                <img src={dayend} alt="Day End" style={{ marginLeft: "5px" }} />
                <br />
                <span>Day End</span>
              </label>
            </div>
            <div className="option-box">
              <label htmlFor="logout">
                <img src={logout} alt="Logout" style={{ marginLeft: "5px" }} />
                <br />
                <span>Logout</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Numeric and Alphabet Keyboards */}
      <div className="right-panel">
        <div className="display-panels" style={{display:"none"}}>
          <div className="keyboard-toggle" >
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
                  <button key={letter} onClick={() => handleAlphabetInput(letter)}>
                    {letter}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {["G", "H", "I", "J", "K", "L"].map((letter) => (
                  <button key={letter} onClick={() => handleAlphabetInput(letter)}>
                    {letter}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {["M", "N", "O", "P", "Q", "R"].map((letter) => (
                  <button key={letter} onClick={() => handleAlphabetInput(letter)}>
                    {letter}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {["S", "T", "U", "V", "W", "X"].map((letter) => (
                  <button key={letter} onClick={() => handleAlphabetInput(letter)}>
                    {letter}
                  </button>
                ))}
              </div>
              <div className="keypad-row">
                {["Y", "Z"].map((letter) => (
                  <button key={letter} onClick={() => handleAlphabetInput(letter)}>
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
          <button  onClick={handleOtherItemClick}>
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
          <button>
            <img
              src={customer}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Customer Balance
          </button>
          <button>
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
            My Expenses
          </button>
          <button>
            <img
              src={salesimage}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Today Sale
          </button>
          <button>
            <img
              src={monthsales}
              style={{ width: "20px", height: "20px", marginRight: "5px" }}
            />
            Monthly Sale
          </button>

        </div>

        {/* Render the ExpensesModel */}
        <ExpensesModel
          show={isExpensesModalOpen}
          onClose={handleCloseExpensesModal}
          onAdd={handleAddExpense}
          user={user}
          store={store}
        />

        {/* Render the OtherItemModel */}
        <OtherItemModel
          show={isOtherItemModalOpen}
          onClose={handleCloseOtherItemModal}
          onAdd={handleAddOtherItem}
        />

      </div>
    </div>
  );
}

