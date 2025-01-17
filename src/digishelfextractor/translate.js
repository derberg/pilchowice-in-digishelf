import fs from "node:fs/promises";
import path from "node:path";
import { OpenAI } from "openai";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

async function translateText(text, keywords) {
	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4-turbo",
			messages: [
				{
					role: "system",
					content: `Translate German text to Polish language. 
					Return the result in the following JSON structure:
					{
						"summary": "A brief summary of the document's content. In Polish language",
						"details": "Must contain translation of the paragraphs containing the keywords: '${keywords}'.  Make translation is related to and includes the specified keywords. Translation must be in Polish language. Translation should not be a block of text but well structured content using paragraphs and bullet points if necessary in markdown syntax."
					}.
					Make sure the returned JSON is valid.`,
				},
				{
					role: "user",
					content: text,
				},
			],
		});

		// Parse and return the JSON response
		const messageContent = response.choices[0].message.content;
		return JSON.parse(messageContent);
	} catch (error) {
		throw new Error("Translation error: " + error.message);
	}
}

async function main() {
	try {
		const archiveDataPath = path.join(process.cwd(), "archive-data.json");
		const archiveData = JSON.parse(await fs.readFile(archiveDataPath, "utf-8"));
		let hasNewTranslations = false;

		for (const document of archiveData.documents) {
			if (!document.translation) {
				console.log(
					`Translating content for ${document.recordId}, page ${document.pageNumber}, keywords: ${document.keywords}`
				);

				const translation = await translateText(
					document.content,
					document.keywords
				);

				document.translation = translation;
				hasNewTranslations = true;

				// Save after each translation to prevent loss
				await fs.writeFile(
					archiveDataPath,
					JSON.stringify(archiveData, null, 2)
				);
			}
			//break;
		}

		if (hasNewTranslations) {
			archiveData.lastUpdated = new Date().toISOString();
			await fs.writeFile(archiveDataPath, JSON.stringify(archiveData, null, 2));
			console.log("All translations completed and saved to archive-data.json");
		} else {
			console.log("No new translations needed");
		}
	} catch (error) {
		console.error("Error processing translations:", error);
		process.exit(1);
	}
}

main();
