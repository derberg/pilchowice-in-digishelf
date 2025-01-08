import chalk from 'chalk';
import { fetchCollections } from './utils/api.js';
import { processCollection } from './processors/collection-processor.js';
import { IGNORED_COLLECTIONS } from './config.js';
import { getLastPathElement } from './utils/naming.js';

async function main() {
  console.log(chalk.blue('Starting content extraction...'));

  const collections = await fetchCollections('DC');
  console.log(chalk.yellow(`Found ${collections.length} collections`));

  for (const collection of collections) {

    const collectionName = getLastPathElement(collection.id);

    if (IGNORED_COLLECTIONS.includes(collectionName)) {
      console.log(`Skipping collection as in ingored list: ${collectionName}`);
      continue;
    }

    console.log(chalk.cyan(`Processing collection: ${collectionName}`));
    await processCollection('DC', collection.id);
  }

  console.log(chalk.green('Content extraction completed!'));
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});