/**
 * Self-test script for String Analysis API
 * Run: node selfTest.js
 */

const axios = require("axios");

const BASE = "http://localhost:5001/strings";

const testString = "Level";
const testDuplicate = "Level";
const nonExistent = "RandomNonExistentString";

(async () => {
  console.log("=== SELF TEST START ===\n");

  // Helper for displaying result
  const log = (name, ok, detail = "") =>
    console.log(`${ok ? "✅" : "❌"} ${name}${detail ? ` → ${detail}` : ""}`);

  // 1️⃣ POST /strings — Create new string
  try {
    const res = await axios.post(BASE, { value: testString });
    if (res.status === 201 && res.data.properties) {
      log("POST /strings", true);
    } else {
      log("POST /strings", false, `Status ${res.status}`);
    }
  } catch (err) {
    log("POST /strings", false, err.response?.statusText || err.message);
  }

  // 2️⃣ POST /strings (Duplicate)
  try {
    await axios.post(BASE, { value: testDuplicate });
    log("POST duplicate", false, "Expected 409 Conflict");
  } catch (err) {
    if (err.response?.status === 409) {
      log("POST duplicate", true);
    } else {
      log("POST duplicate", false, `Got ${err.response?.status}`);
    }
  }

  // 3️⃣ POST /strings with missing value
  try {
    await axios.post(BASE, {});
    log("POST missing 'value'", false, "Expected 422");
  } catch (err) {
    if (err.response?.status === 422) {
      log("POST missing 'value'", true);
    } else {
      log("POST missing 'value'", false, `Got ${err.response?.status}`);
    }
  }

  // 4️⃣ GET /strings/:value (existing)
  try {
    const res = await axios.get(`${BASE}/${encodeURIComponent(testString)}`);
    if (res.status === 200 && res.data.properties) {
      log("GET existing string", true);
    } else {
      log("GET existing string", false, `Status ${res.status}`);
    }
  } catch (err) {
    log("GET existing string", false, err.response?.statusText || err.message);
  }

  // 5️⃣ GET /strings/:value (non-existent)
  try {
    await axios.get(`${BASE}/${encodeURIComponent(nonExistent)}`);
    log("GET non-existent string", false, "Expected 404");
  } catch (err) {
    if (err.response?.status === 404) {
      log("GET non-existent string", true);
    } else {
      log("GET non-existent string", false, `Got ${err.response?.status}`);
    }
  }

  // 6️⃣ GET /strings?is_palindrome=true
  try {
    const res = await axios.get(`${BASE}?is_palindrome=true`);
    if (res.status === 200 && Array.isArray(res.data.data)) {
      log("GET with filters (is_palindrome)", true);
    } else {
      log("GET with filters", false, `Status ${res.status}`);
    }
  } catch (err) {
    log("GET with filters", false, err.response?.statusText || err.message);
  }

  // 7️⃣ GET /strings/filter-by-natural-language?q=palindromes
  try {
    const res = await axios.get(
      `${BASE}/filter-by-natural-language?q=${encodeURIComponent("find palindromes")}`
    );
    if (res.status === 200 && Array.isArray(res.data.data)) {
      log("GET filter-by-natural-language", true);
    } else {
      log("GET filter-by-natural-language", false, `Status ${res.status}`);
    }
  } catch (err) {
    log("GET filter-by-natural-language", false, err.response?.statusText || err.message);
  }

  // 8️⃣ DELETE /strings/:value
  try {
    const res = await axios.delete(`${BASE}/${encodeURIComponent(testString)}`);
    if (res.status === 204) {
      log("DELETE existing string", true);
    } else {
      log("DELETE existing string", false, `Status ${res.status}`);
    }
  } catch (err) {
    log("DELETE existing string", false, err.response?.statusText || err.message);
  }

  // 9️⃣ DELETE /strings/:value (non-existent)
  try {
    await axios.delete(`${BASE}/${encodeURIComponent(nonExistent)}`);
    log("DELETE non-existent string", false, "Expected 404");
  } catch (err) {
    if (err.response?.status === 404) {
      log("DELETE non-existent string", true);
    } else {
      log("DELETE non-existent string", false, `Got ${err.response?.status}`);
    }
  }

  console.log("\n=== SELF TEST COMPLETE ===");
})();
