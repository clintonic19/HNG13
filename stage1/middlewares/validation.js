 // Helper methods
 const validateQueryParams = (filters) => {
    if (filters.is_palindrome && !['true', 'false'].includes(filters.is_palindrome)) {
      return 'Invalid value for is_palindrome. Must be "true" or "false".';
    }

    if (filters.min_length && isNaN(parseInt(filters.min_length))) {
      return 'Invalid value for min_length. Must be an integer.';
    }

    if (filters.max_length && isNaN(parseInt(filters.max_length))) {
      return 'Invalid value for max_length. Must be an integer.';
    }

    if (filters.word_count && isNaN(parseInt(filters.word_count))) {
      return 'Invalid value for word_count. Must be an integer.';
    }

    if (filters.contains_character && filters.contains_character.length !== 1) {
      return 'Invalid value for contains_character. Must be a single character.';
    }

    return null;
  }

const validateCreateBody = (req, res, next) => {
  const body = req.body;
  if (!body || !Object.prototype.hasOwnProperty.call(body, 'value')) {
    return res.status(400).json({ message: 'Invalid request body or missing "value" field' });
  }
  if (typeof body.value !== 'string') {
    return res.status(422).json({ message: 'Invalid data type for "value" (must be string)' });
  }
  next();
}

module.exports = {
  validateCreateBody
}