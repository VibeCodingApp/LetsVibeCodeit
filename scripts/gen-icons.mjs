import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function encodeIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  const sizes = [];
  let offset = 6 + pngs.length * 16;
  for (const { size, png } of pngs) {
    const e = Buffer.alloc(16);
    e[0] = size === 256 ? 0 : size;
    e[1] = size === 256 ? 0 : size;
    e[2] = 0;
    e[3] = 0;
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    entries.push(e);
    sizes.push(size);
  }
  return Buffer.concat([header, ...entries, ...pngs.map(p => p.png)]);
}

const BG = [11, 13, 11];
const BORDER = [25, 89, 43];
const GREEN = [51, 230, 103];

function makeIcon(size) {
  const px = Buffer.alloc(size * size * 4);
  const border = Math.max(2, Math.round(size * 0.02));
  const inset = Math.max(3, Math.round(size * 0.035));
  const cy = Math.round(size * 0.5);
  const barH = Math.max(3, Math.round(size * 0.095));
  const gap = Math.max(2, Math.round(size * 0.055));
  const xR = Math.round(size * 0.6);
  const widths = [
    Math.round(size * 0.33),
    Math.round(size * 0.2),
    Math.round(size * 0.085),
  ];
  const barY = [
    [cy - gap - barH, cy - gap],
    [cy - Math.floor(barH / 2), cy + Math.ceil(barH / 2)],
    [cy + gap, cy + gap + barH],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const inBorder = (x >= inset && x < size - inset) && (y >= inset && y < size - inset);
      const borderZone = !inBorder;
      let color = borderZone && (x < inset + border || x >= size - inset - border || y < inset + border || y >= size - inset - border)
        ? BORDER
        : BG;
      outer: for (let b = 0; b < 3; b++) {
        if (y >= barY[b][0] && y < barY[b][1] && x >= xR - widths[b] && x < xR) {
          color = GREEN;
          break outer;
        }
      }
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      px[i + 3] = 255;
    }
  }
  return px;
}

const png16 = makeIcon(16);
const png32 = makeIcon(32);
const png180 = makeIcon(180);
const png192 = makeIcon(192);
const png256 = makeIcon(256);
const png512 = makeIcon(512);

const files = [
  ['public/favicon-16x16.png', png16],
  ['public/favicon-32x32.png', png32],
  ['public/apple-icon.png', png180],
  ['public/icon-192.png', png192],
  ['public/icon-256.png', png256],
  ['public/icon-512.png', png512],
];

for (const [file, rgba] of files) {
  const size = Math.round(Math.sqrt(rgba.length / 4));
  writeFileSync(join(process.cwd(), file), encodePng(size, rgba));
  console.log('wrote', file, size + 'x' + size);
}

const icoPngs = [
  { size: 16, png: encodePng(16, png16) },
  { size: 32, png: encodePng(32, png32) },
];
writeFileSync(join(process.cwd(), 'public/favicon.ico'), encodeIco(icoPngs));
console.log('wrote public/favicon.ico (16+32)');
