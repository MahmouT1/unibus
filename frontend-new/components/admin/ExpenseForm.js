import React, { useState } from 'react';
import './ExpenseForm.css';

const ExpenseForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'other',
    description: '',
    amount: '',
    category: 'operational',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expenseTypes = [
    { value: 'fuel', label: 'Fuel' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'office_supplies', label: 'Office Supplies' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    { value: 'operational', label: 'Operational' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          createdBy: userData.email || 'admin'
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess && onSuccess(result.expense);
        onClose();
      } else {
        setError(result.message || 'Failed to create expense');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form-overlay">
      <div className="expense-form-modal">
        <div className="expense-form-header">
          <h2>Add Side Expense</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Expense Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              {expenseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter expense description"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (EGP) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes (optional)"
              rows="3"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
