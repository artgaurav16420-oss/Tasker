import sharp from 'sharp';
import { join } from 'path';

const publicDir = 'D:/Software Development/Tasker-main/public';

const sizes = [
  { name: 'logo-512.png', size: 512 },
  { name: 'logo-192.png', size: 192 },
  { name: 'logo-32.png', size: 32 },
  { name: 'favicon.png', size: 32 }
];

const svgPath = join(publicDir, 'logo.svg');

for (const { name, size } of sizes) {
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, name));
  console.log(`Created ${name} (${size}x${size})`);
}

console.log('Done!');