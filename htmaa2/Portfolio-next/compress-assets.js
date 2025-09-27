#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ASSETS_DIR = './apps/web/public/assets';
const DESKTOP_ASSETS_DIR = './apps/desktop/public';
const OUTPUT_DIR = './compressed-assets';

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🗜️  Starting asset compression...\n');

// Function to compress GLB files with Draco
function compressGLB(inputPath, outputPath) {
  try {
    console.log(`Compressing GLB: ${path.basename(inputPath)}`);
    execSync(`npx gltf-transform draco "${inputPath}" "${outputPath}"`, { stdio: 'inherit' });
    
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`  ✅ Reduced by ${reduction}% (${(originalSize/1024/1024).toFixed(1)}MB → ${(compressedSize/1024/1024).toFixed(1)}MB)\n`);
    return true;
  } catch (error) {
    console.log(`  ❌ Failed to compress: ${error.message}\n`);
    return false;
  }
}

// Function to compress images (convert to WebP)
function compressImage(inputPath, outputPath) {
  try {
    console.log(`Compressing image: ${path.basename(inputPath)}`);
    
    // Use sharp if available, otherwise copy
    try {
      execSync(`npx sharp-cli resize 1920 1920 --format webp --quality 85 "${inputPath}" "${outputPath}"`, { stdio: 'inherit' });
    } catch {
      // Fallback: just copy the file
      fs.copyFileSync(inputPath, outputPath);
    }
    
    const originalSize = fs.statSync(inputPath).size;
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    console.log(`  ✅ Reduced by ${reduction}% (${(originalSize/1024/1024).toFixed(1)}MB → ${(compressedSize/1024/1024).toFixed(1)}MB)\n`);
    return true;
  } catch (error) {
    console.log(`  ❌ Failed to compress: ${error.message}\n`);
    return false;
  }
}

// Process web assets
console.log('📁 Processing web assets...');
const webAssetsDir = path.join(OUTPUT_DIR, 'web-assets');
if (!fs.existsSync(webAssetsDir)) {
  fs.mkdirSync(webAssetsDir, { recursive: true });
}

// Compress GLB files
const glbFiles = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith('.glb'));
glbFiles.forEach(file => {
  const inputPath = path.join(ASSETS_DIR, file);
  const outputPath = path.join(webAssetsDir, file);
  compressGLB(inputPath, outputPath);
});

// Compress images
const imageFiles = fs.readdirSync(ASSETS_DIR).filter(file => 
  file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.JPG')
);
imageFiles.forEach(file => {
  const inputPath = path.join(ASSETS_DIR, file);
  const outputPath = path.join(webAssetsDir, file.replace(/\.(jpg|png|JPG)$/, '.webp'));
  compressImage(inputPath, outputPath);
});

// Copy other files
const otherFiles = fs.readdirSync(ASSETS_DIR).filter(file => 
  !file.endsWith('.glb') && !file.endsWith('.jpg') && !file.endsWith('.png') && !file.endsWith('.JPG')
);
otherFiles.forEach(file => {
  const inputPath = path.join(ASSETS_DIR, file);
  const outputPath = path.join(webAssetsDir, file);
  fs.copyFileSync(inputPath, outputPath);
  console.log(`Copied: ${file}`);
});

// Process desktop assets
console.log('\n📁 Processing desktop assets...');
const desktopAssetsDir = path.join(OUTPUT_DIR, 'desktop-assets');
if (!fs.existsSync(desktopAssetsDir)) {
  fs.mkdirSync(desktopAssetsDir, { recursive: true });
}

// Copy desktop assets (emulators, games, etc.)
const desktopDirs = ['emulators', 'games', 'images', 'emulators-ui'];
desktopDirs.forEach(dir => {
  const sourceDir = path.join(DESKTOP_ASSETS_DIR, dir);
  const targetDir = path.join(desktopAssetsDir, dir);
  
  if (fs.existsSync(sourceDir)) {
    execSync(`cp -r "${sourceDir}" "${targetDir}"`, { stdio: 'inherit' });
    console.log(`Copied desktop directory: ${dir}`);
  }
});

// Calculate total sizes
console.log('\n📊 Compression Results:');
const originalSize = getDirectorySize('./apps');
const compressedSize = getDirectorySize(OUTPUT_DIR);
const totalReduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(1)}MB`);
console.log(`Compressed size: ${(compressedSize / 1024 / 1024).toFixed(1)}MB`);
console.log(`Total reduction: ${totalReduction}%`);

if (compressedSize < 25 * 1024 * 1024) {
  console.log('🎉 SUCCESS! Compressed assets are under 25MB and can fit in GitHub!');
} else {
  console.log('⚠️  Still over 25MB. Consider more aggressive compression or external hosting.');
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(itemPath) {
    const stats = fs.statSync(itemPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      files.forEach(file => {
        calculateSize(path.join(itemPath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}
