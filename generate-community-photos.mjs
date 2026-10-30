// Scans "Event Photos/<Event Name>/*" and syncs it into brand_assets/Photos/events/,
// writing a manifest the "In Our Community" section reads at runtime.
// Re-run this after adding/removing event folders or photos.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.join(__dirname, 'Event Photos');
const DEST_DIR = path.join(__dirname, 'brand_assets', 'Photos', 'events');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

fs.mkdirSync(DEST_DIR, { recursive: true });

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const events = [];

for (const entry of fs.readdirSync(SOURCE_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const eventName = entry.name;
  const slug = slugify(eventName);
  const srcDir = path.join(SOURCE_DIR, eventName);
  const destDir = path.join(DEST_DIR, slug);
  fs.mkdirSync(destDir, { recursive: true });

  const photos = [];
  for (const file of fs.readdirSync(srcDir)) {
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;
    const safeName = slugify(path.basename(file, ext)) + ext;
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, safeName));
    photos.push(`brand_assets/Photos/events/${slug}/${safeName}`);
  }

  if (photos.length) events.push({ event: eventName, photos });
}

fs.writeFileSync(
  path.join(DEST_DIR, 'manifest.json'),
  JSON.stringify({ events }, null, 2)
);

console.log(`Synced ${events.length} event folder(s), ${events.reduce((n, e) => n + e.photos.length, 0)} photo(s).`);
