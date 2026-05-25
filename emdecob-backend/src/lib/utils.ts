/**
 * Extracts a Google ID from a URL or returns the string if it's already an ID
 */
export const extractGoogleId = (input: string): string => {
  if (!input) return '';
  
  // Match ID in common Google URLs (Drive, Sheets, etc.)
  const driveMatch = input.match(/\/d\/([a-zA-Z0-9_-]+)(?:\/|#|\?|$)/);
  if (driveMatch && driveMatch[1]) return driveMatch[1];
  
  const idParamMatch = input.match(/[?&]id=([a-zA-Z0-9_-]+)(?:&|#|$)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // If it's a URL but no match found, try a generic pattern for long alphanumeric strings
  if (input.includes('/') || input.includes('.') || input.includes('?')) {
    const genericMatch = input.match(/([a-zA-Z0-9_-]{25,})/);
    if (genericMatch && genericMatch[1]) return genericMatch[1];
  }

  return input.trim();
};
