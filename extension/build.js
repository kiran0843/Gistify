import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy files to dist folder after Vite build
function copyFiles() {
  const filesToCopy = [
    'manifest.json',
    'src/content.js',
    'src/background.js'
  ];

  const iconsToCopy = [
    'icons/icon16.png',
    'icons/icon32.png',
    'icons/icon48.png',
    'icons/icon128.png'
  ];

  // Create dist folder if it doesn't exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Create icons folder in dist
  if (!fs.existsSync('dist/icons')) {
    fs.mkdirSync('dist/icons');
  }

  // Copy files
  filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(__dirname, 'dist', path.basename(file));
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file} to dist/`);
    } else {
      console.log(`⚠️  Warning: ${file} not found`);
    }
  });

  // Copy icons
  iconsToCopy.forEach(icon => {
    const sourcePath = path.join(__dirname, icon);
    const destPath = path.join(__dirname, 'dist', icon);
    
    if (fs.existsSync(sourcePath)) {
      // Ensure the destination directory exists
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${icon} to dist/`);
    } else {
      console.log(`⚠️  Warning: ${icon} not found - you'll need to create this icon file`);
    }
  });

  // Fix popup.html paths to be relative
  const popupHtmlPath = path.join(__dirname, 'dist', 'src', 'popup.html');
  if (fs.existsSync(popupHtmlPath)) {
    let popupHtml = fs.readFileSync(popupHtmlPath, 'utf8');
    popupHtml = popupHtml.replace('src="/popup.js"', 'src="../popup.js"');
    popupHtml = popupHtml.replace('href="/popup.css"', 'href="../popup.css"');
    fs.writeFileSync(popupHtmlPath, popupHtml);
    console.log('✅ Fixed popup.html paths to be relative');
  }

  console.log('🎉 Build completed! Extension files are ready in dist/ folder');
}

// Run the copy function
copyFiles();
