#!/usr/bin/env node
/**
 * Check icon image: must be 200×200 px, PNG.
 * Usage: node scripts/check-icon.js <path-to-icon.png>
 * Example: node scripts/check-icon.js path/to/icon-200x200.png
 */

const fs = require('fs');
const path = require('path');

const requiredWidth = 200;
const requiredHeight = 200;

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 24) return null;
  // PNG signature
  const sig = buf.toString('hex', 0, 8);
  const pngSig = '89504e470d0a1a0a';
  if (sig !== pngSig) return null;
  // IHDR chunk: width at 16-19, height at 20-23 (big-endian)
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.log('Usage: node scripts/check-icon.js <path-to-icon.png>');
    console.log('Example: node scripts/check-icon.js path/to/icon-200x200.png');
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), file);
  if (!fs.existsSync(resolved)) {
    console.error('File not found:', resolved);
    process.exit(1);
  }

  const ext = path.extname(resolved).toLowerCase();
  if (ext !== '.png') {
    console.error('FAIL: File must be PNG. Got:', ext || '(no extension)');
    process.exit(1);
  }

  const dims = getPngDimensions(resolved);
  if (!dims) {
    console.error('FAIL: Could not read PNG dimensions (invalid or not PNG).');
    process.exit(1);
  }

  const { width, height } = dims;
  const sizeOk = width === requiredWidth && height === requiredHeight;

  console.log('Icon check:', path.basename(resolved));
  console.log('  Format: PNG');
  console.log('  Size:   ' + width + '×' + height + ' px');
  console.log('  Required: ' + requiredWidth + '×' + requiredHeight + ' px');
  if (sizeOk) {
    console.log('  Result: PASS – icon is 200×200 px.');
  } else {
    console.log('  Result: FAIL – resize to exactly 200×200 px.');
    process.exit(1);
  }
}

main();
