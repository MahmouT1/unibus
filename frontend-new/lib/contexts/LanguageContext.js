'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation files
const translations = {
  en: {
    // Common
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    close: 'Close',
    open: 'Open',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    
    // Student Portal
    studentPortal: 'Student Portal',
    welcomeStudent: 'Welcome, Student',
    attendance: 'Registration',
    transportation: 'Transportation',
    subscription: 'Subscription',
    support: 'Support',
    qrCode: 'QR Code',
    generateQR: 'Generate QR Code',
    myAttendance: 'My Attendance',
    attendanceHistory: 'Attendance History',
    totalDays: 'Total Days',
    presentDays: 'Present Days',
    absentDays: 'Absent Days',
    attendanceRate: 'Attendance Rate',
    transportationSchedule: 'Transportation Schedule',
    morningShift: 'Morning Shift',
    eveningShift: 'Evening Shift',
    subscriptionStatus: 'Subscription Status',
    active: 'Active',
    inactive: 'Inactive',
    expired: 'Expired',
    renewSubscription: 'Renew Subscription',
    supportTicket: 'Support Ticket',
    createTicket: 'Create Ticket',
    ticketHistory: 'Ticket History',
    pending: 'Pending',
    resolved: 'Resolved',
    inProgress: 'In Progress',
    
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    welcomeAdmin: 'Welcome, Admin',
    attendanceManagement: 'Attendance Management',
    studentManagement: 'Student Management',
    supervisorManagement: 'Supervisor Management',
    reports: 'Reports',
    subscriptionManagement: 'Subscription Management',
    supportManagement: 'Support Management',
    totalStudents: 'Total Students',
    totalSupervisors: 'Total Supervisors',
    totalAttendance: 'Total Attendance',
    todayAttendance: 'Today\'s Attendance',
    activeShifts: 'Active Shifts',
    completedShifts: 'Completed Shifts',
    studentSearch: 'Student Search',
    searchStudents: 'Search Students',
    studentName: 'Student Name',
    studentEmail: 'Student Email',
    studentId: 'Student ID',
    college: 'College',
    major: 'Major',
    grade: 'Grade',
    phoneNumber: 'Phone Number',
    address: 'Address',
    profilePhoto: 'Profile Photo',
    attendanceRecords: 'Attendance Records',
    scanTime: 'Scan Time',
    supervisor: 'Supervisor',
    shiftInfo: 'Shift Info',
    status: 'Status',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    shiftStart: 'Shift Start',
    shiftEnd: 'Shift End',
    shiftDuration: 'Shift Duration',
    totalRecords: 'Total Records',
    uniqueStudents: 'Unique Students',
    completedShifts: 'Completed Shifts',
    todayRecords: 'Today\'s Records',
    liveSupervisorMonitoring: 'Live Supervisor Monitoring',
    active: 'Active',
    live: 'LIVE',
    started: 'Started',
    duration: 'Duration',
    scans: 'Scans',
    recentActivity: 'Recent Activity',
    noScansYet: 'No scans yet',
    noAttendanceRecords: 'No attendance records found for the selected date and filters',
    selectDate: 'Select Date',
    filterBySupervisor: 'Filter by Supervisor',
    allSupervisors: 'All Supervisors',
    refreshData: 'Refresh Data',
    autoRefresh: 'Auto-refresh every 30s',
    page: 'Page',
    of: 'of',
    totalRecords: 'total records',
    attendanceRecordsManagement: 'Attendance Records Management'
  },
  
  ar: {
    // Common
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    refresh: 'تحديث',
    close: 'إغلاق',
    open: 'فتح',
    submit: 'إرسال',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    home: 'الرئيسية',
    dashboard: 'لوحة التحكم',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    
    // Student Portal
    studentPortal: 'بوابة الطالب',
    welcomeStudent: 'مرحباً، أيها الطالب',
    attendance: 'التسجيل',
    transportation: 'النقل',
    subscription: 'الاشتراك',
    support: 'الدعم',
    qrCode: 'رمز الاستجابة السريعة',
    generateQR: 'إنشاء رمز الاستجابة السريعة',
    myAttendance: 'حضوري',
    attendanceHistory: 'تاريخ الحضور',
    totalDays: 'إجمالي الأيام',
    presentDays: 'أيام الحضور',
    absentDays: 'أيام الغياب',
    attendanceRate: 'معدل الحضور',
    transportationSchedule: 'جدول النقل',
    morningShift: 'الوردية الصباحية',
    eveningShift: 'الوردية المسائية',
    subscriptionStatus: 'حالة الاشتراك',
    active: 'نشط',
    inactive: 'غير نشط',
    expired: 'منتهي الصلاحية',
    renewSubscription: 'تجديد الاشتراك',
    supportTicket: 'تذكرة الدعم',
    createTicket: 'إنشاء تذكرة',
    ticketHistory: 'تاريخ التذاكر',
    pending: 'في الانتظار',
    resolved: 'تم الحل',
    inProgress: 'قيد التنفيذ',
    
    // Admin Dashboard
    adminDashboard: 'لوحة تحكم الإدارة',
    welcomeAdmin: 'مرحباً، أيها المدير',
    attendanceManagement: 'إدارة الحضور',
    studentManagement: 'إدارة الطلاب',
    supervisorManagement: 'إدارة المشرفين',
    reports: 'التقارير',
    subscriptionManagement: 'إدارة الاشتراكات',
    supportManagement: 'إدارة الدعم',
    totalStudents: 'إجمالي الطلاب',
    totalSupervisors: 'إجمالي المشرفين',
    totalAttendance: 'إجمالي الحضور',
    todayAttendance: 'حضور اليوم',
    activeShifts: 'الورديات النشطة',
    completedShifts: 'الورديات المكتملة',
    studentSearch: 'البحث عن الطلاب',
    searchStudents: 'البحث عن الطلاب',
    studentName: 'اسم الطالب',
    studentEmail: 'بريد الطالب الإلكتروني',
    studentId: 'رقم الطالب',
    college: 'الكلية',
    major: 'التخصص',
    grade: 'المرحلة',
    phoneNumber: 'رقم الهاتف',
    address: 'العنوان',
    profilePhoto: 'الصورة الشخصية',
    attendanceRecords: 'سجلات الحضور',
    scanTime: 'وقت المسح',
    supervisor: 'المشرف',
    shiftInfo: 'معلومات الوردية',
    status: 'الحالة',
    present: 'حاضر',
    absent: 'غائب',
    late: 'متأخر',
    shiftStart: 'بداية الوردية',
    shiftEnd: 'نهاية الوردية',
    shiftDuration: 'مدة الوردية',
    totalRecords: 'إجمالي السجلات',
    uniqueStudents: 'الطلاب المميزون',
    completedShifts: 'الورديات المكتملة',
    todayRecords: 'سجلات اليوم',
    liveSupervisorMonitoring: 'مراقبة المشرفين المباشرة',
    active: 'نشط',
    live: 'مباشر',
    started: 'بدأ في',
    duration: 'المدة',
    scans: 'المسحات',
    recentActivity: 'النشاط الأخير',
    noScansYet: 'لا توجد مسحات بعد',
    noAttendanceRecords: 'لا توجد سجلات حضور للتاريخ والفلاتر المحددة',
    selectDate: 'اختر التاريخ',
    filterBySupervisor: 'تصفية حسب المشرف',
    allSupervisors: 'جميع المشرفين',
    refreshData: 'تحديث البيانات',
    autoRefresh: 'تحديث تلقائي كل 30 ثانية',
    page: 'صفحة',
    of: 'من',
    totalRecords: 'إجمالي السجلات',
    attendanceRecordsManagement: 'إدارة سجلات الحضور'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      }
    }
    setIsLoading(false);
  }, []);

  // Save language to localStorage when changed
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedLanguage', newLanguage);
        
        // Update document direction for RTL support
        document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLanguage;
      }
    }
  };

  // Get translation function
  const t = (key, fallback = key) => {
    return translations[language]?.[key] || fallback;
  };

  // Get current language direction
  const isRTL = language === 'ar';

  const value = {
    language,
    changeLanguage,
    t,
    isRTL,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
