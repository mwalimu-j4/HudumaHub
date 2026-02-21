/**
 * PWA Icon Generator Script
 *
 * This script generates PNG icons from the SVG favicon for PWA usage.
 *
 * To generate proper PNG icons:
 * 1. Install sharp: pnpm add -D sharp
 * 2. Run: node scripts/generate-icons.mjs
 *
 * Or manually convert the favicon.svg to PNG at these sizes:
 * - 192x192 (pwa-192x192.png)
 * - 512x512 (pwa-512x512.png)
 * - 192x192 maskable (pwa-maskable-192x192.png) — with safe zone padding
 * - 512x512 maskable (pwa-maskable-512x512.png) — with safe zone padding
 * - 180x180 (apple-touch-icon.png)
 * - 32x32 (favicon-32x32.png)
 *
 * Tools: https://realfavicongenerator.net or https://maskable.app/editor
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

async function generateIcons() {
  try {
    const sharp = (await import("sharp")).default;
    const svgBuffer = readFileSync(join(publicDir, "favicon.svg"));

    const sizes = [
      { name: "pwa-192x192.png", size: 192 },
      { name: "pwa-512x512.png", size: 512 },
      { name: "apple-touch-icon.png", size: 180 },
      { name: "favicon-32x32.png", size: 32 },
    ];

    for (const { name, size } of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(publicDir, name));
      console.log(`✓ Generated ${name}`);
    }

    // Maskable icons — add padding (safe zone is 80% of icon)
    const maskableSizes = [
      { name: "pwa-maskable-192x192.png", size: 192, padding: 19 },
      { name: "pwa-maskable-512x512.png", size: 512, padding: 51 },
    ];

    for (const { name, size, padding } of maskableSizes) {
      const innerSize = size - padding * 2;
      const inner = await sharp(svgBuffer)
        .resize(innerSize, innerSize)
        .png()
        .toBuffer();

      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 26, g: 107, b: 60, alpha: 1 }, // #1a6b3c
        },
      })
        .composite([{ input: inner, top: padding, left: padding }])
        .png()
        .toFile(join(publicDir, name));

      console.log(`✓ Generated ${name}`);
    }

    console.log("\n✅ All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons. Make sure sharp is installed:");
    console.error("  pnpm add -D sharp");
    console.error(error);
  }
}

generateIcons();
