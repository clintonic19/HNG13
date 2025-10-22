const { 
    analyzeString, 
    findByValue, 
    parseBoolean, 
    parseNaturalLanguageQuery, 
    sha256Hex, 
    storeByHash,
    storeByValue} = require("../utils/util");
const crypto = require('crypto');


// In-memory store:
// Map from sha256 -> record { id, value, properties, created_at }
// const storeByHash = new Map();
// Also keep a Map from raw string value -> sha (so GET/DELETE by string_value works fast)
// const storeByValue = new Map();

// Utility: compute SHA-256 hex
// function sha256Hex(value) {
//   return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
// }

//CREATE AND ANALYZE STRING
const createString = async(req, res) =>{
    // Simulate string creation and analysis logic
    try {
        const { value } = req.body;
        // Validate input
        if (!value || typeof value !== 'string') {
        return res.status(422).json({ message: 'Invalid value' });
          }

          const id = sha256Hex(value); // compute SHA-256 hash as ID
          // Check for duplicates
          if (storeByHash.has(id)) {
            return res.status(409).json({ message: 'String already exists in the system' });
          }
          const properties = analyzeString(value);
          const created_at = new Date().toISOString();
          const record = { id, value, properties, created_at };
        
          storeByHash.set(id, record);
          storeByValue.set(value, id);
        
          return res.status(201).json(record);

    } catch (error) {
         
      console.error("Error creating string", error.message);
  
      // Error response
      res.status(500).json({
        status: "error",
        message: "Failed to create string",
      });        
        
    }
}


//GET SPECIFIC STRING
const getString = async(req, res) =>{
    try {
         // string_value is url-encoded; decode it
  const param = decodeURIComponent(req.params.string_value);

  let record = findByValue(param);

  // If not found, maybe it's the hash
    if (!record && storeByHash.has(param)) {
      record = storeByHash.get(param);
    }

  if (!record) return res.status(404).json({ message: 'String does not exist in the system' });

  return res.status(200).json(record);

    } catch (error) {
        console.error("Error fetching string", error.message);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch string",
        });
    }
}


//GET ALL STRINGS WITH FILTERING
const getAllStrings = async(req, res) =>{
    try {
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

    const parsedIsPalindrome = parseBoolean(is_palindrome);
    if (is_palindrome !== undefined && parsedIsPalindrome === null) {
      return res.status(400).json({ message: 'Invalid query parameter for is_palindrome' });
    }

    const parsedMin = min_length === undefined ? undefined : parseInt(min_length, 10);
    const parsedMax = max_length === undefined ? undefined : parseInt(max_length, 10);
    const parsedWordCount = word_count === undefined ? undefined : parseInt(word_count, 10);

    if ((min_length !== undefined && Number.isNaN(parsedMin)) 
        || (max_length !== undefined && Number.isNaN(parsedMax)) 
        || (word_count !== undefined && Number.isNaN(parsedWordCount))) {
      return res.status(400).json({ message: 'Invalid numeric query parameter' });
    }

    if (contains_character !== undefined && typeof contains_character !== 'string') {
      return res.status(400).json({ message: 'Invalid contains_character parameter' });
    }

    const results = []; 
    for (const record of storeByHash.values()) {
      const p = record.properties;
      if (parsedIsPalindrome !== undefined && p.is_palindrome !== parsedIsPalindrome) continue;
      if (parsedMin !== undefined && p.length < parsedMin) continue;
      if (parsedMax !== undefined && p.length > parsedMax) continue;
      if (parsedWordCount !== undefined && p.word_count !== parsedWordCount) continue;
      if (contains_character !== undefined && contains_character.length > 0) {
        // check literal character (case-sensitive); you could change to case-insensitive
        if (!Object.prototype.hasOwnProperty.call(p.character_frequency_map, contains_character)) continue;
      }
      results.push(record);
    }

    return res.status(200).json({ data: results, count: results.length, filters_applied: 
        { is_palindrome: parsedIsPalindrome,
         min_length: parsedMin, max_length: parsedMax, 
         word_count: parsedWordCount, contains_character }
         });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

//FILTER BY NATURAL LANGUAGE QUERY
const filterByNaturalLanguage = async (req, res) => {
    const { query } = req.query;
  if (!query) return res.status(400).json({ message: 'Missing query parameter' });
  try {
    const interpreted = parseNaturalLanguageQuery(query);
    // reuse /strings filtering logic by applying interpreted.parsed_filters
    const { is_palindrome, min_length, max_length, word_count, contains_character } = interpreted.parsed_filters;

    // run filter
    const results = [];
    for (const record of storeByHash.values()) {
      const p = record.properties;
      if (is_palindrome !== undefined && p.is_palindrome !== is_palindrome) continue;
      if (min_length !== undefined && p.length < min_length) continue;
      if (max_length !== undefined && p.length > max_length) continue;
      if (word_count !== undefined && p.word_count !== word_count) continue;
      if (contains_character !== undefined && !Object.prototype.hasOwnProperty
            .call(p.character_frequency_map, contains_character)) continue;
      results.push(record);
    }

    return res.status(200).json({ 
      data: results, 
      count: results.length, 
      interpreted_query: interpreted 
    });

  } catch (err) {
    if (err.message && err.message.startsWith('Unable to parse')) return res.status(400).json({ message: 'Unable to parse natural language query' });
    return res.status(422).json({ message: 'Query parsed but resulted in conflicting filters' });
  }
}


//DELETE STRING
const deleteString = async(req, res) =>{
    try {
        const raw = decodeURIComponent(req.params.string_value);
        const record = findByValue(raw);
        if (!record) return res.status(404).json({ message: 'String does not exist in the system' });
        storeByHash.delete(record.id);
        storeByValue.delete(raw);
        
        // return res.status(200).json({
        //     message: 'String deleted successfully'
        // });
        return res.status(204).send();

    } catch (error) {
        console.error("Error deleting strings", error.message);
        return res.status(500).json({ message: 'Server error' });
    }
}


module.exports = {
    createString,
    getString,
    getAllStrings,
    filterByNaturalLanguage,
    deleteString
}