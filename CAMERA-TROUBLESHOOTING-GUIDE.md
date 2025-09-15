# 🔧 Camera Troubleshooting Guide

## 🚨 **Camera Not Working - Quick Fixes**

### **1. Check Browser Permissions**
- ✅ **Allow camera access** when prompted
- ✅ **Check browser settings** for camera permissions
- ✅ **Try refreshing the page** and allow permissions again
- ✅ **Use HTTPS** - Camera requires secure connection

### **2. Browser Compatibility**
- ✅ **Chrome/Edge** - Best support
- ✅ **Firefox** - Good support
- ✅ **Safari** - Limited support on mobile
- ❌ **HTTP sites** - Camera blocked on non-HTTPS

### **3. Device Issues**
- ✅ **Check camera is not in use** by another app
- ✅ **Restart browser** if camera is stuck
- ✅ **Check device camera** works in other apps
- ✅ **Try different camera** if multiple available

## 🔍 **Debug Steps**

### **Step 1: Test Camera Permissions**
1. Go to `/debug-camera` page
2. Click "Test Permissions" button
3. Check if permission is granted
4. Look for error messages

### **Step 2: Check Available Cameras**
1. Click "Refresh Cameras" button
2. Verify cameras are detected
3. Check camera labels and IDs
4. Try selecting different camera

### **Step 3: Test Camera Start**
1. Click "Start Camera" button
2. Watch debug logs for errors
3. Check if video element shows camera feed
4. Look for specific error messages

### **Step 4: Check Console Logs**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check for permission errors

## 🛠️ **Common Error Solutions**

### **Error: "Camera permission denied"**
**Solution:**
- Click the camera icon in browser address bar
- Select "Allow" for camera access
- Refresh the page
- Try in incognito/private mode

### **Error: "No cameras found"**
**Solution:**
- Check if device has camera
- Close other apps using camera
- Restart browser
- Check device camera settings

### **Error: "Camera failed to start"**
**Solution:**
- Try different camera if available
- Check camera is not blocked by antivirus
- Update browser to latest version
- Try different browser

### **Error: "Video element not found"**
**Solution:**
- Refresh the page
- Check if JavaScript is enabled
- Clear browser cache
- Try different device

## 📱 **Mobile-Specific Issues**

### **iOS Safari Issues:**
- ✅ **Use Chrome or Edge** instead of Safari
- ✅ **Enable camera in Settings > Safari > Camera**
- ✅ **Try in private browsing mode**
- ✅ **Update iOS to latest version**

### **Android Issues:**
- ✅ **Check app permissions** in device settings
- ✅ **Clear browser cache** and data
- ✅ **Try different browser** (Chrome recommended)
- ✅ **Restart device** if camera is stuck

## 🔧 **Technical Debugging**

### **Check Browser Console:**
```javascript
// Test camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => console.log('Camera works!'))
  .catch(err => console.error('Camera error:', err));
```

### **Check Available Cameras:**
```javascript
// List all cameras
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const cameras = devices.filter(device => device.kind === 'videoinput');
    console.log('Cameras:', cameras);
  });
```

### **Check HTTPS:**
- Camera requires HTTPS in production
- Localhost works with HTTP for development
- Check if site is using secure connection

## 🎯 **Quick Fixes for Common Issues**

### **Issue: Black Screen**
1. **Check permissions** - Allow camera access
2. **Try different camera** - Switch to back camera
3. **Refresh page** - Reload and try again
4. **Check browser** - Use Chrome or Edge

### **Issue: Camera Not Starting**
1. **Close other apps** - Free up camera
2. **Restart browser** - Clear camera locks
3. **Check device** - Test camera in other apps
4. **Try incognito** - Test in private mode

### **Issue: Permission Denied**
1. **Click camera icon** in address bar
2. **Select "Allow"** for camera access
3. **Check browser settings** for camera permissions
4. **Try different browser** if issue persists

### **Issue: No Cameras Found**
1. **Check device** has camera
2. **Update browser** to latest version
3. **Check camera drivers** are installed
4. **Try different device** if possible

## 🚀 **Advanced Solutions**

### **For Developers:**
1. **Check console logs** for detailed errors
2. **Test with debug page** at `/debug-camera`
3. **Verify HTTPS** in production
4. **Check browser compatibility**

### **For Users:**
1. **Try different browser** (Chrome recommended)
2. **Check device camera** works elsewhere
3. **Restart device** if camera is stuck
4. **Contact support** if issue persists

## 📞 **Still Having Issues?**

### **Try These Steps:**
1. **Use Chrome browser** - Best camera support
2. **Enable camera permissions** - Allow when prompted
3. **Try incognito mode** - Test in private browsing
4. **Check device camera** - Test in other apps
5. **Restart browser** - Clear any camera locks

### **Contact Information:**
- **Technical Support:** Check console logs for errors
- **Device Issues:** Test camera in other applications
- **Browser Issues:** Try different browser or update current one

## 🎉 **Success Indicators**

### **Camera Working:**
- ✅ **Video feed appears** in scanner
- ✅ **Green scan frame** is visible
- ✅ **No error messages** in console
- ✅ **Scanner status** shows "SCANNING"

### **Ready to Scan:**
- ✅ **Camera permissions** granted
- ✅ **Video feed** is clear and stable
- ✅ **Scan frame** is visible and stable
- ✅ **No error messages** displayed

The camera should now work properly! 🎯📷
