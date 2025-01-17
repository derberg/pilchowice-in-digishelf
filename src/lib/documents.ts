import fs from 'node:fs/promises';
import path from 'node:path';
import type { ArchiveData, DocumentMetadata } from './types';

export async function getDocuments(): Promise<DocumentMetadata[]> {
  try {
    const archiveDataPath = path.join(process.cwd(), 'archive-data.json');
    const content = await fs.readFile(archiveDataPath, 'utf-8');
    const archiveData: ArchiveData = JSON.parse(content);
    return archiveData.documents;
  } catch (error) {
    console.error('Error loading archive data:', error);
    return [];
  }
}