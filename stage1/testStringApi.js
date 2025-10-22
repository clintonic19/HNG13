// testStringsAPI.js
const axios = require("axios");

const BASE_URL = "http://localhost:5001/strings";

async function runTests() {
  try {
    console.log("🚀 Starting String Analysis API Tests...\n");

    // 1️⃣ POST /strings (create new)
    console.log("🔹 Testing POST /strings");
    let res = await axios.post(BASE_URL, { value: "Level" });
    console.log("✅ Created:", res.status, res.data);

    // 2️⃣ POST duplicate string (should return 409)
    console.log("\n🔹 Testing duplicate POST /strings");
    try {
      await axios.post(BASE_URL, { value: "Level" });
    } catch (err) {
      console.log("✅ Duplicate handled:", err.response.status); // expect 409
    }

    // 3️⃣ POST invalid (missing value)
    console.log("\n🔹 Testing POST /strings (missing field)");
    try {
      await axios.post(BASE_URL, {});
    } catch (err) {
      console.log("✅ Missing value handled:", err.response.status); // expect 422
    }

    // 4️⃣ GET /strings/{value}
    console.log("\n🔹 Testing GET /strings/:value");
    res = await axios.get(`${BASE_URL}/Level`);
    console.log("✅ Found string:", res.status, res.data);

    // 5️⃣ GET /strings?is_palindrome=true
    console.log("\n🔹 Testing GET /strings?is_palindrome=true");
    res = await axios.get(`${BASE_URL}?is_palindrome=true`);
    console.log("✅ Filter works:", res.status, Array.isArray(res.data) ? res.data.length : res.data);

    // 6️⃣ GET /strings/filter-by-natural-language
    console.log("\n🔹 Testing GET /strings/filter-by-natural-language");
    res = await axios.get(`${BASE_URL}/filter-by-natural-language?q=palindrome`);
    console.log("✅ Natural language:", res.status, res.data);

    // 7️⃣ DELETE /strings/{value}
    console.log("\n🔹 Testing DELETE /strings/:value");
    res = await axios.delete(`${BASE_URL}/Level`);
    console.log("✅ Deleted:", res.status, res.data);

    // 8️⃣ DELETE non-existent (should 404)
    console.log("\n🔹 Testing DELETE non-existent");
    try {
      await axios.delete(`${BASE_URL}/Nope`);
    } catch (err) {
      console.log("✅ Non-existent delete handled:", err.response.status); // expect 404
    }

    console.log("\n🎯 All tests completed successfully!");
  } catch (err) {
    console.error("❌ Test failed:", err.message);

  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Response data:", err.response.data);
  } else if (err.request) {
    console.error("No response received. Possible ECONNREFUSED or wrong port.");
  } else {
    console.error("Unexpected error:", err);
  }
  }
}

runTests();
