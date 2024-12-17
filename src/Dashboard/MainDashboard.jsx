// src/components/MainDashboard.js

import  { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../css2/maindashboard.css";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Auto-imports necessary Chart.js components






import salesImage from "../assets/images/sales.png";
import invoiceImage from "../assets/icons/report.png";
import supplierImage from "../assets/images/supplier.png";
import productImage from "../assets/images/products.png";
import customerImage from "../assets/images/customer.png";
import billImage from "../assets/images/bill.png";
import companyImage from "../assets/images/mainLogo.jpg"; // Add your company image here
import morningImage from "../assets/images/goodmorning.png";
import eveningImage from "../assets/images/goodevening.png";
import nightImage from "../assets/images/goodnight.png";
import afternoonImage from "../assets/images/afternoon.png";



const MainDashboard = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [greetingImage, setGreetingImage] = useState("");

  const location = useLocation();
  const { UserName } = location.state || { UserName: "Guest" };

  const [todayInvoiceCount, setTodayInvoiceCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [lastInvoiceId, setLastInvoiceId] = useState('');
  const [todaySales, setTodaySales] = useState(0.00); // New state for Today Sales
  const [chartData, setChartData] = useState(null); // Ensure default is null or an empty object

  const [lastInvoices, setLastInvoices] = useState([]); // Stores last 5 invoices
  const [topProducts, setTopProducts] = useState([]);   // Stores top 5 products
  const [creditSales, setCreditSales] = useState([]);   // Stores last 5 credit sales


  const [netAmountChartData, setNetAmountChartData] = useState(null);


  // Fetch counts from backend endpoints
  // Fetch counts and chart data from backend endpoints
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [invoiceRes, supplierRes, customerRes, productRes] = await Promise.all([
          fetch("http://154.26.129.243:5000/api/invoices/today_invoices_count"),
          fetch("http://154.26.129.243:5000/api/invoices/suppliercount"),
          fetch("http://154.26.129.243:5000/api/invoices/customercount"),
          fetch("http://154.26.129.243:5000/api/invoices/productcount"),
        ]);

        if (!invoiceRes.ok) throw new Error(`Invoice Count Fetch Error: ${invoiceRes.status}`);
        if (!supplierRes.ok) throw new Error(`Supplier Count Fetch Error: ${supplierRes.status}`);
        if (!customerRes.ok) throw new Error(`Customer Count Fetch Error: ${customerRes.status}`);
        if (!productRes.ok) throw new Error(`Product Count Fetch Error: ${productRes.status}`);

        const invoiceData = await invoiceRes.json();
        const supplierData = await supplierRes.json();
        const customerData = await customerRes.json();
        const productData = await productRes.json();

        setTodayInvoiceCount(invoiceData.count);
        setSupplierCount(supplierData.count);
        setCustomerCount(customerData.count);
        setProductCount(productData.count);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    const fetchLastInvoice = async () => {
      try {
        const response = await fetch("http://154.26.129.243:5000/api/invoices/lastInvoiceId");
        if (!response.ok) throw new Error(`Last Invoice Fetch Error: ${response.status}`);
        const data = await response.json();
        setLastInvoiceId(data.invoiceId || 'N/A');
      } catch (error) {
        console.error("Error fetching last invoice:", error);
        setLastInvoiceId('Error');
      }
    };

    const fetchTodaySales = async () => {
      try {
        const response = await fetch("http://154.26.129.243:5000/api/invoices/CurrentMonthSales");
        if (!response.ok) throw new Error(`Today Sales Fetch Error: ${response.status}`);
        const data = await response.json();
        setTodaySales(data.todaySales || 0.0);
      } catch (error) {
        console.error("Error fetching today sales:", error);
        setTodaySales('Error');
      }
    };

    const fetchInvoiceSalesData = async () => {
      try {
        const response = await fetch("http://154.26.129.243:5000/api/invoices/sales-summary-chart");
        if (!response.ok) throw new Error("Failed to fetch invoice sales data");
        const data = await response.json();

        if (data.length > 0) {
          const labels = data.map((item) => item.invoiceId); // Invoice IDs as labels
          const sales = data.map((item) => parseFloat(item.totalAmount)); // Total amounts as data points

          setChartData({
            labels,
            datasets: [
              {
                label: "Today's Sales by Invoice",
                data: sales,
                borderColor: "blue",
                backgroundColor: "rgba(0, 123, 255, 0.3)",
                fill: true,
              },
            ],
          });
        } else {
          setChartData(null); // No data for today
        }
      } catch (error) {
        console.error("Error fetching invoice sales data:", error);
      }
    };

    const fetchNetAmountSalesData = async () => {
      try {
        const response = await fetch("http://154.26.129.243:5000/api/invoices/sales-netamount-summary");
        if (!response.ok) throw new Error("Failed to fetch net amount sales data");
        const data = await response.json();

        if (data.length > 0) {
          const labels = data.map((item) => item.invoiceId); // Invoice IDs
          const netAmounts = data.map((item) => parseFloat(item.netAmount)); // Net amounts

          setNetAmountChartData({
            labels,
            datasets: [
              {
                label: "Today's Net Amount by Invoice",
                data: netAmounts,
                borderColor: "green",
                backgroundColor: "rgba(0, 255, 123, 0.3)",
                fill: true,
              },
            ],
          });
        } else {
          setNetAmountChartData(null); // No net amount data for today
        }
      } catch (error) {
        console.error("Error fetching net amount sales data:", error);
      }
    };

    // Call all fetch functions
    fetchCounts();
    fetchLastInvoice();
    fetchTodaySales();
    fetchInvoiceSalesData();
    fetchNetAmountSalesData();
  }, []);




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
      if (hour < 12) {
        setGreeting("Good Morning");
        setGreetingImage(morningImage);
      } else if (hour >= 12 && hour < 15) { // Afternoon greeting
        setGreeting("Good Afternoon");
        setGreetingImage(afternoonImage);
      } else if (hour >= 15 && hour < 18) { // Evening greeting
        setGreeting("Good Evening");
        setGreetingImage(eveningImage);
      } else {
        setGreeting("Good Night");
        setGreetingImage(nightImage);
      }
    };
  
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);



  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const [lastInvoicesRes, topProductsRes, creditSalesRes] = await Promise.all([
          fetch("http://154.26.129.243:5000/api/invoices/last-5-invoices"),
          fetch("http://154.26.129.243:5000/api/invoices/top-5-products"),
          fetch("http://154.26.129.243:5000/api/invoices/last-5-credit-sales"),
        ]);

        if (!lastInvoicesRes.ok) throw new Error("Error fetching last 5 invoices");
        if (!topProductsRes.ok) throw new Error("Error fetching top 5 products");
        if (!creditSalesRes.ok) throw new Error("Error fetching last 5 credit sales");

        const lastInvoicesData = await lastInvoicesRes.json();
        const topProductsData = await topProductsRes.json();
        const creditSalesData = await creditSalesRes.json();

        setLastInvoices(lastInvoicesData);
        setTopProducts(topProductsData);
        setCreditSales(creditSalesData);
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchTableData();
  }, []);




  return (
    <div id="dashboard-container">
      <section id="dashboard-panels">
        <div className="dashboard-panel">
          <img src={salesImage} alt="Today Sale" className="panel-icon" />
          <p>Today Sale</p>
          <h2>{todaySales !== 'Error' ? parseFloat(todaySales).toFixed(2) : 'Error'}</h2>
        </div>
        <div className="dashboard-panel">
          <img src={invoiceImage} alt="Today Invoice" className="panel-icon" />
          <p>Today Invoice</p>
          <h2>{todayInvoiceCount}</h2>
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
          <h2>{lastInvoiceId}</h2>
        </div>
      </section>

      {/* Date/Time, December Summary, and Company Details in one row */}
      <section id="info-row">
        {/* Date and Time Section */}
        <div id="dashboard-date-time">
          {/* Image for Greeting */}
          <img src={greetingImage} alt={greeting} className="greeting-image" />
          <div>
            <h2>{currentDate}</h2>
            <h3>{currentTime}</h3>
            <p>{greeting}, {UserName}!</p>
          </div>
        </div>

        {/* December Summary Section */}
        <div className="summary-card">
          <h3>Summary of December, 2024 Sales</h3>
          <ul className="summary-list" style={{ marginTop: "40px" }}>
            <li>
              <span className="summary-label">December Sales:</span>
              <span className="summary-value summary-green">26,150.00</span>
            </li>
            <li>
              <span className="summary-label">December Bill Discount:</span>
              <span className="summary-value summary-green">464.50</span>
            </li>
            <li>
              <span className="summary-label">December Profit:</span>
              <span className="summary-value summary-green">3,525.82</span>
            </li>
            <li>
              <span className="summary-label">December Expenses:</span>
              <span className="summary-value summary-red">0.00</span>
            </li>
            <li>
              <span className="summary-label">December Net Profit:</span>
              <span className="summary-value summary-blue">3,525.82</span>
            </li>
          </ul>
        </div>


        {/* Company Details Section */}
        <div className="summary-card company-details">
          <img src={companyImage} alt="Company Logo" className="company-icon" />
          <div className="company-info">
            <h3>Company Details</h3>
            <ul className="company-details-list" style={{ marginTop: "30px" }}>
              <li>
                <span className="details-label">Company:</span>
                <span className="details-value summary-blue">Gitknow Technologies</span>
              </li>
              <li>
                <span className="details-label">Proprietor:</span>
                <span className="details-value summary-blue">Mr Abdul Rahman</span>
              </li>
              <li>
                <span className="details-label">Address 1:</span>
                <span className="details-value summary-blue">No43, Laksiriyuana</span>
              </li>
              <li>
                <span className="details-label">Address 2:</span>
                <span className="details-value summary-blue">Rathmale, Wariyapola</span>
              </li>
              <li>
                <span className="details-label">Tel:</span>
                <span className="details-value summary-blue">074 334 7776</span>
              </li>
            </ul>
          </div>
        </div>

      </section>

      {/* Two-column row with Profit Summary and Sales Summary Charts */}
      <section id="charts-row">
        <div className="summary-card">
          <h3>Todays Sales by Invoice</h3>
          {chartData ? (
            <Line
              data={chartData}
              options={{ responsive: true, plugins: { legend: { display: true } } }}
            />
          ) : (
            <p>No sales data available for today.</p>
          )}
        </div>
        <div className="summary-card">
          <h3>Todays Net Amount Sales</h3>
          {netAmountChartData ? (
            <Line
              data={netAmountChartData}
              options={{ responsive: true, plugins: { legend: { display: true } } }}
            />
          ) : (
            <p>No net amount data available for today.</p>
          )}
        </div>
      </section>


      {/* Two-column row with Top 10 Invoices and Top 5 Sales Products */}
      <section id="tables-row">
        {/* Last 5 Invoices */}
        <div id="dashboard-invoices">
          <h3>Last 5 Invoices</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Net Amount</th>
                  <th>Cash Pay</th>
                  <th>Card Pay</th>
                  <th>User Name</th>
                </tr>
              </thead>
              <tbody>
                {lastInvoices.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td>{invoice.invoiceId}</td>
                    <td>{invoice.netAmount}</td>
                    <td>{invoice.CashPay}</td>
                    <td>{invoice.CardPay}</td>
                    <td>{invoice.UserName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Products */}
        <div id="top-products">
          <h3>Top 5 Products</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>MRP</th>
                  <th>Barcode</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.productId}</td>
                    <td>{product.name}</td>
                    <td>{product.mrp}</td>
                    <td>{product.barcode}</td>
                    <td>{product.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last 5 Credit Sales */}
        <div id="last-credit-sales">
          <h3>Last 5 Credit Sales</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {creditSales.map((sale) => (
                  <tr key={sale.invoiceId}>
                    <td>{sale.invoiceId}</td>
                    <td>{sale.CustomerId}</td>
                    <td>{sale.netAmount}</td>
                    <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        
      </section>

    </div>
  );
};

export default MainDashboard;
