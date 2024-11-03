import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import './ExpensesModel.css'; // Import your CSS file

export default function ExpensesModel({ show, onClose, user, store, onAdd }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [expensesData, setExpensesData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [editingReason, setEditingReason] = useState('');

  useEffect(() => {
    if (show) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/expenses/fecth_expenses?user=${user}`);
          console.log('Fetched data:', response.data); // Add this line to inspect the data
          setExpensesData(response.data);
        } catch (error) {
          Swal.fire('Error', 'Failed to fetch expenses data', 'error');
        }
      };
      fetchData();
    }
  }, [show, user]);


  const handleAddExpense = async () => {
    if (!amount || !reason) {
      Swal.fire('Error', 'Amount and reason are required', 'warning');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/expenses/addExpenses', {
        user,
        store,
        amount,
        reason,
      });
      Swal.fire('Success', 'Expense added successfully', 'success');
      onAdd({ user, store, amount, reason, date: new Date().toISOString() });
      setAmount('');
      setReason('');
      setExpensesData((prev) => [
        ...prev,
        { user, store, amount, reason, date: new Date().toISOString() },
      ]);
    } catch (error) {
      Swal.fire('Error', 'Failed to add expense', 'error');
    }
  };

  const handleEditClick = (index, expense) => {
    setEditingIndex(index);
    setEditingAmount(expense.amount);
    setEditingReason(expense.reason);
  };

  const handleUpdateExpense = async (index) => {
    const updatedExpense = {
      ...expensesData[index],
      amount: editingAmount,
      reason: editingReason,
    };

    try {
      await axios.put(`http://localhost:5000/api/expenses/updateExpense`, updatedExpense);
      Swal.fire('Success', 'Expense updated successfully', 'success');

      setExpensesData((prev) => {
        const newData = [...prev];
        newData[index] = updatedExpense;
        return newData;
      });

      setEditingIndex(null);
    } catch (error) {
      Swal.fire('Error', 'Failed to update expense', 'error');
    }
  };

  // Helper function to format the date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
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

        <h3>Today's Expenses</h3>
        <table id="expenses_table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expensesData.map((expense, index) => (
              <tr key={index}>
                <td onDoubleClick={() => handleEditClick(index, expense)}>
                  {editingIndex === index ? (
                    <input
                      type="number"
                      value={editingAmount}
                      onChange={(e) => setEditingAmount(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateExpense(index)}
                    />
                  ) : (
                    expense.amount || 'N/A'
                  )}
                </td>
                <td onDoubleClick={() => handleEditClick(index, expense)}>
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editingReason}
                      onChange={(e) => setEditingReason(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateExpense(index)}
                    />
                  ) : (
                    expense.reason || 'N/A'
                  )}
                </td>
                <td>{formatDate(expense.date)}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
