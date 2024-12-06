// src/components/MainDashboard.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../css2/maindashboard.css";
import salesImage from "../assets/images/sales.png";
import invoiceImage from "../assets/icons/report.png";
import supplierImage from "../assets/images/supplier.png";
import productImage from "../assets/images/products.png";
import customerImage from "../assets/images/customer.png";
import billImage from "../assets/images/bill.png";

const MainDashboard = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");

  const [todaySales, setTodaySales] = useState(0);
  const [todayInvoice, setTodayInvoice] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [lastInvoice, setLastInvoice] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { UserName } = location.state || { UserName: "Guest" };

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/invoices/dashboard-stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched dashboard stats:', data); // Debugging log
        setTodaySales(data.todaySales);
        setTodayInvoice(data.todayInvoice);
        setSupplierCount(data.supplierCount);
        setProductCount(data.productCount);
        setCustomerCount(data.customerCount);
        setLastInvoice(data.lastInvoice || "No Invoices Yet");
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Optionally, set default or error states here
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Update Date and Time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const optionsDate = {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Colombo",
      };
      const optionsTime = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZone: "Asia/Colombo",
      };
      setCurrentDate(now.toLocaleDateString("en-LK", optionsDate));
      setCurrentTime(now.toLocaleTimeString("en-LK", optionsTime));

      const hour = now.getHours();
      setGreeting(
        hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
      );
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div id="dashboard-container">
      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <section id="dashboard-panels">
          <div className="dashboard-panel">
            <img src={salesImage} alt="Today Sale" className="panel-icon" />
            <p>Today Sale</p>
            <h2>{todaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
          <div className="dashboard-panel">
            <img src={invoiceImage} alt="Today Invoice" className="panel-icon" />
            <p>Today Invoice</p>
            <h2>{todayInvoice}</h2>
          </div>
          <div className="dashboard-panel">
            <img src={supplierImage} alt="Supplier" className="panel-icon" />
            <p>Supplier</p>
            <h2>{supplierCount}</h2>
          </div>
          <div className="dashboard-panel">
            <img src={productImage} alt="Product" className="panel-icon" />
            <p>Product</p>
            <h2>{productCount}</h2>
          </div>
          <div className="dashboard-panel">
            <img src={customerImage} alt="Customer" className="panel-icon" />
            <p>Customer</p>
            <h2>{customerCount}</h2>
          </div>
          <div className="dashboard-panel">
            <img src={billImage} alt="Last Invoice" className="panel-icon" />
            <p>Last Invoice</p>
            <h2>{lastInvoice}</h2>
          </div>
        </section>
      )}

      {/* Date/Time and December Summary in one row */}
      <section id="info-row">
        {/* Date and Time Section */}
        <div id="dashboard-date-time">
          <div>
            <h2>{currentDate}</h2>
            <h3>{currentTime}</h3>
            <p>{greeting}, {UserName}!</p>
          </div>
        </div>

        {/* December Summary Section */}
        <div className="summary-card">
          <h3>Summary of December, 2024 Sale's</h3>
          <ul>
            <li>December Sale's: <span className="summary-green">26,150.00</span></li>
            <li>December Bill Discount: <span className="summary-green">464.50</span></li>
            <li>December Profit: <span className="summary-green">3,525.82</span></li>
            <li>December Expenses: <span className="summary-red">0.00</span></li>
            <li>December Net Profit: <span className="summary-blue">3,525.82</span></li>
          </ul>
        </div>
      </section>

      {/* Two-column row with Profit Summary and Sales Summary Charts */}
      <section id="charts-row">
        <div className="summary-card">
          <h3>2024 Profit Summary</h3>
          <canvas id="profit-chart"></canvas>
        </div>
        <div className="summary-card">
          <h3>2024 Sales Summary</h3>
          <canvas id="sales-chart"></canvas>
        </div>
      </section>

      {/* Two-column row with Top 10 Invoices and Top 5 Sales Products */}
      <section id="tables-row">
        {/* Invoices Section */}
        <div id="dashboard-invoices">
          <h3>Last 10 Invoice</h3>
          <table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Amount</th>
                <th>Sale Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2412050001</td>
                <td className="amount-green">12,500.00</td>
                <td>2024-12-05 10:22:55 AM</td>
              </tr>
              <tr>
                <td>2412030005</td>
                <td className="amount-green">1,150.00</td>
                <td>2024-12-03 08:08:33 PM</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top Products Section */}
        <div id="top-products">
          <h3>Top 5 Sales Product</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Supplier</th>
                <th>QTY</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3D F2</td>
                <td>No Name</td>
                <td>5</td>
              </tr>
              <tr>
                <td>12321313</td>
                <td>No Name</td>
                <td>4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Two-column row with Last Credit Sales and Supplier Due Payment */}
      <section id="extra-tables-row">
        {/* Last Credit Sales Section */}
        <div id="last-credit-sales">
          <h3>Last Credit Sales</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CRD-001</td>
                <td>John Doe</td>
                <td className="amount-green">2,500.00</td>
                <td>2024-12-10</td>
              </tr>
              <tr>
                <td>CRD-002</td>
                <td>Jane Smith</td>
                <td className="amount-green">1,000.00</td>
                <td>2024-12-12</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Supplier Due Payment Section */}
        <div id="supplier-due-payment">
          <h3>Supplier Due Payment</h3>
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Invoice</th>
                <th>Amount Due</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ABC Suppliers</td>
                <td>INV-1001</td>
                <td className="amount-red">3,500.00</td>
                <td>2024-12-07</td>
              </tr>
              <tr>
                <td>XYZ Traders</td>
                <td>INV-1002</td>
                <td className="amount-red">1,200.00</td>
                <td>2024-12-09</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MainDashboard;
