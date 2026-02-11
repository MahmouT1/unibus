import React, { useState, useEffect } from 'react';
import './Reports.css';
import ExpenseForm from './ExpenseForm';
import DriverSalaryForm from './DriverSalaryForm';

const Reports = () => {
  const [activeSection, setActiveSection] = useState('revenue');
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = previous week, etc.
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [revenueData, setRevenueData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [driverSalaryData, setDriverSalaryData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalDriverSalaries: 0,
    netProfit: 0
  });

  // Form states
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);

  // Get current week date range
  const getWeekDateRange = (weekOffset = 0) => {
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + (weekOffset * 7));
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);
    
    return {
      start: currentWeekStart.toISOString().split('T')[0],
      end: currentWeekEnd.toISOString().split('T')[0],
      label: weekOffset === 0 ? 'Current Week' : `Week ${weekOffset} ago`
    };
  };

  const currentWeek = getWeekDateRange(selectedWeek);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('📊 Fetching reports data for:', currentWeek);
      const [revenueRes, expenseRes, driverRes] = await Promise.all([
        fetch('/api/students/subscriptions-data?admin=true'), // Use working subscription API
        fetch(`/api/expenses?startDate=${currentWeek.start}&endDate=${currentWeek.end}`),
        fetch(`/api/driver-salaries?startDate=${currentWeek.start}&endDate=${currentWeek.end}`)
      ]);

      const [revenueData, expenseData, driverData] = await Promise.all([
        revenueRes.json(),
        expenseRes.json(),
        driverRes.json()
      ]);

      console.log('📊 Revenue API response:', revenueData);
      console.log('📊 Expense API response:', expenseData);
      console.log('📊 Driver API response:', driverData);

      // Handle subscription revenue data
      let subscriptionRecords = [];
      if (revenueData.success && revenueData.students) {
        subscriptionRecords = Object.values(revenueData.students);
        setRevenueData(subscriptionRecords);
        console.log(`✅ Loaded ${subscriptionRecords.length} subscription records`);
      }

      // Handle expense data
      if (expenseData.success) {
        setExpenseData(expenseData.expenses || expenseData.data || []);
        console.log(`✅ Loaded ${(expenseData.expenses || expenseData.data || []).length} expenses`);
      }

      // Handle driver salary data
      if (driverData.success) {
        setDriverSalaryData(driverData.salaries || driverData.data || []);
        console.log(`✅ Loaded ${(driverData.salaries || driverData.data || []).length} driver salaries`);
      }

      // Calculate summary stats
      const totalRevenue = subscriptionRecords.reduce((sum, sub) => sum + (sub.totalPaid || 0), 0);
      const totalExpenses = (expenseData.expenses || expenseData.data || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const totalDriverSalaries = (driverData.salaries || driverData.data || []).reduce((sum, sal) => sum + (sal.amount || 0), 0);
      const netProfit = totalRevenue - totalExpenses - totalDriverSalaries;

      console.log(`💰 Financial Summary:`, {
        totalRevenue,
        totalExpenses,
        totalDriverSalaries,
        netProfit
      });

      setSummaryStats({
        totalRevenue,
        totalExpenses,
        totalDriverSalaries,
        netProfit
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWeek]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('reports-content');
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleExpenseSuccess = () => {
    setShowExpenseForm(false);
    fetchData(); // Refresh data after adding expense
  };

  const handleDriverSuccess = () => {
    setShowDriverForm(false);
    fetchData(); // Refresh data after adding driver salary
  };


  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports data...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <h1>Financial Reports</h1>
          <p>Comprehensive financial overview and analysis</p>
        </div>
        <div className="header-actions">
          <div className="week-selector">
            <label>Week:</label>
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            >
              <option value={0}>Current Week</option>
              <option value={1}>1 Week Ago</option>
              <option value={2}>2 Weeks Ago</option>
              <option value={3}>3 Weeks Ago</option>
              <option value={4}>4 Weeks Ago</option>
            </select>
          </div>
          <button onClick={handlePrint} className="print-btn">
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="stat-subtext">{currentWeek.label}</div>
          </div>
        </div>
        <div className="stat-card expenses">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <div className="stat-label">Side Expenses</div>
            <div className="stat-value">{formatCurrency(summaryStats.totalExpenses)}</div>
            <div className="stat-subtext">{currentWeek.label}</div>
          </div>
        </div>
        <div className="stat-card drivers">
          <div className="stat-icon">🚌</div>
          <div className="stat-content">
            <div className="stat-label">Driver Salaries</div>
            <div className="stat-value">{formatCurrency(summaryStats.totalDriverSalaries)}</div>
            <div className="stat-subtext">{currentWeek.label}</div>
          </div>
        </div>
        <div className="stat-card profit">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Net Profit</div>
            <div className="stat-value">{formatCurrency(summaryStats.netProfit)}</div>
            <div className="stat-subtext">{currentWeek.label}</div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="section-tabs">
        <button 
          className={activeSection === 'revenue' ? 'active' : ''}
          onClick={() => setActiveSection('revenue')}
        >
          💰 Revenue
        </button>
        <button 
          className={activeSection === 'expenses' ? 'active' : ''}
          onClick={() => setActiveSection('expenses')}
        >
          💸 Side Expenses
        </button>
        <button 
          className={activeSection === 'drivers' ? 'active' : ''}
          onClick={() => setActiveSection('drivers')}
        >
          🚌 Driver Salaries
        </button>
        <button 
          className={activeSection === 'profit' ? 'active' : ''}
          onClick={() => setActiveSection('profit')}
        >
          📊 Net Profit
        </button>
      </div>

      {/* Reports Content */}
      <div id="reports-content" className="reports-content">
        {/* Revenue Section */}
        {activeSection === 'revenue' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Revenue from Subscriptions</h2>
              <p>Student subscription payments for {currentWeek.label}</p>
            </div>
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Subscription Status</th>
                    <th>Amount Paid</th>
                    <th>Payment Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No subscription data found for this week
                      </td>
                    </tr>
                  ) : (
                    revenueData.map((subscription, index) => (
                      <tr key={index}>
                        <td>{subscription.studentName || 'N/A'}</td>
                        <td>{subscription.studentEmail || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${subscription.status || 'inactive'}`}>
                            {subscription.status || 'Inactive'}
                          </span>
                        </td>
                        <td className="amount positive">
                          {formatCurrency(subscription.totalPaid || 0)}
                        </td>
                        <td>{formatDate(subscription.lastPaymentDate || subscription.confirmationDate)}</td>
                        <td>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete the subscription for ${subscription.studentName || subscription.studentEmail}?`)) {
                                try {
                                  const token = localStorage.getItem('token');
                                  const response = await fetch(`/api/subscription/delete/${subscription.studentEmail}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    }
                                  });

                                  const result = await response.json();

                                  if (result.success) {
                                    alert(`Subscription for ${subscription.studentName || subscription.studentEmail} deleted successfully!`);
                                    // Refresh the data
                                    fetchData();
                                  } else {
                                    alert(`Failed to delete subscription: ${result.message}`);
                                  }
                                } catch (error) {
                                  console.error('Delete error:', error);
                                  alert('An error occurred while deleting the subscription');
                                }
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '8px',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#fef2f2';
                              e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.transform = 'scale(1)';
                            }}
                            title={`Delete subscription for ${subscription.studentName || subscription.studentEmail}`}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Side Expenses Section */}
        {activeSection === 'expenses' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Side Expenses</h2>
              <div className="section-actions">
                <button 
                  onClick={() => setShowExpenseForm(true)}
                  className="add-btn"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  ➕ Add Expense
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        No expenses recorded for this week
                      </td>
                    </tr>
                  ) : (
                    expenseData.map((expense) => (
                      <tr key={expense._id}>
                        <td>{formatDate(expense.date)}</td>
                        <td>
                          <span className="type-badge">
                            {expense.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>{expense.description}</td>
                        <td>{expense.category}</td>
                        <td className="amount negative">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Driver Salaries Section */}
        {activeSection === 'drivers' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Driver Salaries</h2>
              <div className="section-actions">
                <button 
                  onClick={() => setShowDriverForm(true)}
                  className="add-btn"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  ➕ Add Driver Salary
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Driver Name</th>
                    <th>Hours Worked</th>
                    <th>Rate/Hour</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {driverSalaryData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        No driver salaries recorded for this week
                      </td>
                    </tr>
                  ) : (
                    driverSalaryData.map((salary) => (
                      <tr key={salary._id}>
                        <td>{formatDate(salary.date)}</td>
                        <td>{salary.driverName}</td>
                        <td>{salary.hoursWorked || 0} hrs</td>
                        <td>{formatCurrency(salary.ratePerHour || 0)}</td>
                        <td className="amount negative">
                          {formatCurrency(salary.amount)}
                        </td>
                        <td>
                          <span className={`status-badge ${salary.status}`}>
                            {salary.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Net Profit Section */}
        {activeSection === 'profit' && (
          <div className="section-content">
            <div className="section-header">
              <h2>Net Profit Analysis</h2>
              <p>Financial summary for {currentWeek.label}</p>
            </div>
            <div className="profit-analysis">
              <div className="profit-breakdown">
                <div className="profit-item">
                  <div className="profit-label">Total Revenue</div>
                  <div className="profit-value positive">
                    {formatCurrency(summaryStats.totalRevenue)}
                  </div>
                </div>
                <div className="profit-item">
                  <div className="profit-label">Side Expenses</div>
                  <div className="profit-value negative">
                    -{formatCurrency(summaryStats.totalExpenses)}
                  </div>
                </div>
                <div className="profit-item">
                  <div className="profit-label">Driver Salaries</div>
                  <div className="profit-value negative">
                    -{formatCurrency(summaryStats.totalDriverSalaries)}
                  </div>
                </div>
                <div className="profit-divider"></div>
                <div className="profit-item total">
                  <div className="profit-label">Net Profit</div>
                  <div className={`profit-value ${summaryStats.netProfit >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(summaryStats.netProfit)}
                  </div>
                </div>
              </div>
              <div className="profit-chart">
                <div className="chart-placeholder">
                  <p>📊 Profit visualization would go here</p>
                  <p>Revenue: {formatCurrency(summaryStats.totalRevenue)}</p>
                  <p>Total Expenses: {formatCurrency(summaryStats.totalExpenses + summaryStats.totalDriverSalaries)}</p>
                  <p>Net Profit: {formatCurrency(summaryStats.netProfit)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modals */}
      {showExpenseForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <ExpenseForm 
              onClose={() => setShowExpenseForm(false)}
              onSuccess={handleExpenseSuccess}
            />
          </div>
        </div>
      )}

      {showDriverForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <DriverSalaryForm 
              onClose={() => setShowDriverForm(false)}
              onSuccess={handleDriverSuccess}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
