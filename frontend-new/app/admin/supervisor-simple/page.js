'use client';

export default function SupervisorDashboard() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          👨‍💼 Supervisor Dashboard
        </h1>
        
        <div style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '16px', marginBottom: '30px' }}>
          <p style={{ margin: 0, color: '#1e40af', fontWeight: '600' }}>
            ✅ Successfully logged in as Supervisor!
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>📱 QR Scanner</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>Scan student QR codes for attendance</p>
            <a href="/admin/attendance" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              Start Scanning →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>📊 Attendance Records</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>View attendance history</p>
            <a href="/admin/reports" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              View Records →
            </a>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>👥 Students</h3>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>View student information</p>
            <a href="/admin/users" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              View Students →
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