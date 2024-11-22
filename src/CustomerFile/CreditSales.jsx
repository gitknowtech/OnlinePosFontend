import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Swal from "sweetalert2";
import debounce from "lodash.debounce";
import "../css1/salesTable.css";
import addCashImage from "../assets/icons/addCash.png"; // Import payment image

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

  const handlePrevPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleAddPaymentClick = (sale) => {
    setModalData({ ...sale });
    setInitialValues({
      CashPay: sale.CashPay || 0,
      CardPay: sale.CardPay || 0,
    });
    setOldValues({
      CashPay: sale.CashPay || 0,
      CardPay: sale.CardPay || 0,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setModalData(null);
    setShowModal(false);
  };

  const validatePayment = (field, value) => {
    const initial = initialValues[field];
    const grossTotal = modalData.GrossTotal || 0;
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
      setTimeout(() => validatePayment(field, numericValue), 1000)
    );

    setOldValues((prevOldValues) => ({
      ...prevOldValues,
      [field]: numericValue,
    }));
  };

  const handleUpdateModal = async (updatedData) => {
    try {
      const { invoiceId, CashPay, CardPay, Balance, CustomerId } = updatedData;
  
      const response = await axios.put(
        `http://localhost:5000/api/customer/update_sale/${invoiceId}`,
        {
          CashPay: parseFloat(CashPay) || 0,
          CardPay: parseFloat(CardPay) || 0,
          Balance: parseFloat(Balance) || 0,
          customerId: CustomerId,
        }
      );
  
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Sale updated successfully!",
        });
        setSales((prevSales) =>
          prevSales.map((sale) =>
            sale.invoiceId === invoiceId
              ? { ...sale, CashPay, CardPay, Balance }
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while updating the sale.",
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
            <th>Action</th>
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
              <td>
                {new Date(sale.createdAt).toLocaleDateString()}
              </td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => handleAddPaymentClick(sale)}
                >
                  <img src={addCashImage} alt="Add Cash" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
                value={modalData.Balance || 0}
                readOnly
              />
            </div>
            <div id="modal-buttons">
              <button onClick={handleCloseModal}>Close</button>
              <button onClick={() => handleUpdateModal(modalData)}>
                Update
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
