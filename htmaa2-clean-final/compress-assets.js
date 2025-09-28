#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = './apps/web/public/assets';

// Check if sharp-cli is available
function checkSharp() {
  try {
    execSync('which sharp', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Check if gltf-transform is available
function checkGltfTransform() {
  try {
    execSync('which gltf-transform', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Compress images to WebP
async function compressImages() {
  console.log('🖼️  Compressing images...');
  
  if (!checkSharp()) {
    console.log('⚠️  sharp-cli not found. Installing...');
    try {
      execSync('npm install -g sharp-cli', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Failed to install sharp-cli. Skipping image compression.');
      return;
    }
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png'];
  const files = fs.readdirSync(assetsDir);
  
  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    const ext = path.extname(file).toLowerCase();
    
    if (imageExtensions.includes(ext) && fs.statSync(filePath).isFile()) {
      const nameWithoutExt = path.basename(file, ext);
      const webpPath = path.join(assetsDir, `${nameWithoutExt}.webp`);
      
      try {
        console.log(`  Converting ${file} to WebP...`);
        execSync(`sharp -i "${filePath}" -o "${webpPath}" --quality 85`, { 
          stdio: 'pipe',
          cwd: assetsDir 
        });
        
        const originalSize = fs.statSync(filePath).size;
        const webpSize = fs.statSync(webpPath).size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
        
        console.log(`    ✅ ${file}: ${(originalSize/1024/1024).toFixed(2)}MB → ${(webpSize/1024/1024).toFixed(2)}MB (${savings}% smaller)`);
        
        // Remove original file
        fs.unlinkSync(filePath);
        console.log(`    🗑️  Removed original ${file}`);
        
      } catch (error) {
        console.log(`    ❌ Failed to convert ${file}: ${error.message}`);
      }
    }
  }
}

// Compress GLB files with Draco
async function compressGlbFiles() {
  console.log('🎯 Compressing 3D models...');
  
  if (!checkGltfTransform()) {
    console.log('⚠️  gltf-transform not found. Installing...');
    try {
      execSync('npm install -g @gltf-transform/cli', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Failed to install gltf-transform. Skipping 3D model compression.');
      return;
    }
  }

  const files = fs.readdirSync(assetsDir);
  
  for (const file of files) {
    if (file.endsWith('.glb') && fs.statSync(path.join(assetsDir, file)).isFile()) {
      const filePath = path.join(assetsDir, file);
      const tempPath = path.join(assetsDir, `temp_${file}`);
      
      try {
        console.log(`  Compressing ${file}...`);
        
        const originalSize = fs.statSync(filePath).size;
        
        // Compress with Draco
        execSync(`gltf-transform draco "${filePath}" "${tempPath}"`, { 
          stdio: 'pipe',
          cwd: assetsDir 
        });
        
        const compressedSize = fs.statSync(tempPath).size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log(`    ✅ ${file}: ${(originalSize/1024/1024).toFixed(2)}MB → ${(compressedSize/1024/1024).toFixed(2)}MB (${savings}% smaller)`);
        
        // Replace original with compressed version
        fs.renameSync(tempPath, filePath);
        
      } catch (error) {
        console.log(`    ❌ Failed to compress ${file}: ${error.message}`);
        // Clean up temp file if it exists
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }
  }
}

// Update code to use WebP files
async function updateCodeReferences() {
  console.log('📝 Updating code references...');
  
  const webpFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.webp'));
  
  for (const webpFile of webpFiles) {
    const originalName = webpFile.replace('.webp', '');
    
    // Find files that might reference the original image
    const searchDirs = [
      './apps/web/components',
      './apps/web/scene-loader',
      './apps/web/renderer'
    ];
    
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        try {
          execSync(`find "${dir}" -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec sed -i '' "s/${originalName}\\.jpg/${originalName}.webp/g" {} \\;`, { stdio: 'pipe' });
          execSync(`find "${dir}" -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec sed -i '' "s/${originalName}\\.png/${originalName}.webp/g" {} \\;`, { stdio: 'pipe' });
        } catch (error) {
          // Ignore errors (files might not exist or no matches)
        }
      }
    }
  }
  
  console.log('  ✅ Updated code references to use WebP files');
}

// Main compression function
async function main() {
  console.log('🚀 Starting asset compression...');
  console.log(`📁 Working directory: ${assetsDir}`);
  
  const startSize = fs.readdirSync(assetsDir)
    .reduce((total, file) => {
      const filePath = path.join(assetsDir, file);
      return total + fs.statSync(filePath).size;
    }, 0);
  
  console.log(`📊 Original size: ${(startSize/1024/1024).toFixed(2)}MB`);
  
  try {
    await compressImages();
    await compressGlbFiles();
    await updateCodeReferences();
    
    const endSize = fs.readdirSync(assetsDir)
      .reduce((total, file) => {
        const filePath = path.join(assetsDir, file);
        return total + fs.statSync(filePath).size;
      }, 0);
    
    const totalSavings = ((startSize - endSize) / startSize * 100).toFixed(1);
    
    console.log('\n🎉 Compression complete!');
    console.log(`📊 Final size: ${(endSize/1024/1024).toFixed(2)}MB`);
    console.log(`💾 Total savings: ${((startSize - endSize)/1024/1024).toFixed(2)}MB (${totalSavings}%)`);
    
  } catch (error) {
    console.error('❌ Compression failed:', error.message);
    process.exit(1);
  }
}

main();