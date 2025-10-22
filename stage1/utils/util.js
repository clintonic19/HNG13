const crypto = require('crypto');

// In-memory store:
// Map from sha256 -> record { id, value, properties, created_at }
const storeByHash = new Map();

// Also keep a Map from raw string value -> sha (so GET/DELETE by string_value works fast)
const storeByValue = new Map();

// Utility: compute SHA-256 hex
const sha256Hex = (value) => {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

// Analyze string properties
const analyzeString = (value) => {
  const id = sha256Hex(value);
  const length = value.length;

  const normalized = value.toLowerCase(); //
  const is_palindrome = normalized === normalized.split('').reverse().join('');

  // character frequency map (counts every code unit)
  const frequency = {};
  for (const ch of value) {
    frequency[ch] = (frequency[ch] || 0) + 1;
  }

  const unique_characters = Object.keys(frequency).length;
  // word count: split by any unicode whitespace; filter out empty tokens
  const words = value.trim() === '' ? [] : value.trim().split(/\s+/);
  const word_count = words.length;

  return {
    length: value.length,
    is_palindrome,
    unique_characters: Object.keys(frequency).length,
    word_count: value.trim() ? value.trim().split(/\s+/).length : 0,
    sha256_hash: id,
    character_frequency_map: frequency
    // length: number,
    // isPalindrome: boolean,
    // lowercase: string,
    // uppercase: string,
    // sha256: string
  };
  
}

// Helper to find by raw string value (exact match)
const findByValue = (value) => {
  const id = storeByValue?.get(value);
  if (!id) return null;
  return storeByHash?.get(id) || null;
}
 
//Get All Strings with Filtering
const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  if (['true', '1'].includes(String(value).toLowerCase())) return true;
  if (['false', '0'].includes(String(value).toLowerCase())) return false;
  return null; // invalid
}


// 4. Natural Language Filtering
// Very simple heuristic-based parser for the example queries described in the spec.
const parseNaturalLanguageQuery = (text) => {
  if (!text || typeof text !== 'string') throw new Error('Invalid query');
  const q = decodeURIComponent(text).toLowerCase().trim();
  const parsed = { original: q, parsed_filters: {} };

  // "single word" or "single-word" -> word_count = 1
  if (/single\s*-?word/.test(q) || /single\s+word/.test(q)) parsed.parsed_filters.word_count = 1;

  // "palindrom" -> is_palindrome = true
  if (/palindrom/.test(q)) parsed.parsed_filters.is_palindrome = true;

  // "longer than N" or "longer than 10 characters" -> min_length = N+1
  const longerMatch = q.match(/longer\s+than\s+(\d+)/);
  if (longerMatch) {
    const n = parseInt(longerMatch[1], 10);
    if (!Number.isNaN(n)) parsed.parsed_filters.min_length = n + 1;
  }

  // "strings containing the letter z" or "containing the letter z" or "contain z"
  const containLetter = q.match(/contain(?:s|ing)?(?: the letter)?\s+([a-z])/);
  if (containLetter) parsed.parsed_filters.contains_character = containLetter[1];

  // "that contain the first vowel" heuristic -> pick 'a' (first vowel a,e,i,o,u)
  if (/first vowel/.test(q)) parsed.parsed_filters.contains_character = 'a';

  // if nothing parsed, throw
  if (Object.keys(parsed.parsed_filters).length === 0) throw new Error('Unable to parse natural language query');

  // Example conflict detection: contradictory palindrome filters (not implemented here) - return parsed
  return parsed;
}



module.exports = {
analyzeString,
parseBoolean,
findByValue,
parseNaturalLanguageQuery,
sha256Hex,
storeByValue,
storeByHash,
}