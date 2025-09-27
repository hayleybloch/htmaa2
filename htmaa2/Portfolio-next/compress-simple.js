#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🗜️  Simple Asset Compression\n');

// Create compressed directory
const compressedDir = './compressed-assets';
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
    const outputFile = file.replace('apps/web/public/assets/', 'compressed-assets/');
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

// 2. Copy and compress the large Bust.bin file
console.log('\n📦 Processing large binary files...');
const bustBinFile = 'apps/web/public/assets/Bust.bin';
if (fs.existsSync(bustBinFile)) {
  const outputFile = 'compressed-assets/Bust.bin';
  fs.copyFileSync(bustBinFile, outputFile);
  console.log(`  Copied Bust.bin (${(fs.statSync(bustBinFile).size/1024/1024).toFixed(1)}MB)`);
}

// 3. Copy desktop assets
console.log('\n📦 Copying desktop assets...');
const desktopDirs = ['emulators', 'games', 'images'];
desktopDirs.forEach(dir => {
  const sourceDir = `apps/desktop/public/${dir}`;
  const targetDir = `compressed-assets/${dir}`;
  
  if (fs.existsSync(sourceDir)) {
    try {
      execSync(`cp -r "${sourceDir}" "${targetDir}"`, { stdio: 'pipe' });
      console.log(`  Copied ${dir}/`);
    } catch (error) {
      console.log(`  ❌ Failed to copy ${dir}: ${error.message}`);
    }
  }
});

// 4. Copy smaller assets
console.log('\n📦 Copying other assets...');
const otherAssets = [
  'apps/web/public/assets/Bust.gltf',
  'apps/web/public/assets/Cables.gltf'
];

otherAssets.forEach(file => {
  if (fs.existsSync(file)) {
    const outputFile = file.replace('apps/web/public/assets/', 'compressed-assets/');
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
  console.log('⚠️  Still over 25MB. Consider more aggressive compression.');
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
