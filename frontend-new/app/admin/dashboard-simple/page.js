'use client';

export default function AdminDashboard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          🎯 Admin Dashboard
        </h1>
        
        <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '30px' }}>
          <p style={{ margin: 0, color: '#166534', fontWeight: '600' }}>
            ✅ Successfully logged in as Administrator!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>👥 User Management</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Manage system users and permissions</p>
            <a href="/admin/users" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Manage Users →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>📊 Attendance</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>View and manage attendance records</p>
            <a href="/admin/attendance" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              View Attendance →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>📈 Reports</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Generate and view system reports</p>
            <a href="/admin/reports" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              View Reports →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>💳 Subscriptions</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Manage student subscriptions</p>
            <a href="/admin/subscriptions" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Manage Subscriptions →
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/working-login';
            }}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}