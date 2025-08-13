const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Gistify Chrome Extension...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm version: ${npmVersion.trim()}`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm first.');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install extension dependencies
console.log('\n📦 Installing extension dependencies...');
try {
  execSync('cd extension && npm install', { stdio: 'inherit' });
  console.log('✅ Extension dependencies installed');
} catch (error) {
  console.error('❌ Failed to install extension dependencies');
  process.exit(1);
}

// Generate placeholder icons
console.log('\n🎨 Generating placeholder icons...');
try {
  execSync('cd extension && node generate-icons.js', { stdio: 'inherit' });
  console.log('✅ Placeholder icons generated');
} catch (error) {
  console.error('❌ Failed to generate icons');
}

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env file...');
  try {
    fs.copyFileSync(path.join(__dirname, 'env.example'), envPath);
    console.log('✅ .env file created from env.example');
    console.log('⚠️  Please edit .env and add your Gemini API key');
  } catch (error) {
    console.error('❌ Failed to create .env file');
  }
} else {
  console.log('✅ .env file already exists');
}

// Build the extension
console.log('\n🔨 Building the extension...');
try {
  execSync('cd extension && npm run build', { stdio: 'inherit' });
  console.log('✅ Extension built successfully');
} catch (error) {
  console.error('❌ Failed to build extension');
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file and add your Gemini API key');
console.log('2. Start the backend server: npm run dev:server');
console.log('3. Load the extension in Chrome:');
console.log('   - Go to chrome://extensions/');
console.log('   - Enable Developer mode');
console.log('   - Click "Load unpacked"');
console.log('   - Select the extension/dist folder');
console.log('\n4. Replace placeholder icons with actual PNG icons');
console.log('\n📖 For more information, see README.md');
