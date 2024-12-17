import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";
import "../css1/salesTable.css";
import addCashImage from "../assets/icons/addCash.png"; // Import payment image
import historyImage from "../assets/icons/history.png"; // Import history image

const CreditSales = ({ store }) => {
  // State variables for sales data
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State variables for company information
  const [companyInfo, setCompanyInfo] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState(null);

  // State variables for customer information
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState(null);

  // State variables for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // State variables for payment modal
  const [showModal, setShowModal] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [modalData, setModalData] = useState(null);
  const [oldValues, setOldValues] = useState({});

  // State variables for payment history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  // Reference for the print iframe
  const printIframeRef = useRef(null);

  // Fetch sales data from backend
  const fetchSales = async () => {
    try {
      const response = await axios.get(
        "http://154.26.129.243:5000/api/invoices/fetch_sales_new",
        {
          params: { Store: store },
        }
      );
      setSales(response.data);
      setLoading(false);
    } catch (err) {
      setError(
        `Failed to load sales: ${err.response?.data?.message || err.message}`
      );
      setLoading(false);
    }
  };

  // Fetch company information from backend
  const fetchCompanyInfo = async () => {
    try {
      const response = await axios.get("http://154.26.129.243:5000/api/companies/info");
      setCompanyInfo(response.data);
      setCompanyLoading(false);
    } catch (err) {
      setCompanyError(
        `Failed to load company info: ${err.response?.data?.error || err.message}`
      );
      setCompanyLoading(false);
    }
  };

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      const response = await axios.get("http://154.26.129.243:5000/api/customer/fetch_customers", {
        params: { Store: store },
      });
      setCustomers(response.data);
      setCustomersLoading(false);
    } catch (err) {
      setCustomersError(
        `Failed to load customers: ${err.response?.data?.message || err.message}`
      );
      setCustomersLoading(false);
    }
  };

  // useEffect to fetch sales, company info, and customers when component mounts or store changes
  useEffect(() => {
    // Reset states when store changes
    setLoading(true);
    setError(null);
    setCompanyLoading(true);
    setCompanyError(null);
    setCustomersLoading(true);
    setCustomersError(null);

    // Fetch sales, company info, and customers concurrently
    fetchSales();
    fetchCompanyInfo();
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  // Helper function to check if a sale date is within the selected date range
  const isDateInRange = (saleDate, start, end) => {
    const sale = new Date(saleDate).setHours(0, 0, 0, 0);
    if (!start && !end) return true;
    const startNormalized = start
      ? new Date(start).setHours(0, 0, 0, 0)
      : -Infinity;
    const endNormalized = end
      ? new Date(end).setHours(23, 59, 59, 999)
      : Infinity;
    return sale >= startNormalized && sale <= endNormalized;
  };

  // Create a mapping from CustomerId to CustomerName
  const customerMap = {};
  customers.forEach((customer) => {
    customerMap[customer.CustomerId] = customer.CustomerName;
  });

  // Filtered sales based on search query and date range
  const filteredSales = sales.filter((sale) => {
    const matchesSearchQuery = sale.CustomerId.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    const withinDateRange = isDateInRange(sale.createdAt, startDate, endDate);
    return matchesSearchQuery && withinDateRange;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSales.slice(indexOfFirstRow, indexOfLastRow);

  // Handlers for pagination
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Handler for opening the payment modal
  const handleAddPaymentClick = (sale) => {
    setModalData({ ...sale });
    setInitialValues({
      CashPay: parseFloat(sale.CashPay) || 0,
      CardPay: parseFloat(sale.CardPay) || 0,
    });
    setOldValues({
      CashPay: parseFloat(sale.CashPay) || 0,
      CardPay: parseFloat(sale.CardPay) || 0,
    });
    setShowModal(true);
  };

  // Handler for closing the payment modal
  const handleCloseModal = () => {
    setModalData(null);
    setShowModal(false);
  };

  // Validation function for payments
  const validatePayment = async (field, value) => {
    const initial = initialValues[field];
    const grossTotal = parseFloat(modalData.GrossTotal) || 0;
    const otherField = field === "CashPay" ? "CardPay" : "CashPay";
    const otherValue = parseFloat(modalData[otherField]) || 0;

    if (value < initial) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: `${field} cannot be less than the original value (${initial}).`,
      });
      setModalData((prevData) => ({
        ...prevData,
        [field]: oldValues[field],
      }));
      return false;
    }

    if (parseFloat(value) + otherValue > grossTotal) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: `Total payment cannot exceed the Gross Total (${grossTotal}).`,
      });
      setModalData((prevData) => ({
        ...prevData,
        [field]: oldValues[field],
      }));
      return false;
    }

    return true;
  };

  // Calculate totals for filtered data
  const totalNetAmount = filteredSales.reduce(
    (total, sale) => total + (parseFloat(sale.netAmount) || 0),
    0
  );
  const totalCashAmount = filteredSales.reduce(
    (total, sale) => total + (parseFloat(sale.CashPay) || 0),
    0
  );
  const totalCardAmount = filteredSales.reduce(
    (total, sale) => total + (parseFloat(sale.CardPay) || 0),
    0
  );
  const totalLoanAmount = totalNetAmount - (totalCashAmount + totalCardAmount);

  // Handler for modal input changes
  const handleModalInputChange = (field, value) => {
  const numericValue = value === "" ? 0 : parseFloat(value);

  // Determine the new CashPay and CardPay values based on the field being updated
  let newCashPay = parseFloat(modalData.CashPay) || 0;
  let newCardPay = parseFloat(modalData.CardPay) || 0;

  if (field === "CashPay") {
    newCashPay = numericValue;
  } else if (field === "CardPay") {
    newCardPay = numericValue;
  }

  const netAmount = parseFloat(modalData.netAmount) || 0;
  const totalPayments = newCashPay + newCardPay;

  // Validate that total payments do not exceed Net Amount
  if (totalPayments > netAmount) {
    Swal.fire({
      icon: "error",
      title: "Invalid Payment",
      text: `The total of Cash Pay (${newCashPay.toFixed(
        2
      )}) and Card Pay (${newCardPay.toFixed(
        2
      )}) cannot exceed the Net Amount (${netAmount.toFixed(2)}).`,
    }).then(() => {
      // Revert the changed field to its previous value
      setModalData((prevData) => ({
        ...prevData,
        [field]: oldValues[field],
      }));
    });
    return; // Exit the function to prevent updating the state with invalid values
  }

  // If validation passes, update the modalData with new values and calculate the Balance
  setModalData((prevData) => ({
    ...prevData,
    [field]: numericValue,
    Balance: (netAmount - totalPayments).toFixed(2),
  }));
};


  // Handler for updating the sale with new payment details
  const handleUpdateModal = async (updatedData) => {
    // Perform validations before proceeding
    const isCashPayValid = await validatePayment("CashPay", updatedData.CashPay);
    const isCardPayValid = await validatePayment("CardPay", updatedData.CardPay);

    if (!isCashPayValid || !isCardPayValid) {
      // If any validation fails, do not proceed with the update
      return;
    }

    try {
      const { invoiceId, CashPay, CardPay, Balance, CustomerId } = updatedData;

      // Ensure balance is passed as a negative value if not zero
      const formattedBalance =
        parseFloat(Balance) !== 0 ? -Math.abs(parseFloat(Balance)) : 0;

      // Determine PaymentType
      let paymentType = "Unknown";
      if (parseFloat(CashPay) > 0 && parseFloat(CardPay) > 0) {
        paymentType = "Cash and Card Payment";
      } else if (parseFloat(CashPay) > 0) {
        paymentType = "Cash Payment";
      } else if (parseFloat(CardPay) > 0) {
        paymentType = "Card Payment";
      }

      const response = await axios.put(
        `http://154.26.129.243:5000/api/customer/update_sale/${invoiceId}`,
        {
          CashPay: parseFloat(CashPay) || 0,
          CardPay: parseFloat(CardPay) || 0,
          Balance: formattedBalance,
          customerId: CustomerId,
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.message,
        });

        // Fetch the latest sales data to ensure up-to-date information
        await fetchSales();

        // Find the updated sale from the latest sales data
        const updatedSale = sales.find((sale) => sale.invoiceId === invoiceId);

        if (updatedSale) {
          // Prepare the data for printing the invoice
          const invoiceDataToPrint = {
            company: companyInfo, // Use fetched company info
            sales: updatedSale,
            invoices: updatedSale.items || [], // Adjust according to your data structure
          };
          handlePrintInvoice(invoiceDataToPrint);
        } else {
          Swal.fire(
            "Error",
            "Failed to retrieve updated sale data for printing.",
            "error"
          );
        }

        // Update the local sales state to reflect changes
        setSales((prevSales) =>
          prevSales.map((sale) =>
            sale.invoiceId === invoiceId
              ? {
                  ...sale,
                  CashPay,
                  CardPay,
                  Balance: formattedBalance,
                  PaymentType: paymentType, // Update PaymentType
                }
              : sale
          )
        );

        handleCloseModal();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update the sale.",
        });
      }
    } catch (error) {
      console.error("Frontend Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `An error occurred: ${
          error.response?.data?.message || error.message
        }`,
      });
    }
  };

  // Handler for printing the invoice via iframe
  const handlePrintInvoice = (invoiceDataToPrint) => {
    if (!invoiceDataToPrint) {
      Swal.fire("Error", "Invoice data is not available for printing.", "error");
      return;
    }

    console.log("Printing Invoice:", invoiceDataToPrint);

    // Create a hidden iframe for printing if it doesn't exist
    let printIframe = printIframeRef.current;
    if (!printIframe) {
      printIframe = document.createElement("iframe");
      printIframeRef.current = printIframe;
      printIframe.style.position = "absolute";
      printIframe.style.width = "0";
      printIframe.style.height = "0";
      printIframe.style.border = "none";
      document.body.appendChild(printIframe);
    }

    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 10px;
      width: 302px;
      box-sizing: border-box;
    }
    .receipt-container {
      /* Container styling if needed */
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
    }
    .header img {
      max-width: 100px;
      height: auto;
    }
    .header h2 {
      margin: 5px 0;
      font-size: 24px; /* Increased font size for company name */
    }
    .header p {
      margin: 2px 0;
      font-size: 14px; /* Increased font size for address and phone */
    }
    .divider {
      border-bottom: 1px dashed #000;
      margin: 10px 0;
    }
    .invoice-details {
      font-size: 12px; /* Kept smaller for invoice info */
    }
    .invoice-details div {
      margin-bottom: 2px;
    }
    table {
      width: 100%;
      font-size: 12px;
      margin-bottom: 10px;
      border-collapse: collapse;
    }
    table th, table td {
      text-align: center;
      padding: 4px;
      border: none;
    }
    .product-name {
      text-align: left;
      white-space: normal;
      word-wrap: break-word;
    }
    .summary {
      margin-top: 10px;
      font-size: 12px;
    }
    .summary div {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .footer {
      text-align: center;
      margin-top: 10px;
      font-size: 12px;
    }
    .totals-container {
      margin-top: 20px;
      text-align: right;
    }
    .totals {
      width: 100%;
      font-size: 14px; /* Adjusted to 14px for totals */
      margin-bottom: 10px;
      border-collapse: collapse;
    }
    .totals .label {
      font-weight: bold;
      width: 50%;
      font-size: 14px; /* Consistent font size for labels */
      text-align: right; /* Align label texts to the right */
      padding-right: 10px; /* Optional: Add padding for spacing */
    }
    .totals .value {
      text-align: right;
      width: 50%;
      font-size: 14px; /* Consistent font size for values */
      padding-left: 10px; /* Optional: Add padding for spacing */
    }
    .totals .value strong {
      font-size: 14px; /* Adjusted from 16px to 14px */
      display: block;
      margin-bottom: 5px;
    }
    .totals .value span {
      font-size: 12px;
      display: block;
      margin-top: 5px;
    }
    .qr-code {
      text-align: center;
      margin-top: 10px;
    }
    .qr-code img {
      max-width: 100px;
      height: auto;
    }
    .barcode {
      text-align: center;
      margin-top: 10px;
    }
    .barcode img {
      height: 50px; /* Set height to 50px */
      width: auto; /* Allow width to adjust automatically */
      margin-top: 10px;
    }
    /* Added lines before and after Gross Total and Net Amount */
    .totals tr.gross-total {
      border-top: 1px solid #000; /* Line before Gross Total */
      border-bottom: 1px solid #000; /* Line after Gross Total */
    }
    .totals tr.net-amount {
      border-top: 1px solid #000; /* Line before Net Amount */
      border-bottom: 1px solid #000; /* Line after Net Amount */
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header Section -->
    <div class="header">
      <img src="${
        invoiceDataToPrint.company.LogoUrl || "https://via.placeholder.com/120"
      }" alt="Company Logo" />
      <h2>${invoiceDataToPrint.company.Comname || "Store Name"}</h2>
      <p>${invoiceDataToPrint.company.Location || "Store Address"}</p>
      <p>Phone: ${invoiceDataToPrint.company.Mobile || "123-456-7890"}</p>
      <p>Date: ${new Date(
        invoiceDataToPrint.sales.createdAt
      ).toLocaleString()}</p>
    </div>

    <div class="divider"></div>

    <!-- Invoice Information -->
    <div class="invoice-details">
      <div><strong>Invoice #:</strong> ${
        invoiceDataToPrint.sales.invoiceId
      }</div>
      <div><strong>Cashier:</strong> ${
        invoiceDataToPrint.sales.UserName || "N/A"
      }</div>
      <div><strong>Customer:</strong> ${
        customerMap[invoiceDataToPrint.sales.CustomerId] || "N/A"
      }</div>
    </div>

    <div class="divider"></div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Disc</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
      ${invoiceDataToPrint.invoices
        .map(
          (item, index) => `
            <tr>
              <td colspan="5" style="text-align: left; font-weight: bold;">${
                index + 1
              }. ${item.name}</td>
            </tr>
            <tr>
              <td></td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: center;">${parseFloat(
                item.rate
              ).toFixed(2)}</td>
              <td style="text-align: center;">${
                item.discount
                  ? `${parseFloat(item.discount).toFixed(2)}%`
                  : "-"
              }</td>
              <td style="text-align: center;">${parseFloat(
                item.totalAmount
              ).toFixed(2)}</td>
            </tr>
          `
        )
        .join("")}
      </tbody>
    </table>

    <!-- Totals Section -->
    <div class="totals-container">
      <table class="totals">
        <tbody>
          <tr class="gross-total">
            <td class="label"><strong>Gross Total:</strong></td>
            <td class="value"> ${parseFloat(
              invoiceDataToPrint.sales.GrossTotal
            ).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label"><strong>Discount:</strong></td>
            <td class="value"> ${parseFloat(
              invoiceDataToPrint.sales.discountAmount
            ).toFixed(2)}</td>
          </tr>
          <tr class="net-amount">
            <td class="label"><strong>Net Amount:</strong></td>
            <td class="value"> ${parseFloat(
              invoiceDataToPrint.sales.netAmount
            ).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label"><strong>Payment:</strong></td>
            <td class="value"> ${(
              parseFloat(invoiceDataToPrint.sales.CashPay) +
              parseFloat(invoiceDataToPrint.sales.CardPay)
            ).toFixed(2)}</td>
          </tr>
          <tr class="net-amount">
            <td class="label"><strong>Balance:</strong></td>
            <td class="value"> ${parseFloat(
              invoiceDataToPrint.sales.Balance
            ).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- QR Code Section -->
    <div class="qr-code">
      <img src="https://api.qr-code-monkey.com/qrmapi/qr-code?data=${
        invoiceDataToPrint.sales.invoiceId
      }&size=100x100" alt="QR Code" />
    </div>

    <!-- Barcode Section -->
    <div class="barcode">
      <img src="https://barcode.tec-it.com/barcode.ashx?data=${invoiceDataToPrint.sales.invoiceId}&code=Code128&dpi=96" alt="Invoice Barcode" />
    </div>

    <!-- Footer Section -->
    <div class="footer">
      <p>Thank you for shopping with us!</p>
      <p>Visit again!</p>
    </div>

    <!-- Cut Line -->
    <div class="cut-line">
    </div>
  </div>
</body>
</html>
`;

    // Write the receipt content to the iframe's document
    const iframeDoc =
      printIframe.contentDocument || printIframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(receiptHTML);
    iframeDoc.close();

    // Define a handler that prints and cleans up after the print is done
    const handlePrint = () => {
      try {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
      } catch (error) {
        console.error("Error during printing:", error);
        Swal.fire("Error", "Failed to print the invoice.", "error");
      } finally {
        // Clean up: remove the iframe after printing
        setTimeout(() => {
          if (printIframe && printIframe.parentNode) {
            printIframe.parentNode.removeChild(printIframe);
            printIframeRef.current = null;
          }
        }, 1000);
      }
    };

    // Attach the onload event only once
    if (iframeDoc.readyState === "complete") {
      handlePrint();
    } else {
      // Otherwise, wait for the iframe to load and then print
      printIframe.onload = handlePrint;
    }
  };

  // Handler for opening the payment history modal
  const handleHistoryClick = async (invoiceId) => {
    try {
      setSelectedInvoiceId(invoiceId);
      const response = await axios.get(
        `http://154.26.129.243:5000/api/customer/payment_history/${invoiceId}`
      );
      setPaymentHistory(response.data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to fetch payment history: ${
          error.response?.data?.message || error.message
        }`,
      });
    }
  };

  // Handler for closing the payment history modal
  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setPaymentHistory([]);
    setSelectedInvoiceId(null);
  };

  // Handler for deleting a payment
  const handleDeletePayment = async (paymentId) => {
    try {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "This action will delete the payment and update the sales record.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (confirmResult.isConfirmed) {
        const response = await axios.delete(
          `http://154.26.129.243:5000/api/customer/delete_payment/${paymentId}`
        );

        if (response.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: response.data.message,
          });

          // Refresh payment history
          setPaymentHistory((prevHistory) =>
            prevHistory.filter((payment) => payment.id !== paymentId)
          );

          // Refresh the sales table
          await fetchSales(); // Await to ensure sales are refreshed before proceeding
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete the payment.",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `An error occurred: ${
          error.response?.data?.message || error.message
        }`,
      });
    }
  };

  // Handle loading and error states for sales, company info, and customers
  if (loading || companyLoading || customersLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (companyError) return <p>{companyError}</p>;
  if (customersError) return <p>{customersError}</p>;
  if (sales.length === 0) return <p>No sales found for the selected store.</p>;

  return (
    <div className="sales-table-container_salesTable">
      {/* Filters Section */}
      <div className="filters-container">
        <div className="search-box-salesTable">
          <input
            type="text"
            placeholder="Search by Customer ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="date-range-filters">
          <div className="date-picker">
            <label htmlFor="start-date">Start Date:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-picker">
            <label htmlFor="end-date">End Date:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <table className="sales-table_salesTable">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Gross Total</th>
            <th>Customer Name</th> {/* Updated column header */}
            <th>Discount %</th>
            <th>Discount Amount</th>
            <th>Net Amount</th>
            <th>Cash Pay</th>
            <th>Card Pay</th>
            <th>Payment Type</th>
            <th>Balance</th>
            <th>Created At</th>
            <th>Actions</th> {/* Updated column header */}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((sale) => (
            <tr key={sale.invoiceId}> {/* Use invoiceId as key if unique */}
              <td>{sale.invoiceId}</td>
              <td>{parseFloat(sale.GrossTotal).toFixed(2)}</td>
              <td>{customerMap[sale.CustomerId] || sale.CustomerId}</td> {/* Display Customer Name */}
              <td>{parseFloat(sale.discountPercent).toFixed(2)}%</td>
              <td>{parseFloat(sale.discountAmount).toFixed(2)}</td>
              <td>{parseFloat(sale.netAmount).toFixed(2)}</td>
              <td>{parseFloat(sale.CashPay).toFixed(2)}</td>
              <td>{parseFloat(sale.CardPay).toFixed(2)}</td>
              <td>{sale.PaymentType}</td>
              <td
                style={{
                  color: "red", // Ensure all balance values are displayed in red
                }}
              >
                -{Math.abs(parseFloat(sale.Balance)).toFixed(2)}
              </td>
              <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => handleAddPaymentClick(sale)}
                >
                  <img src={addCashImage} alt="Add Cash" />
                </button>
                <button
                  className="icon-button"
                  onClick={() => handleHistoryClick(sale.invoiceId)}
                >
                  <img src={historyImage} alt="History" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {/* Summary Table */}
      <div className="summary-container-credit-sales">
        <table className="summary-table-credit-sales">
          <thead>
            <tr>
              <th>Total Net Amount</th>
              <th>Total Loan Amount</th>
              <th>Total Cash Amount</th>
              <th>Total Card Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{totalNetAmount.toFixed(2)}</td>
              <td>{totalLoanAmount.toFixed(2)}</td>
              <td>{totalCashAmount.toFixed(2)}</td>
              <td>{totalCardAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showModal && modalData && (
        <div id="modal-overlay">
          <div id="modal-content">
            <h3 id="modal-title">Payment Details</h3>
            <div className="modal-field">
              <label>Customer ID:</label>
              <input type="text" value={modalData.CustomerId || ""} readOnly />
            </div>
            <div className="modal-field">
              <label>Invoice ID:</label>
              <input type="text" value={modalData.invoiceId || ""} readOnly />
            </div>
            <div className="modal-field">
              <label>Net Amount:</label>
              <input type="text" value={modalData.netAmount || ""} readOnly />
            </div>

            <div className="modal-field">
              <label>Cash Pay:</label>
              <input
                type="number"
                step="0.01"
                value={modalData.CashPay || 0}
                onChange={(e) =>
                  handleModalInputChange("CashPay", e.target.value)
                }
              />
            </div>
            <div className="modal-field">
              <label>Card Pay:</label>
              <input
                type="number"
                step="0.01"
                value={modalData.CardPay || 0}
                onChange={(e) =>
                  handleModalInputChange("CardPay", e.target.value)
                }
              />
            </div>
            <div className="modal-field">
              <label>Balance:</label>
              <input
                type="number"
                step="0.01"
                value={modalData.Balance || 0}
                readOnly
              />
            </div>
            <div id="modal-buttons-credit-sales">
              <button
                id="close-button-credit-sale-payment"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button
                id="update-button-credit-sale-payment"
                onClick={() => handleUpdateModal(modalData)}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showHistoryModal && (
        <div id="modal-overlay-credit-Table">
          <div id="modal-content-credit-Table">
            <h3 id="modal-title">
              Payment History for Invoice {selectedInvoiceId}
            </h3>
            {paymentHistory.length > 0 ? (
              <div className="table-container-credit-Table">
                <table className="history-table-credit-Table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Invoice ID</th>
                      <th>Customer ID</th>
                      <th>Cash Payment</th>
                      <th>Card Payment</th>
                      <th>Total Payment</th>
                      <th>Payment Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td>{payment.invoiceId}</td>
                        <td>{payment.customerId}</td>
                        <td>{parseFloat(payment.cashPayment).toFixed(2)}</td>
                        <td>{parseFloat(payment.cardPayment).toFixed(2)}</td>
                        <td>{parseFloat(payment.totalPayment).toFixed(2)}</td>
                        <td>
                          {new Date(payment.saveTime).toLocaleDateString()}{" "}
                          {new Date(payment.saveTime).toLocaleTimeString()}
                        </td>
                        <td>
                          <button
                            className="delete-button-credit-Table"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No payment history found for this invoice.</p>
            )}
            <div id="modal-buttons-credit-Table">
              <button
                id="close-button-credit-table"
                onClick={handleCloseHistoryModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CreditSales.propTypes = {
  store: PropTypes.string.isRequired,
};

export default CreditSales;
