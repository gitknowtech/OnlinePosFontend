import React from 'react';
import "../css1/invoice.css";

export default function Invoice() {
    return (
        <div className="invoice-container">
            {/* Left Side - Product Table */}
            <div className="left-panel">
                <div className="header-info">
                    <div>
                        <label>System ID:</label> <span>1730169540</span>
                    </div>
                    <div>
                        <label>User:</label> <span>ABDUL</span>
                    </div>
                    <div>
                        <label>Start Time:</label> <span>08:09:00 AM</span>
                    </div>
                </div>

                <div className="scan-barcode">
                    <input
                        type="text"
                        placeholder="Scan Barcode (Insert)"
                        className="barcode-input"
                    />
                </div>

                <div className="table-container">
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

                <div className="footer-options">
                    <div className="option-box">
                        <img src="wholesale-icon.png" alt="Wholesale" />
                        <span>Wholesale (F8)</span>
                    </div>
                    <div className="option-box">
                        <img src="special-icon.png" alt="Special" />
                        <span>Special (F9)</span>
                    </div>
                    <div className="option-box">
                        <img src="dayend-icon.png" alt="Day End" />
                        <span>Day End</span>
                    </div>
                    <div className="option-box">
                        <img src="logout-icon.png" alt="Logout" />
                        <span>Logout</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="right-panel">
                <div className="button-grid">
                    <button>Product/Stock</button>
                    <button>Return</button>
                    <button>Other Item (F4)</button>
                    <button>Quotation List</button>
                    <button>Print Quotation</button>
                    <button>Customer Balance</button>
                    <button>Issue Bill Check</button>
                    <button>My Expenses</button>
                    <button>Today Sale</button>
                    <button>Monthly Sale</button>
                </div>

                <div className="display-panels">
                    <div className="product-display-panel">
                        <h3>Product Information</h3>
                        {/* Product details go here */}
                    </div>
                    <div className="category-display-panel">
                        <h3>Pin Category</h3>
                        {/* Category details go here */}
                    </div>
                </div>
            </div>
        </div>
    );
}
