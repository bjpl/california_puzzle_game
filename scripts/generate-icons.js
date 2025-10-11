import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '../public');
const SVG_PATH = join(PUBLIC_DIR, 'california-icon.svg');

// Read the SVG file
const svgBuffer = readFileSync(SVG_PATH);

// Icon sizes to generate
const ICON_SIZES = [
  { size: 16, filename: 'california-icon-16.png' },
  { size: 32, filename: 'california-icon-32.png' },
  { size: 72, filename: 'california-icon-72.png' },
  { size: 96, filename: 'california-icon-96.png' },
  { size: 128, filename: 'california-icon-128.png' },
  { size: 144, filename: 'california-icon-144.png' },
  { size: 192, filename: 'california-icon-192.png' },
  { size: 384, filename: 'california-icon-384.png' },
  { size: 512, filename: 'california-icon-512.png' },
];

// iOS splash screen sizes (common devices)
const IOS_SPLASH_SIZES = [
  { width: 750, height: 1334, filename: 'apple-splash-750x1334.png' }, // iPhone SE, 8
  { width: 828, height: 1792, filename: 'apple-splash-828x1792.png' }, // iPhone 11, XR
  { width: 1125, height: 2436, filename: 'apple-splash-1125x2436.png' }, // iPhone X, XS, 11 Pro
  { width: 1242, height: 2688, filename: 'apple-splash-1242x2688.png' }, // iPhone XS Max, 11 Pro Max
  { width: 1170, height: 2532, filename: 'apple-splash-1170x2532.png' }, // iPhone 12/13/14 Pro
];

/**
 * Generate standard icon at specified size
 */
async function generateIcon(size, filename) {
  const outputPath = join(PUBLIC_DIR, filename);

  await sharp(svgBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
    })
    .png()
    .toFile(outputPath);

  console.log(`✓ Generated ${filename} (${size}×${size})`);
}

/**
 * Generate maskable icon with 20% safe zone padding
 */
async function generateMaskableIcon(size, filename) {
  const outputPath = join(PUBLIC_DIR, filename);
  const safeZonePercent = 0.20; // 20% padding on each side
  const iconSize = Math.round(size * (1 - 2 * safeZonePercent)); // 60% of total size
  const padding = Math.round((size - iconSize) / 2);

  await sharp(svgBuffer)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: '#ffffff' // White background for maskable icons
    })
    .png()
    .toFile(outputPath);

  console.log(`✓ Generated ${filename} (${size}×${size}) with ${safeZonePercent * 100}% safe zone`);
}

/**
 * Generate iOS splash screen with centered icon
 */
async function generateSplashScreen(width, height, filename) {
  const outputPath = join(PUBLIC_DIR, filename);
  const iconSize = Math.min(width, height) * 0.3; // Icon is 30% of smallest dimension

  await sharp(svgBuffer)
    .resize(Math.round(iconSize), Math.round(iconSize), {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .extend({
      top: Math.round((height - iconSize) / 2),
      bottom: Math.round((height - iconSize) / 2),
      left: Math.round((width - iconSize) / 2),
      right: Math.round((width - iconSize) / 2),
      background: '#1e40af' // Match theme color from manifest
    })
    .png()
    .toFile(outputPath);

  console.log(`✓ Generated ${filename} (${width}×${height})`);
}

/**
 * Main execution
 */
async function generateAllIcons() {
  console.log('🎨 Starting PWA icon generation...\n');

  try {
    // Generate standard icons
    console.log('📱 Generating standard icons:');
    for (const { size, filename } of ICON_SIZES) {
      await generateIcon(size, filename);
    }

    // Generate maskable icon
    console.log('\n🎭 Generating maskable icon:');
    await generateMaskableIcon(512, 'california-icon-maskable-512.png');

    // Generate iOS splash screens
    console.log('\n📱 Generating iOS splash screens:');
    for (const { width, height, filename } of IOS_SPLASH_SIZES) {
      await generateSplashScreen(width, height, filename);
    }

    console.log('\n✅ All icons generated successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - ${ICON_SIZES.length} standard icons`);
    console.log(`   - 1 maskable icon`);
    console.log(`   - ${IOS_SPLASH_SIZES.length} iOS splash screens`);
    console.log(`   - Total: ${ICON_SIZES.length + 1 + IOS_SPLASH_SIZES.length} files`);
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateAllIcons();
