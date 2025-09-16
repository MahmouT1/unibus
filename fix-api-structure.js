const fs = require('fs');
const path = require('path');

/**
 * Script to fix API structure issues
 * Moves legacy API routes to proper locations
 */

console.log('🔧 Fixing API structure issues...');

const frontendNewPath = './frontend-new';
const legacyApiPath = path.join(frontendNewPath, 'api');
const correctApiPath = path.join(frontendNewPath, 'app', 'api');

// Check if legacy API folder exists
if (fs.existsSync(legacyApiPath)) {
  console.log('❌ Found problematic legacy API folder at:', legacyApiPath);
  console.log('✅ Correct API folder exists at:', correctApiPath);
  
  // List contents of legacy API folder
  console.log('\n📁 Legacy API folder contents:');
  const legacyContents = fs.readdirSync(legacyApiPath, { withFileTypes: true });
  legacyContents.forEach(item => {
    console.log(`  - ${item.name} (${item.isDirectory() ? 'directory' : 'file'})`);
  });
  
  console.log('\n📁 Correct API folder contents:');
  const correctContents = fs.readdirSync(correctApiPath, { withFileTypes: true });
  correctContents.forEach(item => {
    console.log(`  - ${item.name} (${item.isDirectory() ? 'directory' : 'file'})`);
  });
  
  console.log('\n🚨 ISSUES IDENTIFIED:');
  console.log('1. Legacy API folder conflicts with Next.js App Router');
  console.log('2. Duplicate API routes in different locations');
  console.log('3. Hosting conflicts with frontend deployment');
  console.log('4. Security concerns with API in frontend directory');
  
  console.log('\n💡 RECOMMENDED ACTIONS:');
  console.log('1. Remove legacy API folder from frontend');
  console.log('2. Keep only app/api/ for Next.js App Router');
  console.log('3. Move backend API routes to separate backend folder');
  console.log('4. Update import paths in frontend code');
  
} else {
  console.log('✅ No legacy API folder found - structure is correct');
}

console.log('\n🏗️ RECOMMENDED PROJECT STRUCTURE:');
console.log(`
frontend-new/
├── app/                    # Next.js App Router
│   ├── api/               # ✅ CORRECT: Next.js API routes
│   ├── admin/             # Admin pages
│   ├── student/           # Student pages
│   └── ...
├── components/            # React components
├── lib/                   # Utility libraries
├── public/                # Static assets
└── ...

backend/                   # ✅ RECOMMENDED: Separate backend
├── api/                   # Backend API routes
├── models/                # Database models
├── middleware/            # Backend middleware
├── routes/                # Express routes
└── ...
`);

console.log('\n🔧 FIXING STEPS:');
console.log('1. Create separate backend folder');
console.log('2. Move legacy API routes to backend');
console.log('3. Remove legacy API folder from frontend');
console.log('4. Update frontend to use backend API endpoints');
console.log('5. Configure CORS for backend API');

console.log('\n✅ This will resolve:');
console.log('- Hosting conflicts');
console.log('- Architecture issues');
console.log('- Security concerns');
console.log('- Deployment problems');
