// Slice a tall screenshot into viewable chunks. node scripts/dev/slice.mjs <png> [chunkHeight] [scale]
import sharp from 'sharp';
const [file, ch = 1600, scale = 1] = process.argv.slice(2);
const m = await sharp(file).metadata();
for (let y = 0, i = 0; y < m.height; y += +ch, i++) {
  const h = Math.min(+ch, m.height - y);
  const out = file.replace(/\.png$/, `.part${i}.jpg`);
  await sharp(file).extract({ left: 0, top: y, width: m.width, height: h }).resize(Math.round(m.width * scale)).jpeg({ quality: 70 }).toFile(out);
  console.log(out);
}
