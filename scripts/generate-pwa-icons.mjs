/**
 * Generate simple solid-color PNG icons for the PWA (no external deps).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { deflateSync } from "zlib";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(size, rgb) {
  const [r, g, b] = rgb;
  const row = Buffer.alloc(1 + size * 3);
  const raw = Buffer.alloc((1 + size * 3) * size);
  for (let y = 0; y < size; y++) {
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 3;
      // Brand sky circle on dark slate
      const cx = size / 2;
      const cy = size / 2;
      const rad = size * 0.32;
      const dx = x - cx;
      const dy = y - cy;
      const inCircle = dx * dx + dy * dy <= rad * rad;
      if (inCircle) {
        row[i] = 14;
        row[i + 1] = 165;
        row[i + 2] = 233; // brand-500
      } else {
        row[i] = r;
        row[i + 1] = g;
        row[i + 2] = b;
      }
    }
    row.copy(raw, y * row.length);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const bg = [2, 6, 23]; // slate-950
for (const size of [192, 512]) {
  const file = join(outDir, `icon-${size}.png`);
  writeFileSync(file, png(size, bg));
  console.log("wrote", file);
}
