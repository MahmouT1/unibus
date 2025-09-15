// Simple Shift model for MongoDB native operations
export class ShiftSimple {
  constructor(data) {
    this.supervisorId = data.supervisorId;
    this.supervisorEmail = data.supervisorEmail;
    this.supervisorName = data.supervisorName;
    this.date = data.date || new Date();
    this.shiftStart = data.shiftStart || new Date();
    this.shiftEnd = data.shiftEnd || null;
    this.status = data.status || 'open';
    this.attendanceRecords = data.attendanceRecords || [];
    this.totalScans = data.totalScans || 0;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Convert to MongoDB document format
  toDocument() {
    return {
      supervisorId: this.supervisorId,
      supervisorEmail: this.supervisorEmail,
      supervisorName: this.supervisorName,
      date: this.date,
      shiftStart: this.shiftStart,
      shiftEnd: this.shiftEnd,
      status: this.status,
      attendanceRecords: this.attendanceRecords,
      totalScans: this.totalScans,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Add attendance record
  addAttendanceRecord(studentData) {
    const record = {
      studentId: studentData.studentId,
      studentEmail: studentData.studentEmail,
      studentName: studentData.studentName,
      scanTime: new Date(),
      location: studentData.location || '',
      notes: studentData.notes || ''
    };
    
    this.attendanceRecords.push(record);
    this.totalScans = this.attendanceRecords.length;
    this.updatedAt = new Date();
    
    return record;
  }

  // Close shift
  closeShift() {
    this.status = 'closed';
    this.shiftEnd = new Date();
    this.updatedAt = new Date();
  }

  // Get shift duration in minutes
  getShiftDuration() {
    if (!this.shiftEnd) {
      return Math.floor((new Date() - this.shiftStart) / (1000 * 60));
    }
    return Math.floor((this.shiftEnd - this.shiftStart) / (1000 * 60));
  }

  // Get shift summary
  getSummary() {
    return {
      supervisorName: this.supervisorName,
      supervisorEmail: this.supervisorEmail,
      date: this.date,
      shiftStart: this.shiftStart,
      shiftEnd: this.shiftEnd,
      status: this.status,
      totalScans: this.totalScans,
      duration: this.getShiftDuration(),
      attendanceRecords: this.attendanceRecords
    };
  }
}
