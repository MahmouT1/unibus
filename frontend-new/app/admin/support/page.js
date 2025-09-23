'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [resolution, setResolution] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in as admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth');
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      router.push('/student/portal');
      return;
    }
    
    fetchTickets();
  }, [router]);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/support', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      } else {
        console.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId, updates) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/support/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchTickets();
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket({ ...selectedTicket, ...updates });
        }
      } else {
        alert('Failed to update ticket. Please try again.');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = (ticketId, newStatus) => {
    updateTicket(ticketId, { status: newStatus });
  };

  const handleSaveNotes = (ticketId) => {
    if (adminNotes.trim()) {
      updateTicket(ticketId, { adminNotes: adminNotes.trim() });
      setAdminNotes('');
    }
  };

  const handleSaveAssignment = (ticketId) => {
    if (assignedTo.trim()) {
      updateTicket(ticketId, { assignedTo: assignedTo.trim() });
      setAssignedTo('');
    }
  };

  const handleSaveResolution = (ticketId) => {
    if (resolution.trim()) {
      updateTicket(ticketId, { resolution: resolution.trim() });
      setResolution('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ef4444';
      case 'in-progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{ 
          textAlign: 'center',
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            animation: 'spin 1s linear infinite'
          }}>⏳</div>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b'
          }}>Loading support tickets...</div>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: isMobile ? '16px' : '24px',
      width: '100%',
      overflowX: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          opacity: '0.05',
          zIndex: 0
        }} />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
              }}>
                🎧
              </div>
              <div>
                <h1 style={{ 
                  margin: '0', 
                  fontSize: '36px', 
                  fontWeight: '800', 
                  color: '#1e293b',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1'
                }}>
                  Support Center
                </h1>
                <p style={{ 
                  margin: '0', 
                  color: '#64748b', 
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  Manage and resolve student support tickets efficiently
                </p>
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/admin/dashboard')}
              style={{
                padding: '14px 28px',
                background: 'white',
                color: '#64748b',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            >
              ← Dashboard
            </button>
            
            <button
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              📊 Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {[
          { label: 'Total Tickets', value: tickets.length, color: '#667eea', icon: '📋' },
          { label: 'Open', value: tickets.filter(t => t.status === 'open').length, color: '#ef4444', icon: '🔴' },
          { label: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, color: '#f59e0b', icon: '🟡' },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: '#10b981', icon: '🟢' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
          }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: `${stat.color}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: '800',
                color: stat.color
              }}>
                {stat.value}
              </div>
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#64748b'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: '24px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              fontSize: '14px'
            }}>
              Search Tickets
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by subject, email, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#9ca3af'
              }}>
                🔍
              </div>
            </div>
          </div>

          {/* Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#374151',
              fontSize: '14px'
            }}>
              Filter by Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Tickets ({tickets.length})</option>
              <option value="open">Open ({tickets.filter(t => t.status === 'open').length})</option>
              <option value="in-progress">In Progress ({tickets.filter(t => t.status === 'in-progress').length})</option>
              <option value="resolved">Resolved ({tickets.filter(t => t.status === 'resolved').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: '24px' 
      }}>
        {/* Tickets List */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              margin: '0', 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1e293b'
            }}>
              Support Tickets ({filteredTickets.length})
            </h2>
            <div style={{
              padding: '6px 12px',
              background: '#f1f5f9',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#64748b'
            }}>
              {filteredTickets.length} tickets
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px',
                opacity: '0.5'
              }}>
                📭
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                No tickets found
              </h3>
              <p style={{
                margin: '0',
                fontSize: '14px',
                color: '#9ca3af'
              }}>
                No support tickets match the current filter
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: '20px',
                    border: selectedTicket?._id === ticket._id ? '2px solid #667eea' : '2px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedTicket?._id === ticket._id ? '#f8fafc' : 'white'
                  }}
                  onMouseOver={(e) => {
                    if (selectedTicket?._id !== ticket._id) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedTicket?._id !== ticket._id) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b',
                        lineHeight: '1.4'
                      }}>
                        {ticket.subject}
                      </h3>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#64748b',
                        lineHeight: '1.4'
                      }}>
                        {ticket.email}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: `${getStatusColor(ticket.status)}15`,
                        color: getStatusColor(ticket.status)
                      }}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                      {ticket.priority && (
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: `${getPriorityColor(ticket.priority)}15`,
                          color: getPriorityColor(ticket.priority)
                        }}>
                          {ticket.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#9ca3af'
                  }}>
                    <span>{ticket.category}</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          {selectedTicket ? (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <h2 style={{ 
                  margin: '0', 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: '#1e293b'
                }}>
                  Ticket Details
                </h2>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: `${getStatusColor(selectedTicket.status)}15`,
                    color: getStatusColor(selectedTicket.status)
                  }}>
                    {selectedTicket.status.replace('-', ' ')}
                  </span>
                  {selectedTicket.priority && (
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: `${getPriorityColor(selectedTicket.priority)}15`,
                      color: getPriorityColor(selectedTicket.priority)
                    }}>
                      {selectedTicket.priority}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {selectedTicket.subject}
                </h3>
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  {selectedTicket.message}
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      Student Email
                    </label>
                    <div style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      fontWeight: '500'
                    }}>
                      {selectedTicket.email}
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      Category
                    </label>
                    <div style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      fontWeight: '500'
                    }}>
                      {selectedTicket.category}
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      Created
                    </label>
                    <div style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      fontWeight: '500'
                    }}>
                      {formatDate(selectedTicket.createdAt)}
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#64748b',
                      marginBottom: '4px'
                    }}>
                      Assigned To
                    </label>
                    <div style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      fontWeight: '500'
                    }}>
                      {selectedTicket.assignedTo || 'Unassigned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Update Status
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {['open', 'in-progress', 'resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedTicket._id, status)}
                      disabled={updating}
                      style={{
                        padding: '8px 16px',
                        border: selectedTicket.status === status ? '2px solid #667eea' : '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: selectedTicket.status === status ? '#667eea' : 'white',
                        color: selectedTicket.status === status ? 'white' : '#64748b',
                        opacity: updating ? 0.5 : 1
                      }}
                    >
                      {status.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Admin Notes
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Add admin notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  />
                  <button
                    onClick={() => handleSaveNotes(selectedTicket._id)}
                    disabled={!adminNotes.trim() || updating}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: (!adminNotes.trim() || updating) ? 0.5 : 1
                    }}
                  >
                    Save
                  </button>
                </div>
                {selectedTicket.adminNotes && (
                  <div style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#374151',
                    border: '1px solid #e2e8f0'
                  }}>
                    {selectedTicket.adminNotes}
                  </div>
                )}
              </div>

              {/* Assignment */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Assign To
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Assign to admin..."
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  />
                  <button
                    onClick={() => handleSaveAssignment(selectedTicket._id)}
                    disabled={!assignedTo.trim() || updating}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: (!assignedTo.trim() || updating) ? 0.5 : 1
                    }}
                  >
                    Assign
                  </button>
                </div>
              </div>

              {/* Resolution */}
              <div>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Resolution
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Add resolution notes..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  />
                  <button
                    onClick={() => handleSaveResolution(selectedTicket._id)}
                    disabled={!resolution.trim() || updating}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: (!resolution.trim() || updating) ? 0.5 : 1
                    }}
                  >
                    Resolve
                  </button>
                </div>
                {selectedTicket.resolution && (
                  <div style={{
                    padding: '12px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#166534',
                    border: '1px solid #bbf7d0'
                  }}>
                    {selectedTicket.resolution}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px',
                opacity: '0.5'
              }}>
                📋
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Select a Ticket
              </h3>
              <p style={{
                margin: '0',
                fontSize: '14px',
                color: '#9ca3af'
              }}>
                Choose a support ticket from the list to view details and manage it
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}