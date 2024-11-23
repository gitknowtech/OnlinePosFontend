import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";
import "../css1/salesTable.css";
import addCashImage from "../assets/icons/addCash.png"; // Import payment image
import historyImage from "../assets/icons/history.png"; // Import history image

const CreditSales = ({ store }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [modalData, setModalData] = useState(null);
  const [oldValues, setOldValues] = useState({});
  const [validationTimer, setValidationTimer] = useState(null); // Timer for debounced validation

  // New state variables for payment history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/invoices/fetch_sales_new",
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

    fetchSales();
  }, [store]);



  const fetchSales = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/invoices/fetch_sales_new",
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

  const filteredSales = sales.filter((sale) => {
    const matchesSearchQuery = sale.CustomerId.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    const withinDateRange = isDateInRange(sale.createdAt, startDate, endDate);
    return matchesSearchQuery && withinDateRange;
  });

  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSales.slice(indexOfFirstRow, indexOfLastRow);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

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

  const handleCloseModal = () => {
    setModalData(null);
    setShowModal(false);
  };

  const validatePayment = (field, value) => {
    const initial = initialValues[field];
    const grossTotal = parseFloat(modalData.GrossTotal) || 0;
    const otherField = field === "CashPay" ? "CardPay" : "CashPay";
    const otherValue = parseFloat(modalData[otherField]) || 0;

    if (value < initial) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: `${field} cannot be less than the original value (${initial}).`,
      }).then(() => {
        setModalData((prevData) => ({
          ...prevData,
          [field]: oldValues[field],
        }));
      });
      return false;
    }

    if (value + otherValue > grossTotal) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Input",
        text: `Total payment cannot exceed the Gross Total (${grossTotal}).`,
      }).then(() => {
        setModalData((prevData) => ({
          ...prevData,
          [field]: oldValues[field],
        }));
      });
      return false;
    }

    return true;
  };

  const handleModalInputChange = (field, value) => {
    const numericValue = value === "" ? 0 : parseFloat(value);

    clearTimeout(validationTimer);

    setModalData((prevData) => {
      const updatedData = { ...prevData, [field]: numericValue };

      const cashPay = parseFloat(updatedData.CashPay) || 0;
      const cardPay = parseFloat(updatedData.CardPay) || 0;
      const grossTotal = parseFloat(updatedData.GrossTotal) || 0;

      updatedData.Balance = (grossTotal - (cashPay + cardPay)).toFixed(2);

      return updatedData;
    });

    setValidationTimer(
      setTimeout(() => validatePayment(field, numericValue), 500)
    );

    setOldValues((prevOldValues) => ({
      ...prevOldValues,
      [field]: numericValue,
    }));
  };

  
  
  
  
  
  const handleUpdateModal = async (updatedData) => {
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
        `http://localhost:5000/api/customer/update_sale/${invoiceId}`,
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

  


  
  
  // New functions for handling payment history
  const handleHistoryClick = async (invoiceId) => {
    try {
      setSelectedInvoiceId(invoiceId);
      const response = await axios.get(
        `http://localhost:5000/api/customer/payment_history/${invoiceId}`
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

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setPaymentHistory([]);
    setSelectedInvoiceId(null);
  };

  
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
          `http://localhost:5000/api/customer/delete_payment/${paymentId}`
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
          fetchSales(); // Refresh the sales table to reflect changes
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
  
  

  if (loading) return <p>Loading sales...</p>;
  if (error) return <p>{error}</p>;
  if (sales.length === 0) return <p>No sales found for the selected store.</p>;

  return (
    <div className="sales-table-container_salesTable">
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

      <table className="sales-table_salesTable">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Gross Total</th>
            <th>Customer ID</th>
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
          {currentRows.map((sale, index) => (
            <tr key={index}>
              <td>{sale.invoiceId}</td>
              <td>{sale.GrossTotal}</td>
              <td>{sale.CustomerId}</td>
              <td>{sale.discountPercent}%</td>
              <td>{sale.discountAmount}</td>
              <td>{sale.netAmount}</td>
              <td>{sale.CashPay}</td>
              <td>{sale.CardPay}</td>
              <td>{sale.PaymentType}</td>
              <td>{sale.Balance}</td>
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
              <label>Gross Total:</label>
              <input type="text" value={modalData.GrossTotal || ""} readOnly />
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
            <div id="modal-buttons">
              <button  onClick={handleCloseModal}>Close</button>
              <button style={{backgroundColor:"blue"}} onClick={() => handleUpdateModal(modalData)}>
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
                      <th>CustomerId</th>
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
                        <td>{payment.cashPayment}</td>
                        <td>{payment.cardPayment}</td>
                        <td>{payment.totalPayment}</td>
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
                id="close-buttob-credit-table"
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
