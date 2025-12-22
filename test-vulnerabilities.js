// TEST FILE - This file contains intentional vulnerabilities for testing the scanner

// 1. Hardcoded API Key (Critical)
const apiKey = "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// 2. Hardcoded Password (High)
const password = "SuperSecret123!";

// 3. SQL Injection (Critical)
function getUserData(userId) {
    const query = "SELECT * FROM users WHERE id = " + userId; // Vulnerable!
    return db.execute(query);
}

// 4. XSS Vulnerability (High)
function displayMessage(msg) {
    document.getElementById('output').innerHTML = msg; // Vulnerable!
}

// 5. Command Injection (High)
const { exec } = require('child_process');
function runCommand(userInput) {
    exec(`ls ${userInput}`); // Vulnerable!
}

// 6. Weak Random (Medium)
function generateToken() {
    return Math.random().toString(36); // Not cryptographically secure!
}

// 7. Insecure HTTP (Low)
const apiUrl = "http://api.example.com/data";

// 8. Sensitive Data Logging (Medium)
console.log("User password:", password);

// 9. eval() usage (High)
function processData(code) {
    eval(code); // Very dangerous!
}

// 10. Unvalidated Input (Medium)
app.post('/user', (req, res) => {
    const username = req.body.username; // No validation!
    saveUser(username);
});

console.log("This file has 10+ vulnerabilities for testing!");
