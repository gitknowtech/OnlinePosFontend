// frontend/src/components/ExpensesModal/ExpensesModal.js
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import axios from 'axios';
import './ExpensesModel.css'; // Ensure correct path

function ExpensesModal({ show, onClose, onAdd, user, store }) {
  const [remark, setRemark] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // For loading state

  const API_BASE_URL = 'http://localhost:5000/api/expenses';

  // Fetch today's expenses for the user
  const fetchTodayExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/today/${user}`);
      if (response.status >= 200 && response.status < 300) {
        setExpenses(response.data); // Always an array
        if (response.data.length === 0) {
          Swal.fire('Info', 'No expenses found for today', 'info');
        }
      } else {
        Swal.fire('Error', 'Failed to load expenses', 'error');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to load expenses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new expense
  const handleAddExpense = async () => {
    if (amount === '') {
      Swal.fire('Error', 'Amount is required', 'error');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Swal.fire('Error', 'Amount must be a positive number', 'error');
      return;
    }

    // Optional: You can enforce that `remark` is also required if desired
    // if (!remark.trim()) {
    //   Swal.fire('Error', 'Remark is required', 'error');
    //   return;
    // }

    try {
      const payload = {
        user,
        store,
        remark: remark.trim(),
        amount: parsedAmount,
      };

      const response = await axios.post(`${API_BASE_URL}/add`, payload);

      if (response.status >= 200 && response.status < 300) {
        Swal.fire('Success', 'Expense added successfully', 'success');
        setRemark('');
        setAmount('');
        fetchTodayExpenses(); // Re-fetch to update the list
        if (onAdd) onAdd(response.data); // Notify parent if necessary
      } else {
        Swal.fire('Error', 'Failed to add expense', 'error');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to add expense', 'error');
    }
  };

  // Update an expense
  const handleUpdateExpense = async (id, field, value) => {
    // Validate amount if updating the 'amount' field
    if (field === 'amount') {
      const parsedAmount = parseFloat(value);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Swal.fire('Error', 'Amount must be a positive number', 'error');
        fetchTodayExpenses(); // Revert changes
        return;
      }
      value = parsedAmount; // Ensure it's a number
    }

    try {
      const payload = { [field]: value };
      const response = await axios.put(`${API_BASE_URL}/update/${id}`, payload);

      if (response.status >= 200 && response.status < 300) {
        Swal.fire('Success', 'Expense updated successfully', 'success');
        // Optionally, update the local state without re-fetching
        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense.id === id ? { ...expense, [field]: value } : expense
          )
        );
      } else {
        Swal.fire('Error', 'Failed to update expense', 'error');
        fetchTodayExpenses(); // Revert changes
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update expense', 'error');
      fetchTodayExpenses(); // Revert changes
    }
  };

  // Handle input changes in the editable table
  const handleInputChange = (id, field, value) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id === id ? { ...expense, [field]: value } : expense
      )
    );
  };

  // Fetch expenses when modal is shown
  useEffect(() => {
    if (show) {
      fetchTodayExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  return ReactDOM.createPortal(
    <div id="modal-overlay-expenses">
      <div id="modal-content-expenses">
        <button id="modal-close-button-expenses" onClick={onClose}>
          &times;
        </button>

        <div className="modal-header-flex">
          <h2>Add New Expense</h2>
        </div>

        <div className="input-group">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <textarea
            placeholder="Remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          <button className="add-button" onClick={handleAddExpense}>
            Add Expense
          </button>
        </div>

        {isLoading ? (
          <div className="loading">Loading expenses...</div>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Store</th>
                <th>Amount</th>
                <th>Remark</th>
                <th>Save Time</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.user}</td>
                  <td>{expense.store}</td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateExpense(expense.id, 'amount', e.target.innerText)}
                    onInput={(e) => handleInputChange(expense.id, 'amount', e.target.innerText)}
                    className="editable-cell"
                  >
                    {expense.amount}
                  </td>
                  <td
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateExpense(expense.id, 'remark', e.target.innerText)}
                    onInput={(e) => handleInputChange(expense.id, 'remark', e.target.innerText)}
                    className="editable-cell"
                  >
                    {expense.remark}
                  </td>
                  <td>{new Date(expense.saveTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>,
    document.body
  );
}

ExpensesModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func, // Made optional
  user: PropTypes.string.isRequired,
  store: PropTypes.string.isRequired,
};

export default ExpensesModal;
