
import PropTypes from "prop-types";
import InvoicesTable from "../Sales/invoiceTable";
import "../css1/TodaySales.css"

const TodaySales = ({ show, onClose, store }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay-today-sales">
      <div className="modal-content-today-sales">
        <button className="modal-close-button-today-sales" onClick={onClose}>
          ×
        </button>
        <h2>Today Sales</h2>
        <InvoicesTable store={store} />
      </div>
    </div>
  );
};

TodaySales.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  store: PropTypes.string.isRequired,
};

export default TodaySales;
