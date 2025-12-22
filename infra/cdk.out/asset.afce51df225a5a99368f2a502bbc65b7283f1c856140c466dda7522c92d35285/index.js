"use strict";var g=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var C=Object.prototype.hasOwnProperty;var v=(n,e)=>{for(var s in e)g(n,s,{get:e[s],enumerable:!0})},R=(n,e,s,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of T(e))!C.call(n,i)&&i!==s&&g(n,i,{get:()=>e[i],enumerable:!(t=k(e,i))||t.enumerable});return n};var E=n=>R(g({},"__esModule",{value:!0}),n);var F={};v(F,{handler:()=>b});module.exports=E(F);var b=async n=>{console.log("Received scan request");try{if(!n.body)return{statusCode:400,body:JSON.stringify({error:"No body provided"})};let{owner:e,repo:s,token:t,apiKey:i}=JSON.parse(n.body);if(!e||!s||!t||!i)return{statusCode:400,body:JSON.stringify({error:"Missing required fields: owner, repo, token, apiKey (for Gemini)"})};let c=(await f(t,e,s)).filter(o=>/\.(js|ts|tsx|jsx|py|go|rs|java|sol)$/.test(o.path));console.log(`Found ${c.length} code files. Fetching content...`);let r=await Promise.all(c.slice(0,50).map(o=>P(t,e,s,o.path))),d=O(r);console.log("Invoking Google Gemini with deterministic settings...");let u=3,m=2e3,S=null,a=null;for(let o=0;o<=u;o++)try{if(a=await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${i}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:d}]}],generationConfig:{temperature:0,topK:1,topP:.1,candidateCount:1,maxOutputTokens:8192}})}),a.ok){console.log(`\u2705 Gemini API call succeeded on attempt ${o+1}`);break}let p=await a.clone().json().catch(()=>({}));if(!(a.status===503||a.status===429||a.status===500)||o===u)break;let h=m*Math.pow(2,o);console.warn(`\u26A0\uFE0F Gemini API returned ${a.status}. Retrying in ${h}ms... (Attempt ${o+1}/${u})`),await new Promise(A=>setTimeout(A,h))}catch(p){if(S=p,console.error(`\u274C Gemini API call failed on attempt ${o+1}:`,p),o===u)throw p;let y=m*Math.pow(2,o);console.warn(`Retrying in ${y}ms...`),await new Promise(h=>setTimeout(h,y))}if(!a||!a.ok){let o=await a.text();throw console.error("Gemini API error:",o),new Error(`Gemini API error: ${a.status} - ${o}`)}let I=(await a.json()).candidates[0].content.parts[0].text,w=L(I);return{statusCode:200,body:JSON.stringify(w),headers:{"Content-Type":"application/json"}}}catch(e){return console.error("Lambda Scan Failed:",e),{statusCode:500,body:JSON.stringify({error:e.message||"Internal Server Error"})}}};async function f(n,e,s,t=""){console.log(`\u{1F4C1} Fetching files from: ${t||"(root)"}`);let i=await fetch(`https://api.github.com/repos/${e}/${s}/contents/${t}`,{headers:{Authorization:`Bearer ${n}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!i.ok){let r=await i.text();throw console.error(`GitHub Fetch Failed (${i.status}):`,r),new Error(`GitHub Fetch Failed: ${i.statusText} (${i.status}) - ${r}`)}let l=await i.json(),c=[];if(Array.isArray(l)){for(let r of l)if(r.type==="file")c.push(r),console.log(`  \u{1F4C4} Found file: ${r.path}`);else if(r.type==="dir"){if(r.name==="node_modules"||r.name===".git"||r.name===".next"){console.log(`  \u23ED\uFE0F  Skipping: ${r.path}`);continue}try{let d=await f(n,e,s,r.path);c=c.concat(d)}catch(d){console.error(`Error fetching directory ${r.path}:`,d)}}}return console.log(`\u2705 Found ${c.length} total files in ${t||"(root)"}`),c}async function P(n,e,s,t){let i=await fetch(`https://api.github.com/repos/${e}/${s}/contents/${t}`,{headers:{Authorization:`Bearer ${n}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!i.ok){let r=await i.text();throw console.error(`GitHub Content Fetch Failed (${i.status}):`,r),new Error(`GitHub Content Fetch Failed: ${i.statusText}`)}let l=await i.json(),c=Buffer.from(l.content,"base64").toString("utf-8");return{path:t,content:c}}function O(n){let e="";for(let s of n)e+=`
--- FILE: ${s.path} ---
${s.content}
`;return`You are a comprehensive security scanner. Perform a THOROUGH analysis of the following code for ALL security issues, including low-priority ones.

VULNERABILITY CATEGORIES (Report ALL that apply):

**CRITICAL & HIGH PRIORITY:**
1. SQL Injection (CWE-89) - Any database queries with user input
2. Cross-Site Scripting (CWE-79) - Any unescaped output to HTML/JS, document.write(), innerHTML, eval()
3. Path Traversal (CWE-22) - File operations with user-controlled paths, fs.readFile(), require()
4. Command Injection (CWE-78) - Any shell command execution, exec(), spawn()
5. Hardcoded Secrets (CWE-798) - API keys, tokens, passwords, private keys, access tokens
6. Authentication Bypass (CWE-287) - Missing or weak authentication
7. Authorization Issues (CWE-285) - Missing access control checks
8. Insecure Deserialization (CWE-502) - Unsafe JSON/object parsing

**MEDIUM PRIORITY:**
9. Cryptographic Failures (CWE-327) - Weak algorithms, hardcoded IVs
10. Information Disclosure - Exposed error messages, debug info, stack traces
11. CORS Misconfiguration - Overly permissive CORS policies
12. Missing Security Headers - CSP, X-Frame-Options, HSTS
13. Insecure Direct Object References (IDOR) - Unvalidated IDs
14. Server-Side Request Forgery (SSRF) - Unvalidated external requests, fetch(), axios.get()
15. XML External Entities (XXE) - Unsafe XML parsing

**LOW PRIORITY (STILL REPORT):**
16. Missing Input Validation - Unvalidated user inputs
17. Weak Random Number Generation - Math.random() for security
18. Insecure HTTP Usage - HTTP instead of HTTPS
19. Missing Rate Limiting - No throttling on sensitive endpoints
20. Dependency Vulnerabilities - Outdated packages with known CVEs
21. Exposed Sensitive Files - .env, config files, credentials
22. Console.log with Sensitive Data - Logging passwords, tokens
23. Commented-out Secrets - Old API keys in comments
24. TODO/FIXME Security Notes - Security-related TODOs

Code Context:
${e}

ANALYSIS RULES:
- Scan THOROUGHLY - check every file for ALL vulnerability types
- Report EVERYTHING suspicious, even if low severity
- Look for patterns like: "password", "secret", "api_key", "token", "private_key", "aws_", "sk_", "pk_"
- Check for exposed credentials in: strings, environment variables, comments, config files
- Include EXACT line numbers where issues occur
- Be CONSISTENT - same code = same findings every time
- Prioritize by severity but REPORT ALL FINDINGS

SPECIFIC PATTERNS TO DETECT:

**XSS Patterns:**
- document.write() with any variables
- innerHTML = with any variables
- eval() with any input
- dangerouslySetInnerHTML in React
- v-html in Vue
- Any user input rendered without escaping

**SSRF Patterns:**
- fetch(url) where url comes from user input
- axios.get(url) where url is not hardcoded
- http.request() with dynamic URLs
- Any HTTP client with user-controlled destination

**File Inclusion Patterns:**
- fs.readFile() with user input in path
- require() with dynamic paths
- import() with user-controlled paths
- path.join() with unvalidated input

**API Token/Secret Patterns (CRITICAL - Report ALL):**
- RapidAPI tokens: "X-RapidAPI-Key", headers with API keys
- GitHub tokens: ghp_, gho_, ghs_, ghu_
- AWS keys: AKIA, aws_access_key_id, aws_secret_access_key
- Stripe keys: sk_live_, pk_live_, sk_test_, pk_test_
- Google API: AIza[0-9A-Za-z-_]{35}
- Firebase: [0-9a-zA-Z-_]{40}
- JWT tokens: eyJ[A-Za-z0-9-_=]+\\.eyJ[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*
- Private keys: -----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----
- Database URLs: mongodb://, postgres://, mysql:// with credentials
- Any string matching: /[a-zA-Z0-9_-]{20,}/

**Exposed Secrets in Files:**
- Check .env files, config.js, constants.ts
- Check for hardcoded passwords in variables
- Check for API keys in headers objects
- Check for tokens in localStorage/sessionStorage calls
- Check for credentials in fetch/axios calls

SECRETS DETECTION (Be extra vigilant):
- API Keys: Look for patterns like "AIza", "sk_live_", "pk_test_", "AKIA", "X-RapidAPI-Key"
- Tokens: JWT tokens, OAuth tokens, GitHub tokens (ghp_, gho_), Bearer tokens
- Passwords: Hardcoded passwords in strings or variables (password = "...", pwd: "...")
- Private Keys: RSA, SSH, PGP keys in code
- Database URLs: Connection strings with credentials (user:pass@host)
- AWS Credentials: Access keys, secret keys
- Firebase Config: apiKey, authDomain, projectId with actual values

Output Format: Valid JSON object with this EXACT structure:
{
  "findings": [
    {
      "id": "unique-hash",
      "type": "SQL Injection | XSS | Path Traversal | Command Injection | Hardcoded Secret | Auth Bypass | Authorization Issue | Crypto Failure | Information Disclosure | CORS Misconfiguration | Missing Security Headers | IDOR | SSRF | XXE | Missing Input Validation | Weak Random | Insecure HTTP | Missing Rate Limiting | Dependency Vulnerability | Exposed Sensitive File | Sensitive Data Logging | Commented Secret | Security TODO",
      "name": "Brief title (max 50 chars)",
      "severity": "Critical | High | Medium | Low",
      "location": "file/path.ts:line_number",
      "description": "One line explanation (max 80 chars)",
      "fix": "Specific fix suggestion (max 150 chars)",
      "fixTime": "30 min | 1 hr | 2 hr | 4 hr",
      "detailedAnalysis": "Detailed explanation with code snippet",
      "codeSnippet": "Exact vulnerable code from the file",
      "subIssues": [
        {
          "id": "sub-hash",
          "cve": "CVE-YYYY-XXXXX",
          "severity": "Critical | High | Medium | Low",
          "package": "package-name",
          "version": "affected version range",
          "analysis": "Brief CVE description"
        }
      ]
    }
  ],
  "summary": "X Critical, Y High, Z Medium, W Low vulnerabilities found"
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON (no markdown, no code blocks)
- Include line numbers in location (format: "path/file.ts:42")
- Generate deterministic IDs based on file+line+type
- Be THOROUGH - scan every line for potential issues
- Be CONSISTENT - same code = same findings
- REPORT MORE rather than less - we want comprehensive coverage
- Pay special attention to API tokens, secrets, and credentials
`}function L(n){try{let e=n.replace(/```json/g,"").replace(/```/g,"").trim(),s=JSON.parse(e);return!s.findings||!Array.isArray(s.findings)?(console.warn("Invalid findings structure, returning empty array"),{findings:[],summary:"Failed to parse analysis results."}):(s.findings=s.findings.map((t,i)=>(t.id||(t.id=x(t)),t.type=t.type||"Unknown",t.severity=t.severity||"Low",t.location=t.location||"unknown",t)),s)}catch(e){return console.error("Parse error:",e),{findings:[],summary:"Failed to parse analysis results."}}}function x(n){let e=require("crypto"),s=n.location?.match(/:(\d+)$/),t=s?s[1]:"0",i=`${n.type}:${n.location}:${t}:${n.severity}`;return e.createHash("sha256").update(i).digest("hex").substring(0,12)}0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
