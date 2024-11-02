import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import './ExpensesModel.css';

function ExpensesModel({ show, onClose, onAdd, user, store }) {
  const [remark, setRemark] = useState('');
  const [amount, setAmount] = useState('');
  const [expenses, setExpenses] = useState([]); // Store expenses list

  if (!show) return null;

  const handleAddExpense = async () => {
    if (!remark || !amount) {
      Swal.fire('Error', 'Please fill out all required fields', 'error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/expenses/add_expenses', {
        user,
        store,
        remark,
        amount,
      });

      Swal.fire('Success', 'Expense added successfully', 'success');
      const newExpense = {
        id: response.data.expenseId,
        user,
        store,
        remark,
        amount,
      };
      setExpenses([...expenses, newExpense]); // Update expenses list
      onAdd(newExpense);

      // Clear fields
      setRemark('');
      setAmount('');
    } catch (error) {
      Swal.fire('Error', 'Failed to add expense', 'error');
    }
  };

  const handleEditExpense = (id, field, value) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
  };

  const handleSaveEdit = async (id, field, value) => {
    try {
      await axios.put(`http://localhost:5000/api/expenses/update_expense/${id}`, {
        [field]: value
      });
      Swal.fire('Success', 'Expense updated successfully', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to update expense', 'error');
    }
  };

  return ReactDOM.createPortal(
    <div id="modal-overlay-expenses">
      <div id="modal-content-expenses">
        <button id="modal-close-button-expenses" onClick={onClose}>X</button>
        
        {/* Header with Icon and Text */}
        <div className="modal-header-flex">
          <h2>Add New Expense</h2>
        </div>

        {/* Input Fields and Add Button */}
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
          <button className="add-button" onClick={handleAddExpense}>Add Expense</button>
        </div>

        {/* Expenses Table */}
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
                  onBlur={(e) => handleSaveEdit(expense.id, 'amount', e.target.innerText)}
                  onInput={(e) => handleEditExpense(expense.id, 'amount', e.target.innerText)}
                >
                  {expense.amount}
                </td>
                <td
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleSaveEdit(expense.id, 'remark', e.target.innerText)}
                  onInput={(e) => handleEditExpense(expense.id, 'remark', e.target.innerText)}
                >
                  {expense.remark}
                </td>
                <td>{expense.saveTime ? new Date(expense.saveTime).toLocaleString() : 'Now'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>,
    document.body
  );
}

export default ExpensesModel;
