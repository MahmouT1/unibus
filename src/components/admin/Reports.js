import React from 'react';
import './Reports.css';

const Reports = () => {
  return (
    <div className="reports">
      <h1>Reports</h1>
      <p>View analytics and reports</p>

      <section className="table-section">
        <h2>Monthly Subscription Revenues</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Subscription Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>January 2024</td>
              <td>Ahmed Hassan</td>
              <td>ahmed.hassan@email.com</td>
              <td>Premium</td>
              <td className="green">$299</td>
            </tr>
            <tr>
              <td>January 2024</td>
              <td>Sarah Johnson</td>
              <td>sarah.j@email.com</td>
              <td>Standard</td>
              <td className="green">$199</td>
            </tr>
            <tr>
              <td>February 2024</td>
              <td>Mohammed Ali</td>
              <td>m.ali@email.com</td>
              <td>Premium</td>
              <td className="green">$299</td>
            </tr>
            <tr>
              <td>February 2024</td>
              <td>Lisa Chen</td>
              <td>lisa.chen@email.com</td>
              <td>Basic</td>
              <td className="green">$99</td>
            </tr>
            <tr>
              <td>March 2024</td>
              <td>Omar Khalil</td>
              <td>omar.k@email.com</td>
              <td>Standard</td>
              <td className="green">$199</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="table-section">
        <h2>Weekly Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Expense Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Week 1 - March</td>
              <td>Fuel</td>
              <td>Bus fuel for routes</td>
              <td className="red">$450</td>
            </tr>
            <tr>
              <td>Week 1 - March</td>
              <td>Maintenance</td>
              <td>Vehicle maintenance</td>
              <td className="red">$320</td>
            </tr>
            <tr>
              <td>Week 2 - March</td>
              <td>Insurance</td>
              <td>Vehicle insurance</td>
              <td className="red">$280</td>
            </tr>
            <tr>
              <td>Week 2 - March</td>
              <td>Office Supplies</td>
              <td>Administrative supplies</td>
              <td className="red">$150</td>
            </tr>
            <tr>
              <td>Week 3 - March</td>
              <td>Fuel</td>
              <td>Bus fuel for routes</td>
              <td className="red">$480</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="table-section">
        <h2>Monthly Net Profits</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Revenue</th>
              <th>Total Expenses</th>
              <th>Net Profit</th>
              <th>Profit Margin</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>January 2024</td>
              <td>$12,450</td>
              <td className="red">$8,200</td>
              <td className="green">$4,250</td>
              <td>34.1%</td>
            </tr>
            <tr>
              <td>February 2024</td>
              <td>$15,680</td>
              <td className="red">$9,450</td>
              <td className="green">$6,230</td>
              <td>39.7%</td>
            </tr>
            <tr>
              <td>March 2024</td>
              <td>$18,920</td>
              <td className="red">$11,200</td>
              <td className="green">$7,720</td>
              <td>40.8%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="table-section">
        <h2>Weekly Drivers' Salary Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Driver Name</th>
              <th>Hours Worked</th>
              <th>Rate/Hour</th>
              <th>Total Salary</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Week 1 - March</td>
              <td>Khalid Ahmed</td>
              <td>45 hours</td>
              <td>$15/hr</td>
              <td className="red">$675</td>
            </tr>
            <tr>
              <td>Week 1 - March</td>
              <td>Hassan Mohamed</td>
              <td>40 hours</td>
              <td>$15/hr</td>
              <td className="red">$600</td>
            </tr>
            <tr>
              <td>Week 2 - March</td>
              <td>Ali Mahmoud</td>
              <td>42 hours</td>
              <td>$16/hr</td>
              <td className="red">$672</td>
            </tr>
            <tr>
              <td>Week 2 - March</td>
              <td>Omar Farouk</td>
              <td>38 hours</td>
              <td>$15/hr</td>
              <td className="red">$570</td>
            </tr>
            <tr>
              <td>Week 3 - March</td>
              <td>Youssef Ibrahim</td>
              <td>44 hours</td>
              <td>$16/hr</td>
              <td className="red">$704</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="summary-stats">
        <div className="stat blue">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">$47,050</div>
          <div className="stat-subtext">Last 3 months</div>
        </div>
        <div className="stat red">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">$28,850</div>
          <div className="stat-subtext">Last 3 months</div>
        </div>
        <div className="stat green">
          <div className="stat-label">Net Profit</div>
          <div className="stat-value">$18,200</div>
          <div className="stat-subtext">Last 3 months</div>
        </div>
        <div className="stat purple">
          <div className="stat-label">Avg. Profit Margin</div>
          <div className="stat-value">38.7%</div>
          <div className="stat-subtext">Last 3 months</div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
