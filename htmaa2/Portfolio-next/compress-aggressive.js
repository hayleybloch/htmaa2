#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🗜️  Aggressive Asset Compression\n');

// Create compressed directory
const compressedDir = './compressed-assets-aggressive';
if (!fs.existsSync(compressedDir)) {
  fs.mkdirSync(compressedDir, { recursive: true });
}

// 1. Compress GLB files with Draco
console.log('📦 Compressing 3D models with Draco...');
const glbFiles = [
  'apps/web/public/assets/Bust.glb',
  'apps/web/public/assets/Desk.glb', 
  'apps/web/public/assets/Hydra.glb',
  'apps/web/public/assets/Keyboard.glb',
  'apps/web/public/assets/Monitor.glb',
  'apps/web/public/assets/Mouse.glb',
  'apps/web/public/assets/Plant.glb',
  'apps/web/public/assets/SmoothFloor.glb'
];

glbFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const outputFile = file.replace('apps/web/public/assets/', 'compressed-assets-aggressive/');
    const outputDir = path.dirname(outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    try {
      console.log(`  Compressing ${path.basename(file)}...`);
      execSync(`npx gltf-transform draco "${file}" "${outputFile}"`, { stdio: 'pipe' });
      
      const originalSize = fs.statSync(file).size;
      const compressedSize = fs.statSync(outputFile).size;
      const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
      
      console.log(`    ✅ ${reduction}% reduction (${(originalSize/1024/1024).toFixed(1)}MB → ${(compressedSize/1024/1024).toFixed(1)}MB)`);
    } catch (error) {
      console.log(`    ❌ Failed: ${error.message}`);
    }
  }
});

// 2. Copy the large Bust.bin file (we'll need to keep this)
console.log('\n📦 Processing large binary files...');
const bustBinFile = 'apps/web/public/assets/Bust.bin';
if (fs.existsSync(bustBinFile)) {
  const outputFile = 'compressed-assets-aggressive/Bust.bin';
  fs.copyFileSync(bustBinFile, outputFile);
  console.log(`  Copied Bust.bin (${(fs.statSync(bustBinFile).size/1024/1024).toFixed(1)}MB)`);
}

// 3. Copy only essential desktop assets (skip large images)
console.log('\n📦 Copying essential desktop assets...');
const essentialDesktopDirs = ['emulators', 'games'];
essentialDesktopDirs.forEach(dir => {
  const sourceDir = `apps/desktop/public/${dir}`;
  const targetDir = `compressed-assets-aggressive/${dir}`;
  
  if (fs.existsSync(sourceDir)) {
    try {
      execSync(`cp -r "${sourceDir}" "${targetDir}"`, { stdio: 'pipe' });
      console.log(`  Copied ${dir}/`);
    } catch (error) {
      console.log(`  ❌ Failed to copy ${dir}: ${error.message}`);
    }
  }
});

// 4. Copy only small images (skip large ones)
console.log('\n📦 Copying small images only...');
const imagesDir = 'apps/desktop/public/images';
const targetImagesDir = 'compressed-assets-aggressive/images';
if (fs.existsSync(imagesDir)) {
  fs.mkdirSync(targetImagesDir, { recursive: true });
  
  // Copy only small images (under 1MB)
  function copySmallImages(sourceDir, targetDir) {
    const files = fs.readdirSync(sourceDir);
    files.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      try {
        const stats = fs.statSync(sourcePath);
        if (stats.isDirectory()) {
          const subTargetDir = path.join(targetDir, file);
          fs.mkdirSync(subTargetDir, { recursive: true });
          copySmallImages(sourcePath, subTargetDir);
        } else if (stats.size < 1024 * 1024) { // Less than 1MB
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`  Copied small image: ${file} (${(stats.size/1024).toFixed(1)}KB)`);
        } else {
          console.log(`  Skipped large file: ${file} (${(stats.size/1024/1024).toFixed(1)}MB)`);
        }
      } catch (error) {
        // Skip files that can't be accessed
      }
    });
  }
  
  copySmallImages(imagesDir, targetImagesDir);
}

// 5. Copy other small assets
console.log('\n📦 Copying other small assets...');
const otherAssets = [
  'apps/web/public/assets/Bust.gltf',
  'apps/web/public/assets/Cables.gltf'
];

otherAssets.forEach(file => {
  if (fs.existsSync(file)) {
    const outputFile = file.replace('apps/web/public/assets/', 'compressed-assets-aggressive/');
    const outputDir = path.dirname(outputFile);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.copyFileSync(file, outputFile);
    console.log(`  Copied ${path.basename(file)}`);
  }
});

// Calculate total size
console.log('\n📊 Results:');
const compressedSize = getDirectorySize(compressedDir);
const originalSize = getDirectorySize('apps');

console.log(`Compressed size: ${(compressedSize / 1024 / 1024).toFixed(1)}MB`);
console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(1)}MB`);

if (compressedSize < 25 * 1024 * 1024) {
  console.log('🎉 SUCCESS! Compressed assets are under 25MB!');
  console.log('You can now use these compressed assets in your repository.');
} else {
  console.log('⚠️  Still over 25MB. The Bust.bin file (20MB) is the main issue.');
  console.log('Consider using external hosting for the Bust.bin file.');
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  function calculateSize(itemPath) {
    try {
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(itemPath);
        files.forEach(file => {
          calculateSize(path.join(itemPath, file));
        });
      } else {
        totalSize += stats.size;
      }
    } catch (error) {
      // Skip files that can't be accessed
    }
  }
  
  calculateSize(dirPath);
  return totalSize;
}
