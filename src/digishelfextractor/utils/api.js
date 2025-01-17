import axios from 'axios';
import { API_BASE_URL, API_VERSION } from '../config.js';
import { getLastPathElement } from './naming.js';

const api = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  timeout: 30000
});

// Step 1: Get all collections
export const fetchCollections = async (field = 'DC') => {
  try {
    const response = await api.get(`/collections/${field}`);
    return response.data?.items || [];
  } catch (error) {
    console.error(`Error fetching collections: ${error.message}`);
    return [];
  }
};

// Step 2: Get collection details
export const fetchCollectionDetails = async (field = 'DC', collection) => {

  const collectionId = getLastPathElement(collection);

  try {
    const requestUrl = `/collections/${field}/${collectionId}`;
    console.log(`Fetching collection: ${requestUrl}`);
    const response = await api.get(requestUrl);
    return response.data?.items || [];
  } catch (error) {
    console.error(`Error fetching collection ${collectionId}: ${error.message}`);
    return [];
  }
};

// Step 3: Get record manifest
export const fetchRecordManifest = async (recordId) => {
  try {
    const requestUrl = `/records/${recordId}/manifest`;
    const response = await api.get(requestUrl);
    console.log(`Fetching records manifest: ${requestUrl}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching record manifest ${recordId}: ${error.message}`);
    return null;
  }
};

// Step 4: Get plaintext content
export const fetchPlaintext = async (plainTextUrl) => {
  try {
    const response = await api.get(plainTextUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plaintext ${plainTextUrl}: ${error.message}`);
    return null;
  }
};

export const fetchRecordSeeAlso = async (manifest, recordId) => {
  try {
    const seeAlso = manifest.seeAlso || [];
    if (seeAlso.length > 0) {

      const response = await api.get(seeAlso[0].id);
      return response.data;
    } else {
      return ''
    }
  } catch (error) {
    console.error(`Error fetching seeAlso ${recordId}: ${error.message}`);
    return [];
  }
};