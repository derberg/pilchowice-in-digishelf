import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const JSON_PATH = path.join(process.cwd(), 'archive-data.json');

// Load and parse your archive-data.json
const data = JSON.parse(await readFile(JSON_PATH, 'utf8'));

// Iterate all records
for (let rec of data.documents) {
	const rid = rec.recordId;
	if (!rid) continue;

	// Skip ones already annotated
	if (rec.addDate) continue;

	// Build the git-log command
	const searchString = `'"recordId": "${rid}"'`;
	const cmd = [
		'git',
		'log',
		'--format=%aI', // ISO 8601 author date
		'--reverse', // oldest commits first
		'-S',
		searchString, // look for that exact JSON snippet
		'--',
		JSON_PATH, // limit to archive-data.json
	];

	let date = null;
	try {
		// run the command and grab the first line
		const out = execSync(cmd.join(' '), { encoding: 'utf8' });
		date = out.split('\n')[0].trim();
	} catch (err) {
		console.warn(`⚠️  could not find addDate for ${rid}`);
	}

	rec.addDate = date;
}

// Write back the updated JSON
await writeFile(JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('✅ addDates.js complete – all records now have addDate');
