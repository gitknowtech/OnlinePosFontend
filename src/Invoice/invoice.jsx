import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../css1/invoice.css";

// Ensure these image paths are correct in your project structure
import productimage from "../assets/images/products.png";
import bill from "../assets/images/bill.png";
import customer from "../assets/images/customer.png";
import expenses from "../assets/images/expenses.png";
import monthsales from "../assets/images/month.png";
import otheritem from "../assets/images/otheritem.png";
import quatation from "../assets/images/quotation.png";
import returnimage from "../assets/images/return.png";
import salesimage from "../assets/images/sales.png";
import dayend from "../assets/images/end.png";
import discount from "../assets/images/discount.png";
import wholesale from "../assets/images/wholesale.png";
import removeImage from "../assets/images/remove.png"
import logout from "../assets/images/user-logout.png";

export default function Invoice() {
  const location = useLocation();
  const [user, setUser] = useState("Guest");
  const [store, setStore] = useState("Default Store");
  const [startTime, setStartTime] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [qty, setQty] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [tableData, setTableData] = useState([]);
  const [productName, setProductName] = useState("");

  const priceInputRef = useRef(null);
  const qtyInputRef = useRef(null);

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

    fetchCategories();
  }, [location.state]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products/fetch_categories_for_invoice");
      setCategories(response.data);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch categories", "error");
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/fetch_products_by_category?categoryId=${categoryId}`);
      setProducts(response.data);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch products", "error");
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchProductsByCategory(category.id);
  };

  const handleBarcodeChange = async (e) => {
    const input = e.target.value;
    setBarcode(input);

    if (input.length > 1) {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/search?query=${input}`);
        setSuggestions(response.data);
      } catch (error) {
        Swal.fire("Error", "Failed to fetch product suggestions", "error");
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setProductName(suggestion.productName);
    setBarcode(suggestion.barcode);
    setPrice(suggestion.mrpPrice);
    setSuggestedPrice(suggestion.mrpPrice);
    setSuggestions([]);
    setQty("");
    priceInputRef.current.focus();
  };

  const handlePriceEnterKeyPress = (e) => {
    if (e.key === "Enter") {
      const enteredPrice = parseFloat(price);
      const originalPrice = parseFloat(suggestedPrice);

      if (enteredPrice > originalPrice) {
        Swal.fire("Invalid Price", "The entered price cannot be greater than the original price", "error");
        priceInputRef.current.focus();
      } else {
        setQty("1");
        qtyInputRef.current.focus();
      }
    }
  };

  const handleBarcodeEnterKeyPress = async (e) => {
    if (e.key === "Enter") {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/search?query=${barcode}`);
        if (response.data.length > 0) {
          const product = response.data[0];
          setBarcode(product.barcode);
          setPrice(product.mrpPrice);
          setSuggestedPrice(product.mrpPrice);
          priceInputRef.current.focus();
        } else {
          Swal.fire("Not Found", "Product with this barcode does not exist", "warning");
        }
      } catch (error) {
        Swal.fire("Error", "Failed to fetch product by barcode", "error");
      }
    }
  };

  const handleQtyEnterKeyPress = (e) => {
    if (e.key === "Enter" && qty) {
      const costPrice = parseFloat(suggestedPrice) - (parseFloat(suggestedPrice) - parseFloat(price));
      const discount = (suggestedPrice - price);
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

      setBarcode("");
      setPrice("");
      setQty("");
      setSuggestedPrice("");
      qtyInputRef.current.blur();
    }
  };

  const handleDeleteRow = (index) => {
    setTableData((prevData) => prevData.filter((_, i) => i !== index));
  };

  return (
    <div className="invoice-container" id="invoice_container_id">
      <div className="left-panel">
        <div className="header-info">
          <div>
            <label>User: <span id="user_span">{user}</span></label>
          </div>
          <div>
            <label>Store: <span id="store_span">{store}</span></label>
          </div>
          <div>
            <label>Start Time: <span id="start_time_span">{startTime}</span></label>
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
            onKeyDown={handleBarcodeEnterKeyPress}
          />
          <input
            type="text"
            autoComplete="off"
            placeholder="PRICE"
            className="price-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={handlePriceEnterKeyPress}
            ref={priceInputRef}
          />
          <input
            type="text"
            autoComplete="off"
            placeholder="QTY"
            className="qty-input"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            onKeyDown={handleQtyEnterKeyPress}
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
                  <strong>{suggestion.barcode}<br />{suggestion.productId} - {suggestion.productName} - RS: {suggestion.mrpPrice}</strong>
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
                <th style={{ display: "none" }}>Cost</th>
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
                  <td >{item.name}</td>
                  <td style={{ display: "none" }}>{item.cost}</td>
                  <td style={{textAlign:"center"}}>{item.mrp}</td>
                  <td style={{textAlign:"center"}}>{item.discount}</td>
                  <td style={{textAlign:"center"}}>{item.rate}</td>
                  <td style={{textAlign:"center"}}>{item.quantity}</td>
                  <td style={{textAlign:"center"}}>{item.amount}</td>
                  <td style={{width:"10px"}}>
                    <img
                      src={removeImage} alt="image deleted"
                      onClick={() => handleDeleteRow(index)}
                      style={{ cursor: "pointer", width: "20px", height: "20px" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="total-display">
          <div className="total-amount">
            <span>0.00</span>
          </div>
          <div className="item-count">
            <span>0 item(s)</span>
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

      {/* Right Side - Action Buttons and Display Panels */}
      <div className="right-panel">
        <div className="button-grid">
          {/* Action buttons with icons */}
          <button>
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
          <button>
            <img
              src={expenses}
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

        <div className="display-panels">
          <div className="category-display-panel">
            <h3>Categories</h3>
            <ul className="category-list">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className={`category-item ${selectedCategory?.id === category.id ? "active" : ""
                    }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.catName}
                </li>
              ))}
            </ul>
          </div>

          <div className="product-display-panel">
            <h3>{selectedCategory ? selectedCategory.catName : "Products"}</h3>
            <ul className="product-list">
              {products.map((product) => (
                <li key={product.id} className="product-item">
                  {product.productName} - {product.price}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
