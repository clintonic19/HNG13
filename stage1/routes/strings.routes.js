const express = require('express');
const router = express.Router();
const { createString, getAllStrings, getString, 
    filterByNaturalLanguage, deleteString, } = require('../controllers/string.controller');
const { validateCreateBody } = require('../middlewares/validation');

// POST /strings - Create/Analyze String
router.post('/', validateCreateBody, createString);

// GET /strings/filter-by-natural-language - Natural Language Filtering
router.get('/filter-by-natural-language', filterByNaturalLanguage);

// GET /strings - Get All Strings with Filtering
router.get('/', getAllStrings);

// GET /strings/{string_value} - Get Specific String
router.get('/:string_value', getString);

// DELETE /strings/{string_value} - Delete String
router.delete('/:string_value', deleteString);


module.exports = router;