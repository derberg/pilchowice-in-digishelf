import { fetchCollectionDetails } from "../utils/api.js";
import { processRecord } from "./record-processor.js";
import chalk from "chalk";

export async function processCollection(field, collectionId) {
	let items = await fetchCollectionDetails(field, collectionId);

	//

	//items = []

	for (const item of items) {
		//TODO there might be also type Collection and we might need to traverse it separately
		if (item.type === "Manifest") {
			console.log(`Processing record: ${item.id}`);
			const recordId = extractIdFromLink(item.id);

			// Process the record
			await processRecord(recordId);

			// Wait for 0.5 second before processing the next record
			await delay(200);
		}

		if (item.type === "Collection") {
			console.log(
				chalk.red(`There is a subcollection to look into later: ${item.id}`)
			);
		}
	}
}

// Helper function to create a delay
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractIdFromLink(link) {
	const match = link.match(/\/([\w-]+)\/manifest\/$/);
	return match ? match[1] : null;
}
