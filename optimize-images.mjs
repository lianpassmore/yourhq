import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const publicDir = './public';

// Get all image files
const getImageFiles = (dir) => {
  const files = readdirSync(dir);
  return files.filter(file => {
    const ext = file.toLowerCase();
    return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png');
  });
};

const optimizeImages = async () => {
  const imageFiles = getImageFiles(publicDir);

  console.log(`Found ${imageFiles.length} images to optimize\n`);

  for (const file of imageFiles) {
    const inputPath = join(publicDir, file);
    const stats = statSync(inputPath);
    const originalSize = (stats.size / 1024 / 1024).toFixed(2);

    // Create output filename (convert to webp)
    const outputFile = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = join(publicDir, outputFile);

    try {
      console.log(`Processing: ${file} (${originalSize}MB)`);

      // Optimize and convert to WebP
      await sharp(inputPath)
        .webp({
          quality: 85, // High quality but still compressed
          effort: 6    // Higher effort = better compression
        })
        .toFile(outputPath);

      const newStats = statSync(outputPath);
      const newSize = (newStats.size / 1024 / 1024).toFixed(2);
      const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);

      console.log(`  ✓ Created ${outputFile} (${newSize}MB) - Saved ${savings}%\n`);
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error.message, '\n');
    }
  }

  console.log('Image optimization complete!');
};

optimizeImages();
