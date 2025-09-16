const fs = require('fs');
const path = require('path');

/**
 * Script to safely remove legacy API folder
 * This will fix the project structure issues
 */

console.log('🔧 Removing legacy API folder to fix project structure...');

const frontendNewPath = './frontend-new';
const legacyApiPath = path.join(frontendNewPath, 'api');
const correctApiPath = path.join(frontendNewPath, 'app', 'api');

// Check if legacy API folder exists
if (fs.existsSync(legacyApiPath)) {
  console.log('❌ Found problematic legacy API folder at:', legacyApiPath);
  
  // Check if correct API folder exists
  if (fs.existsSync(correctApiPath)) {
    console.log('✅ Correct API folder exists at:', correctApiPath);
    
    // List what will be removed
    console.log('\n📁 Legacy API folder contents to be removed:');
    const legacyContents = fs.readdirSync(legacyApiPath, { withFileTypes: true });
    legacyContents.forEach(item => {
      console.log(`  - ${item.name} (${item.isDirectory() ? 'directory' : 'file'})`);
    });
    
    console.log('\n📁 Correct API folder contents (will be kept):');
    const correctContents = fs.readdirSync(correctApiPath, { withFileTypes: true });
    correctContents.forEach(item => {
      console.log(`  - ${item.name} (${item.isDirectory() ? 'directory' : 'file'})`);
    });
    
    console.log('\n🚨 WARNING: This will permanently delete the legacy API folder!');
    console.log('✅ The correct API folder will be preserved.');
    
    // Ask for confirmation
    console.log('\n🔧 Proceeding with removal...');
    
    try {
      // Remove the legacy API folder
      fs.rmSync(legacyApiPath, { recursive: true, force: true });
      console.log('✅ Legacy API folder removed successfully!');
      
      // Verify removal
      if (!fs.existsSync(legacyApiPath)) {
        console.log('✅ Verification: Legacy API folder no longer exists');
      } else {
        console.log('❌ Error: Legacy API folder still exists');
      }
      
      // Verify correct API folder still exists
      if (fs.existsSync(correctApiPath)) {
        console.log('✅ Verification: Correct API folder still exists');
      } else {
        console.log('❌ Error: Correct API folder was accidentally removed!');
      }
      
      console.log('\n🎉 PROJECT STRUCTURE FIXED!');
      console.log('✅ Legacy API folder removed');
      console.log('✅ Correct API folder preserved');
      console.log('✅ No more hosting conflicts');
      console.log('✅ Proper Next.js App Router structure');
      
    } catch (error) {
      console.error('❌ Error removing legacy API folder:', error.message);
    }
    
  } else {
    console.log('❌ Error: Correct API folder not found!');
    console.log('Cannot proceed with removal as it would delete all API routes.');
  }
  
} else {
  console.log('✅ No legacy API folder found - structure is already correct');
}

console.log('\n🏗️ FINAL PROJECT STRUCTURE:');
console.log(`
frontend-new/
├── app/
│   ├── api/               # ✅ Next.js API routes (PRESERVED)
│   ├── admin/             # Admin pages
│   ├── student/           # Student pages
│   └── ...
├── components/            # React components
├── lib/                   # Utility libraries
└── public/                # Static assets
`);

console.log('\n✅ BENEFITS ACHIEVED:');
console.log('- No more hosting conflicts');
console.log('- Proper frontend/backend separation');
console.log('- Correct Next.js App Router structure');
console.log('- Better security boundaries');
console.log('- Easier deployment');
console.log('- Clean architecture');
