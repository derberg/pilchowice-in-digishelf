import { fetchCollectionDetails } from '../utils/api.js';
import { processRecord } from './record-processor.js';

export async function processCollection(field, collectionId) {
  const items = await fetchCollectionDetails(field, collectionId);

  for (const item of items) {
    if (item.type === 'Manifest') {
      console.log(`Processing record: ${item.id}`);
      const recordId = extractIdFromLink(item.id);
      
      // Process the record
      await processRecord(recordId);

      // Wait for 0.5 second before processing the next record
      await delay(300);
    }
  }
}

// Helper function to create a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractIdFromLink(link) {
  const match = link.match(/\/([\w-]+)\/manifest\/$/);
  return match ? match[1] : null;
}