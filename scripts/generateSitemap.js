import { readFile, access, writeFile } from 'fs/promises';

import path from 'path';

const JSON_PATH = path.join(process.cwd(), 'archive-data.json');

// Load and parse your archive-data.json
const data = JSON.parse(await readFile(JSON_PATH, 'utf8'));

const BASE = 'https://archiwapilchowic.org';
const outDir = path.resolve(process.cwd(), 'dist');

// 1) Gather all zasoby URLs
const urls = data.documents.map((d) =>
  `${BASE}/zasoby/${d.recordId}/${d.pageNumber}`
);

// 2) Add any other static pages if you like
urls.unshift(
  `${BASE}/`,
  `${BASE}/about`,
  // etc.
);

// 3) Build the XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${data.lastUpdated.split('T')[0]}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`;

// 4) Write to dist/sitemap.xml
if (await !access(outDir)) {
  console.error('Error: dist folder not found. Run `npm run build` first.');
  process.exit(1);
}
await writeFile(path.join(outDir, 'sitemap.xml'), xml);
console.log('✅ sitemap.xml generated with', urls.length, 'entries');
