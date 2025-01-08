import {
	fetchRecordManifest,
	fetchPlaintext,
} from "../utils/api.js";
import { containsKeywords, saveContent } from "../utils/content.js";
import chalk from 'chalk';


export async function processRecord(recordId) {
	const manifest = await fetchRecordManifest(recordId);
	if (!manifest) return;

	const metadata = extractMetadata(manifest, recordId);
	//const recordSeeAlso = await fetchRecordSeeAlso(manifest, recordId);

  const manifestString = JSON.stringify(manifest);
  const altoNumber = countOccurrences(manifestString, "alto");

	if (altoNumber > 3) {
		console.log(`Processing records title: ${metadata.newspaper}`);
		await processPages(recordId, manifest.items || [], metadata);
	} else {
    console.log('Skipping record as there are no xml files.');
  }
}

function extractMetadata(manifest, recordId) {
	return {
		newspaper: manifest.label?.none || "Unknown",
		recordId: recordId,
	};
}

async function processPages(recordId, items, metadata) {
	for (const item of items) {
		if (item.type === "Canvas" && item.seeAlso) {
			if (item.seeAlso.length > 1)
				console.log(
					'Warning: More than one "seeAlso" found',
					JSON.stringify(item.seeAlso, 0, 2)
				);
			await processSeeAlso(recordId, item.seeAlso[0], metadata);

			// Add a 0.5 second delay after processing the item
			await delay(300);
		} else {
			console.log('Skipping record as there is no "seeAlso" with XML');
		}
	}
}

// Helper function to create a delay
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processSeeAlso(recordId, seeAlso, metadata) {
	const id = seeAlso.id;
	
  const plaintextLink = id.replace("/alto/", "/plaintext/");
  const filename = plaintextLink.split('/').pop();
	const newspaperId = extractTitleFromLink(plaintextLink);

	console.log(`Processing content from:`, plaintextLink);
	const content = await fetchPlaintext(plaintextLink);

	if (content && containsKeywords(content)) {
    console.log(chalk.yellow('Saving content as keyword was found'));
		await saveContent(content, {
			...metadata,
			filename,
      newspaperId
		});
	} else {
    console.log('Skipping content as no keyword was found');
  }
}

function extractTitleFromLink(url) {
  const regex = /\/([A-Za-z0-9]+)[_-].+\.xml$/;  // Capture before either _ or -
  const match = url.match(regex);
  return match ? match[1] : null;
}

function countOccurrences(longString, substring) {
  const matches = longString.match(new RegExp(substring, 'g'));
  return matches ? matches.length : 0;
}