import fs from 'fs/promises';
import path from 'path';
import { KEYWORDS, OUTPUT_DIR } from '../config.js';


export const containsKeywords = (text, metadata) => {
  const sanitizedText = sanitizeText(text);
  if (!sanitizedText) return false;

  const foundKeywords = KEYWORDS.filter(keyword => 
    sanitizedText.toLowerCase().includes(keyword.toLowerCase())
  );

  if (foundKeywords.length > 0) {
    const keywords = foundKeywords.join(', ');

    //console.log(`Found keywords: ${keywords}`, sanitizedText.toLowerCase());
    return {status: true, keywords: keywords};
  }

  return {status: false};
};

const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/-\n/g, '') // Join words broken by line breaks with a hyphen
    .replace(/(\w+)\n(\w+)/g, '$1$2') // Join words split by a newline without a hyphen
    .replace(/—\s*/g, '') // Remove specific unwanted characters like '—' and join words seamlessly
    .replace(/⸗\s*/g, '') // Remove '⸗' and join words seamlessly
    .replace(/\n/g, ' ') // Replace remaining line breaks with a space
    .replace(/\s+/g, ' ') // Collapse multiple spaces into one
    .trim(); // Trim leading and trailing spaces
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

  try {
    const { newspaper, newspaperId, recordId, filename, keywords } = metadata;

    const subfolder = newspaperId || 'unknown';
    const dirPath = path.join(OUTPUT_DIR, subfolder);
    const filePath = path.join(dirPath, filename);
    await createOutputDirectory(dirPath);
  
    const mdContent = `---
newspaper: ${newspaper}
recordId: ${recordId}
filename: ${filename}
newspaperId: ${newspaperId}
keywords: ${keywords}
---
  
  ${content}
  `;
  
    await fs.writeFile(filePath, mdContent, 'utf8');
    console.log(`Saved content to ${filePath}`);
  } catch (error) {
    console.log(`Error saving content: ${error.message}`, JSON.stringify(metadata, 0, 2));
  }

};