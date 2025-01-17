export const getLastPathElement = (url) => {
  // Remove any trailing slash to ensure consistent results
  const cleanedUrl = url.replace(/\/$/, "");
  
  // Split the URL by slashes and get the last segment
  const parts = cleanedUrl.split("/");
  return parts[parts.length - 1];
}