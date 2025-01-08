import fs from 'fs/promises';
import path from 'path';
import { KEYWORDS, OUTPUT_DIR } from '../config.js';

export const containsKeywords = (text) => {
  if (!text) return false;
  return KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const createOutputDirectory = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}: ${error.message}`);
  }
};

export const saveContent = async (content, metadata) => {
  if (!content || !metadata) return;

  const { newspaper, newspaperId, recordId, filename } = metadata;
  const dirPath = path.join(OUTPUT_DIR, newspaperId);
  const filePath = path.join(dirPath, filename);
  await createOutputDirectory(dirPath);

  const mdContent = `---
newspaper: ${newspaper}
recordId: ${recordId}
filename: ${filename}
---

${content}
`;

  await fs.writeFile(filePath, mdContent, 'utf8');
  console.log(`Saved content to ${filePath}`);
};