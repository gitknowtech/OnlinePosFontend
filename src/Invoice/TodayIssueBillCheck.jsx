
import PropTypes from "prop-types";
import SalesTable from "../Sales/salesTable";
import "../css1/TodayIssueBillCheck.css"; // Ensure proper styling

const TodayIssueBillCheck = ({ show, onClose, store }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay-today-issue-bill-check">
      <div className="modal-content-today-issue-bill-check">
        <button className="modal-close-button-today-issue-bill-check" onClick={onClose}>
          ×
        </button>
        <h2>Issue Bill Check</h2>
        <SalesTable store={store} />
      </div>
    </div>
  );
};

TodayIssueBillCheck.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  store: PropTypes.string.isRequired,
};

export default TodayIssueBillCheck;
