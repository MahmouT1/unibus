import React, { useState } from 'react';
import './ExpenseForm.css';

const DriverSalaryForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    driverName: '',
    amount: '',
    hoursWorked: '',
    ratePerHour: '',
    paymentMethod: 'bank_transfer',
    status: 'paid',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAmount = () => {
    const hours = parseFloat(formData.hoursWorked) || 0;
    const rate = parseFloat(formData.ratePerHour) || 0;
    if (hours > 0 && rate > 0) {
      setFormData(prev => ({
        ...prev,
        amount: (hours * rate).toFixed(2)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('/api/driver-salaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          hoursWorked: parseFloat(formData.hoursWorked) || 0,
          ratePerHour: parseFloat(formData.ratePerHour) || 0,
          createdBy: userData.email || 'admin'
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess && onSuccess(result.salary);
        onClose();
      } else {
        setError(result.message || 'Failed to create driver salary');
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
          <h2>Add Driver Salary</h2>
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
            <label htmlFor="driverName">Driver Name *</label>
            <input
              type="text"
              id="driverName"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              placeholder="Enter driver name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hoursWorked">Hours Worked</label>
              <input
                type="number"
                id="hoursWorked"
                name="hoursWorked"
                value={formData.hoursWorked}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.5"
                onBlur={calculateAmount}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ratePerHour">Rate per Hour (EGP)</label>
              <input
                type="number"
                id="ratePerHour"
                name="ratePerHour"
                value={formData.ratePerHour}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                onBlur={calculateAmount}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Total Amount (EGP) *</label>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
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
              {loading ? 'Adding...' : 'Add Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverSalaryForm;
