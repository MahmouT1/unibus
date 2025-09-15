import React, { useState } from 'react';
import './SubscriptionManagement.css';

const subscriptionApplications = [
  {
    id: 1,
    initials: 'SJ',
    name: 'Sarah Johnson',
    studentId: '2024001',
    email: 'sarah.johnson@email.com',
    appliedDate: 'Jan 15, 2024',
    status: 'Pending',
    avatarColor: '#d16ade',
  },
  {
    id: 2,
    initials: 'MC',
    name: 'Michael Chen',
    studentId: '2024002',
    email: 'michael.chen@email.com',
    appliedDate: 'Jan 14, 2024',
    status: 'Pending',
    avatarColor: '#4aa6e8',
  },
  {
    id: 3,
    initials: 'ER',
    name: 'Emma Rodriguez',
    studentId: '2024003',
    email: 'emma.rodriguez@email.com',
    appliedDate: 'Jan 13, 2024',
    status: 'Confirmed',
    avatarColor: '#3ac47d',
  },
  {
    id: 4,
    initials: 'DK',
    name: 'David Kim',
    studentId: '2024004',
    email: 'david.kim@email.com',
    appliedDate: 'Jan 12, 2024',
    status: 'Pending',
    avatarColor: '#f06a3f',
  },
  {
    id: 5,
    initials: 'LT',
    name: 'Lisa Thompson',
    studentId: '2024005',
    email: 'lisa.thompson@email.com',
    appliedDate: 'Jan 11, 2024',
    status: 'Pending',
    avatarColor: '#8a7edb',
  },
];

const SubscriptionManagement = () => {
  const [selectedSubscription, setSelectedSubscription] = useState(subscriptionApplications[0]);

  const handleEmailClick = (subscription) => {
    setSelectedSubscription(subscription);
  };

  return (
    <div className="subscription-management">
      <h1>Student Subscription Management</h1>
      <p>Review and confirm monthly subscription applications</p>

      <section className="subscription-applications">
        <h2>Subscription Applications</h2>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th>Applied Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptionApplications.map((sub) => (
              <tr key={sub.id}>
                <td>
                  <div className="student-avatar" style={{ backgroundColor: sub.avatarColor }}>
                    {sub.initials}
                  </div>
                  <div className="student-info">
                    <div className="student-name">{sub.name}</div>
                    <div className="student-id">Student ID: {sub.studentId}</div>
                  </div>
                </td>
                <td>
                  <button
                    className="email-button"
                    onClick={() => handleEmailClick(sub)}
                    type="button"
                  >
                    {sub.email}
                  </button>
                </td>
                <td>{sub.appliedDate}</td>
                <td>
                  <span className={`status ${sub.status.toLowerCase()}`}>
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="subscription-confirmation">
        <h2>Subscription Confirmation</h2>
        <div className="student-info-box">
          <p><strong>Name:</strong> {selectedSubscription.name}</p>
          <p><strong>Email:</strong> {selectedSubscription.email}</p>
        </div>

        <form>
          <label htmlFor="startDate">Subscription Start Date</label>
          <input type="date" id="startDate" name="startDate" />

          <label htmlFor="renewalDate">Next Renewal Date</label>
          <input type="date" id="renewalDate" name="renewalDate" />

          <fieldset>
            <legend>Payment Method</legend>
            <label>
              <input type="radio" name="paymentMethod" value="cash" defaultChecked />
              🇳🇬 Cash Payment
            </label>
            <label>
              <input type="radio" name="paymentMethod" value="bank" />
              🏦 Bank Transfer
            </label>
          </fieldset>

          <div className="form-buttons">
            <button type="submit" className="btn-confirm">✅ Confirm Subscription</button>
            <button type="button" className="btn-cancel">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default SubscriptionManagement;
