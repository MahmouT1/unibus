import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './TransportationTimes.css';

const TransportationTimes = () => {
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState('first');

  const transportationData = {
    first: {
      time: '08:00 AM',
      stations: [
        {
          name: 'Central Station',
          location: 'Downtown Area',
          coordinates: '30.0444,31.2357',
          parking: 'Main Parking Lot A',
          capacity: 150,
          status: 'active'
        },
        {
          name: 'University Station',
          location: 'Campus Entrance',
          coordinates: '30.0569,31.2289',
          parking: 'Student Parking Zone B',
          capacity: 200,
          status: 'active'
        },
        {
          name: 'Metro Station',
          location: 'Subway Connection',
          coordinates: '30.0528,31.2337',
          parking: 'Underground Parking C',
          capacity: 100,
          status: 'active'
        },
        {
          name: 'Bus Terminal',
          location: 'Highway Junction',
          coordinates: '30.0489,31.2398',
          parking: 'Surface Parking D',
          capacity: 180,
          status: 'active'
        }
      ]
    },
    second: {
      time: '02:00 PM',
      stations: [
        {
          name: 'Central Station',
          location: 'Downtown Area',
          coordinates: '30.0444,31.2357',
          parking: 'Main Parking Lot A',
          capacity: 120,
          status: 'active'
        },
        {
          name: 'University Station',
          location: 'Campus Entrance',
          coordinates: '30.0569,31.2289',
          parking: 'Student Parking Zone B',
          capacity: 160,
          status: 'active'
        },
        {
          name: 'Metro Station',
          location: 'Subway Connection',
          coordinates: '30.0528,31.2337',
          parking: 'Underground Parking C',
          capacity: 80,
          status: 'active'
        },
        {
          name: 'Bus Terminal',
          location: 'Highway Junction',
          coordinates: '30.0489,31.2398',
          parking: 'Surface Parking D',
          capacity: 140,
          status: 'active'
        }
      ]
    }
  };

  const handleBackToPortal = () => {
    router.push('/student/portal');
  };

  const openGoogleMaps = (coordinates, stationName) => {
    const url = `https://www.google.com/maps?q=${coordinates}&z=15&t=m`;
    window.open(url, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'closed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCapacityColor = (capacity) => {
    if (capacity >= 150) return '#10b981';
    if (capacity >= 100) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="transportation-page">
      {/* Header Section */}
      <div className="transportation-header">
        <button className="back-btn" onClick={handleBackToPortal}>
          <span className="btn-icon">←</span>
          Back to Portal
        </button>
        <div className="header-content">
          <h1>Transportation Times & Locations</h1>
          <p>View bus schedules, station locations, and parking information</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="transportation-content">
        {/* Time Selection Tabs */}
        <div className="time-selection-tabs">
          <button
            className={`time-tab ${selectedTime === 'first' ? 'active' : ''}`}
            onClick={() => setSelectedTime('first')}
          >
            <span className="tab-icon">🌅</span>
            <div className="tab-content">
              <span className="tab-time">{transportationData.first.time}</span>
              <span className="tab-label">First Appointment</span>
            </div>
          </button>
          
          <button
            className={`time-tab ${selectedTime === 'second' ? 'active' : ''}`}
            onClick={() => setSelectedTime('second')}
          >
            <span className="tab-icon">🌆</span>
            <div className="tab-content">
              <span className="tab-time">{transportationData.second.time}</span>
              <span className="tab-label">Second Appointment</span>
            </div>
          </button>
        </div>

        {/* Transportation Table */}
        <div className="transportation-table-card">
          <div className="table-header">
            <span className="table-icon">🚌</span>
            <h2>Station Information - {selectedTime === 'first' ? 'Morning' : 'Afternoon'} Schedule</h2>
            <p>Departure Time: {transportationData[selectedTime].time}</p>
          </div>

          <div className="table-container">
            <table className="transportation-table">
              <thead>
                <tr>
                  <th>Station Name</th>
                  <th>Location</th>
                  <th>Parking Area</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transportationData[selectedTime].stations.map((station, index) => (
                  <tr key={index} className="station-row">
                    <td className="station-name">
                      <span className="station-icon">📍</span>
                      <div>
                        <span className="name">{station.name}</span>
                        <span className="location">{station.location}</span>
                      </div>
                    </td>
                    <td className="station-location">
                      <span className="location-text">{station.location}</span>
                    </td>
                    <td className="parking-info">
                      <span className="parking-icon">🅿️</span>
                      <span className="parking-text">{station.parking}</span>
                    </td>
                    <td className="capacity-info">
                      <span 
                        className="capacity-badge"
                        style={{ backgroundColor: getCapacityColor(station.capacity) }}
                      >
                        {station.capacity} seats
                      </span>
                    </td>
                    <td className="status-info">
                      <span 
                        className="status-dot"
                        style={{ backgroundColor: getStatusColor(station.status) }}
                      ></span>
                      <span className="status-text">{station.status}</span>
                    </td>
                    <td className="actions">
                      <button
                        className="map-btn"
                        onClick={() => openGoogleMaps(station.coordinates, station.name)}
                      >
                        <span className="btn-icon">🗺️</span>
                        View on Map
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">⏰</span>
            <div className="stat-content">
              <span className="stat-value">{transportationData[selectedTime].time}</span>
              <span className="stat-label">Departure Time</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">🚏</span>
            <div className="stat-content">
              <span className="stat-value">{transportationData[selectedTime].stations.length}</span>
              <span className="stat-label">Total Stations</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">💺</span>
            <div className="stat-content">
              <span className="stat-value">
                {transportationData[selectedTime].stations.reduce((total, station) => total + station.capacity, 0)}
              </span>
              <span className="stat-label">Total Capacity</span>
            </div>
          </div>
          
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-content">
              <span className="stat-value">
                {transportationData[selectedTime].stations.filter(station => station.status === 'active').length}
              </span>
              <span className="stat-label">Active Stations</span>
            </div>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="instructions-card">
          <div className="instructions-header">
            <span className="instructions-icon">⚠️</span>
            <h3>Important Instructions</h3>
          </div>
          
          <div className="instructions-content">
            <div className="instruction-item">
              <span className="instruction-icon">⏰</span>
              <div className="instruction-text">
                <h4>Punctuality</h4>
                <p>Please arrive at least 15 minutes before departure time. Late arrivals may result in missing your scheduled transportation.</p>
              </div>
            </div>
            
            <div className="instruction-item">
              <span className="instruction-icon">💺</span>
              <div className="instruction-text">
                <h4>Seat Assignment</h4>
                <p>Seats are assigned on a first-come, first-served basis. Please adhere to your assigned seat and do not change seats without permission.</p>
              </div>
            </div>
            
            <div className="instruction-item">
              <span className="instruction-icon">🚫</span>
              <div className="instruction-text">
                <h4>No Late Boarding</h4>
                <p>Transportation departs exactly at the scheduled time. No exceptions will be made for late arrivals.</p>
              </div>
            </div>
            
            <div className="instruction-item">
              <span className="instruction-icon">📱</span>
              <div className="instruction-text">
                <h4>Contact Information</h4>
                <p>For any issues or questions, contact the transportation office at +20 123 456 789 or email transport@university.edu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="additional-info-card">
          <div className="info-header">
            <span className="info-icon">ℹ️</span>
            <h3>Additional Information</h3>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🎫</span>
              <div>
                <h4>Ticket Requirements</h4>
                <p>Valid student ID and transportation pass required for boarding</p>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon">🛄</span>
              <div>
                <h4>Luggage Policy</h4>
                <p>One carry-on bag and one personal item allowed per passenger</p>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon">🌦️</span>
              <div>
                <h4>Weather Conditions</h4>
                <p>Service may be delayed or cancelled due to severe weather conditions</p>
              </div>
            </div>
            
            <div className="info-item">
              <span className="info-icon">📅</span>
              <div>
                <h4>Holiday Schedule</h4>
                <p>Modified schedules apply during university holidays and breaks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportationTimes;
