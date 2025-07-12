import fs from "node:fs/promises";
import path from "node:path";
import fetch from "node-fetch";

function extractPageNumber(filename) {
  const match = filename.match(/(\d+)\.xml$/);
  return match ? match[1].replace(/^0+/, "") : "";
}

function parseNewspaper(newspaper, recordId) {
  console.log(newspaper, recordId);
  const match = newspaper.match(/(.*?),\s*Jg\.\s*(\d{4})/);
  if (match) {
    return {
      title: match[1].trim(),
      year: match[2],
    };
  }
  return { title: newspaper.trim(), year: recordId.slice(-4) };
}

async function traverseDirectory(dir) {
  //put below line in try catch block and handle error that in case ENOENT is thrown it means it should stop traversing
  try {
    await fs.access(dir);
  } catch (error) {
    console.error(`Directory not found which probably means we already did our job here: ${dir}`);
    return [];
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return traverseDirectory(fullPath);
      } else if (entry.name.endsWith(".xml")) {
        return [fullPath];
      }
      return [];
    })
  );
  return files.flat();
}

async function fetchThumbnail(recordId) {
  try {
    const outputDir = path.join(process.cwd(), "public", "thumbnails");
    const outputPath = path.join(outputDir, `${recordId}.jpg`);

    // Check if the file already exists
    try {
      await fs.access(outputPath);
      console.log(`Thumbnail for recordId ${recordId} already exists at ${outputPath}`);
      return; // Skip fetching if file exists
    } catch {
      // File does not exist, proceed with fetching
    }

    const apiUrl = `https://www.digishelf.de/api/v2/records/${recordId}/manifest/`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch manifest for recordId ${recordId}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    const thumbnail = jsonResponse.thumbnail;
    let thumbnailUrl;

    if (!thumbnail) {
      throw new Error(`Thumbnail not in the manifest ${apiUrl}`);
    } else {
      thumbnailUrl = thumbnail[0].id;
    }

    if (!thumbnailUrl) {
      throw new Error(`Thumbnail not found for recordId ${recordId}`);
    }

    const thumbnailResponse = await fetch(thumbnailUrl);

    if (!thumbnailResponse.ok) {
      throw new Error(`Failed to fetch thumbnail image for recordId ${recordId}: ${thumbnailResponse.statusText}`);
    }

    const imageBuffer = await thumbnailResponse.buffer();

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, imageBuffer);

    console.log(`Thumbnail saved for recordId ${recordId} at ${outputPath}`);
  } catch (error) {
    console.error(`Error fetching thumbnail for recordId ${recordId}:`, error);
  }
}

async function processFile(filePath, existingDocuments) {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const [frontmatter, ...contentParts] = fileContent
    .split("---")
    .filter(Boolean);

  const metadata = {};
  frontmatter.split("\n").forEach((line) => {
    const [key, value] = line.split(":").map((s) => s.trim());
    if (key && value) {
      metadata[key] = value;
    }
  });

  const { title: newspaperTitle, year } = parseNewspaper(
    metadata.newspaper,
    metadata.recordId
  );
  const pageNumber = extractPageNumber(metadata.filename);
  const documentText = contentParts.join("---").trim();
  const keywordsArray = metadata.keywords.split(",").map((k) => k.trim());

  const existingDocument = existingDocuments.find(
    (doc) => {
      return doc.filename === metadata.filename
    }
  );

  if (existingDocument) {
    console.log(`Skipping file ${filePath} as it already exists in archive`);
    return null;
  }

  return {
    ...metadata,
    newspaperTitle,
    year,
    pageNumber,
    keywords: keywordsArray,
    content: documentText,
  };
}

async function main() {
  try {
    const contentDir = path.join(process.cwd(), "digishelf_reviewed");
    const files = await traverseDirectory(contentDir);
    //add code that if files is empty array then exit.  
    if (files.length === 0) {
      console.log("My job is doene here. No files to process.");
      return;
    }
    const archivePath = path.join(process.cwd(), "archive-data.json");
    let archiveData = { lastUpdated: "", documents: [] };

    try {
      const archiveContent = await fs.readFile(archivePath, "utf-8");
      archiveData = JSON.parse(archiveContent);
    } catch {
      console.log("No existing archive-data.json found. Creating a new one.");
    }

    const documents = [];

    for (const file of files) {
      const document = await processFile(file, archiveData.documents);
      if (document) {
        documents.push(document);

        // Fetch and save thumbnail for each recordId
        if (document.recordId) {
          await fetchThumbnail(document.recordId);
        }
      }
    }

    archiveData.documents.push(...documents);
    archiveData.lastUpdated = new Date().toISOString();

    await fs.writeFile(archivePath, JSON.stringify(archiveData, null, 2));
    console.log(
      "Archive data has been processed and saved to archive-data.json"
    );
  } catch (error) {
    console.error("Error processing content:", error);
    process.exit(1);
  }
}

main();
