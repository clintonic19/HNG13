# String Analyzer Service

A RESTful API service that analyzes strings and stores their computed properties.

## Features

- Analyze string properties (length, palindrome check, character frequency, etc.)
- Filter strings by various criteria
- Natural language query support
- SHA-256 based unique identification

## API Endpoints

### 1. Create/Analyze String
**POST** `/strings`
```json
{
  "value": "string to analyze"
}
```
## install Dependencies
* npm install

### Run the Server
 * npm start 
 * npm run dev

