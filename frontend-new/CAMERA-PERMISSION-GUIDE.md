# 📷 Camera Permission Guide for QR Scanner

## 🎯 STEP-BY-STEP SOLUTION

### **STEP 1: Access the New QR Scanner**
1. Go to: `http://localhost:3000/auth`
2. Login as supervisor: `supervisor@unibus.edu` / `supervisor123`
3. Navigate to "📱 QR Scanner" tab
4. You'll see the **NEW Real Camera QR Scanner**

### **STEP 2: Grant Camera Permission**
1. **Click: "🔓 Grant Camera Permission"** button
2. **Browser will prompt** for camera access
3. **Click "Allow"** in the browser popup
4. **Wait for confirmation** message

### **STEP 3: Start Camera**
1. **Click: "📹 Start Camera"** button
2. **Camera will open** and show live video
3. **Green scanning frame** will appear
4. **Point camera at QR code** to scan

## 🌐 Browser-Specific Instructions

### **Google Chrome:**
1. **Look for camera icon** (📷) in address bar
2. **Click the icon** → Select "Allow"
3. **OR** Click lock icon (🔒) → Camera → Allow
4. **Refresh page** after allowing

### **Firefox:**
1. **Look for camera icon** in address bar
2. **Click "Allow"** when prompted
3. **OR** Click shield icon → Permissions → Camera → Allow

### **Microsoft Edge:**
1. **Click lock icon** in address bar
2. **Set Camera to "Allow"**
3. **Refresh the page**

## 🛠️ Troubleshooting

### **If Camera Still Doesn't Work:**

#### **Option 1: Check Windows Camera Settings**
1. **Windows Settings** → Privacy & Security → Camera
2. **Enable "Let apps access your camera"**
3. **Enable "Let desktop apps access your camera"**
4. **Restart browser**

#### **Option 2: Try Different Browser**
- **Chrome** (recommended for best compatibility)
- **Firefox**
- **Edge**

#### **Option 3: Check Other Apps**
- **Close Zoom, Teams, Skype** (camera conflicts)
- **Close other browser tabs** using camera
- **Restart browser completely**

## ✅ Expected Results

### **When Working Correctly:**
1. **Permission Button** → Shows "✅ Camera permission granted!"
2. **Start Camera** → Live video appears immediately
3. **QR Detection** → Green scanning frame with moving line
4. **Scan Success** → Automatic student data processing
5. **Attendance** → Automatically registered in system

### **Camera Features:**
- **Real-time video** feed
- **Automatic QR detection** using jsQR library
- **JSON parsing** for student data QR codes
- **Simple text QR** support for basic codes
- **Immediate processing** when QR detected

## 🎯 TESTING

### **Test QR Codes:**
You can test with any QR code containing:
- **Student JSON data**
- **Simple student ID** (like "STU-12345")
- **Any text** (will create mock student data)

### **Expected Behavior:**
- **Fast detection** (within 1-2 seconds)
- **Automatic stop** after successful scan
- **Student data display** in attendance tab
- **Attendance registration** in database

## 🚀 READY TO USE!

**The new camera-based QR scanner is now ready and will work with real camera access!**
