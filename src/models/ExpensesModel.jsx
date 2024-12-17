import { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import PropTypes from 'prop-types';
import './ExpensesModel.css'; // Import your CSS file

export default function ExpensesModel({ show, onClose, user, store, onAdd }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleAddExpense = async () => {
    if (!amount || !reason) {
      Swal.fire('Error', 'Amount and reason are required', 'warning');
      return;
    }

    try {
      await axios.post('http://154.26.129.243:5000/api/expenses/addExpenses', {
        user,
        store,
        amount,
        reason,
      });
      Swal.fire('Success', 'Expense added successfully', 'success');
      onAdd({ user, store, amount, reason, date: new Date().toISOString() });
      setAmount('');
      setReason('');
    } catch {
      Swal.fire('Error', 'Failed to add expense', 'error');
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div id="expenses_modal">
      <div id="expenses_modal_content">
        <span id="expenses_close_button" onClick={onClose}>
          &times;
        </span>
        <h2>Add Expense</h2>
        <div id="expenses_form_group">
          <label>Amount:</label>
          <input
            type="number"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <div id="expenses_form_group">
          <label>Reason:</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason"
          />
        </div>
        <button id="expenses_add_button" onClick={handleAddExpense}>Add Expense</button>
      </div>
    </div>
  );
}

ExpensesModel.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
};
