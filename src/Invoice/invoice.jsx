import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import "../css1/invoice.css";
import productimage from "../assets/images/products.png";
import bill from "../assets/images/bill.png";
import customer from "../assets/images/customer.png";
import expenses from "../assets/images/expenses.png";
import monthsales from "../assets/images/month.png";
import otheritem from "../assets/images/otheritem.png";
import printquatation from "../assets/images/printer.png";
import quatation from "../assets/images/quotation.png";
import returnimage from "../assets/images/return.png";
import salesimage from "../assets/images/sales.png";
import dayend from "../assets/images/end.png";
import discount from "../assets/images/discount.png";
import wholesale from "../assets/images/wholesale.png";
import logout from "../assets/images/user-logout.png";

export default function Invoice() {
    const location = useLocation();
    const [user, setUser] = useState("Guest");
    const [store, setStore] = useState("Default Store");
    const [startTime, setStartTime] = useState("");
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (location.state) {
            const { UserName, Store } = location.state;
            setUser(UserName || "Guest");
            setStore(Store || "Default Store");
        }

        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setStartTime(formattedTime);

        fetchCategories();
    }, [location.state]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/products/fetch_categories_for_invoice");
            setCategories(response.data);
            console.log("Categories fetched:", response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProductsByCategory = async (categoryId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/products/fetch_products_by_category?categoryId=${categoryId}`);
            setProducts(response.data);
            console.log("Products fetched for category:", categoryId, response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        fetchProductsByCategory(category.id); // Fetch products for the selected category
    };

    return (
        <div className="invoice-container" id='invoice_container_id'>
            {/* Left Side - Product Table */}
            <div className="left-panel">
                <div className="header-info" style={{ display: "none" }}>
                    <div>
                        <label>User: <span className='span' style={{ backgroundColor: "white", borderRadius: "5px", color: "black", padding: "3px 15px" }}>{user}</span></label>
                    </div>
                    <div>
                        <label>Store: <span style={{ backgroundColor: "white", borderRadius: "5px", color: "black", padding: "3px 15px" }}>{store}</span></label>
                    </div>
                    <div>
                        <label>Start Time: <span style={{ backgroundColor: "white", borderRadius: "5px", color: "black", padding: "3px 15px" }}>{startTime}</span></label>
                    </div>
                </div>

                <div className="scan-barcode">
                    <input
                        type="text"
                        autoComplete='off'
                        placeholder="Scan Barcode (Insert)"
                        className="barcode-input"
                    />
                </div>

                <div className="table-container" id='table_container_div'>
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>MRP</th>
                                <th>Dis. (%)</th>
                                <th>Rate</th>
                                <th>Qty</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Product rows will be added dynamically here */}
                        </tbody>
                    </table>
                </div>

                {/* Total Amount and Item Count Display in a Separate Row */}
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
                                <img src={wholesale} alt="Wholesale" style={{ marginLeft: "35px" }} /><br />
                                <input type="checkbox" id="wholesale" style={{ marginLeft: "5px", marginRight: "5px" }} />
                                <span>Wholesale (F8)</span>
                            </label>
                        </div>
                        <div className="option-box">
                            <label htmlFor="special">
                                <img src={discount} alt="Special" style={{ marginLeft: "25px" }} /><br />
                                <input type="checkbox" id="special" style={{ marginLeft: "5px", marginRight: "5px" }} />
                                <span>Special (F9)</span>
                            </label>
                        </div>
                        <div className="option-box">
                            <label htmlFor="dayend">
                                <img src={dayend} alt="Day End" style={{ marginLeft: "5px" }} /><br />
                                <span>Day End</span>
                            </label>
                        </div>
                        <div className="option-box">
                            <label htmlFor="logout">
                                <img src={logout} alt="Logout" style={{ marginLeft: "5px" }} /><br />
                                <span>Logout</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Action Buttons and Display Panels */}
            <div className="right-panel">
                <div className="button-grid">
                    <button><img src={productimage} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Product/Stock</button>
                    <button><img src={returnimage} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Return</button>
                    <button><img src={otheritem} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Other Item (F4)</button>
                    <button><img src={quatation} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Quotation List</button>
                    <button><img src={printquatation} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Print Quotation</button>
                    <button><img src={customer} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Customer Balance</button>
                    <button><img src={bill} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Issue Bill Check</button>
                    <button><img src={expenses} style={{ width: "20px", height: "20px", marginRight: "5px" }} />My Expenses</button>
                    <button><img src={salesimage} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Today Sale</button>
                    <button><img src={monthsales} style={{ width: "20px", height: "20px", marginRight: "5px" }} />Monthly Sale</button>
                </div>

                <div className="display-panels">
                    {/* Category List */}
                    <div className="category-display-panel">
                        <h3>Categories</h3>
                        <ul className="category-list">
                            {categories.map((category) => (
                                <li
                                    key={category.id}
                                    className={`category-item ${selectedCategory?.id === category.id ? "active" : ""}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    {category.catName}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Product List */}
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
