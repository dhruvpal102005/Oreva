"use strict";var y=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var T=Object.prototype.hasOwnProperty;var C=(i,e)=>{for(var t in e)y(i,t,{get:e[t],enumerable:!0})},v=(i,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of k(e))!T.call(i,n)&&n!==t&&y(i,n,{get:()=>e[n],enumerable:!(s=A(e,n))||s.enumerable});return i};var R=i=>v(y({},"__esModule",{value:!0}),i);var F={};C(F,{handler:()=>E});module.exports=R(F);var E=async i=>{console.log("Received scan request");try{if(!i.body)return{statusCode:400,body:JSON.stringify({error:"No body provided"})};let{owner:e,repo:t,token:s,apiKey:n}=JSON.parse(i.body);if(!e||!t||!s||!n)return{statusCode:400,body:JSON.stringify({error:"Missing required fields: owner, repo, token, apiKey (for Gemini)"})};let c=(await b(s,e,t)).filter(r=>/\.(js|ts|tsx|jsx|py|go|rs|java|sol)$/.test(r.path));console.log(`Found ${c.length} code files. Fetching content...`);let o=await Promise.all(c.slice(0,25).map(r=>P(s,e,t,r.path))),m=O(o);console.log("Invoking Google Gemini with deterministic settings...");let d=3,g=2e3,f=null,a=null;for(let r=0;r<=d;r++)try{if(a=await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${n}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:m}]}],generationConfig:{temperature:0,topK:1,topP:.1,candidateCount:1,maxOutputTokens:8192}})}),a.ok){console.log(`\u2705 Gemini API call succeeded on attempt ${r+1}`);break}let u=await a.clone().json().catch(()=>({}));if(!(a.status===503||a.status===429||a.status===500)||r===d)break;let p=g*Math.pow(2,r);console.warn(`\u26A0\uFE0F Gemini API returned ${a.status}. Retrying in ${p}ms... (Attempt ${r+1}/${d})`),await new Promise(w=>setTimeout(w,p))}catch(u){if(f=u,console.error(`\u274C Gemini API call failed on attempt ${r+1}:`,u),r===d)throw u;let h=g*Math.pow(2,r);console.warn(`Retrying in ${h}ms...`),await new Promise(p=>setTimeout(p,h))}if(!a||!a.ok){let r=await a.text();throw console.error("Gemini API error:",r),new Error(`Gemini API error: ${a.status} - ${r}`)}let S=(await a.json()).candidates[0].content.parts[0].text,I=L(S);return{statusCode:200,body:JSON.stringify(I),headers:{"Content-Type":"application/json"}}}catch(e){return console.error("Lambda Scan Failed:",e),{statusCode:500,body:JSON.stringify({error:e.message||"Internal Server Error"})}}};async function b(i,e,t,s=""){console.log(`Fetching files from: https://api.github.com/repos/${e}/${t}/contents/${s}`);let n=await fetch(`https://api.github.com/repos/${e}/${t}/contents/${s}`,{headers:{Authorization:`Bearer ${i}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!n.ok){let o=await n.text();throw console.error(`GitHub Fetch Failed (${n.status}):`,o),new Error(`GitHub Fetch Failed: ${n.statusText} (${n.status}) - ${o}`)}let l=await n.json(),c=[];if(Array.isArray(l))for(let o of l)o.type==="file"&&c.push(o);return c}async function P(i,e,t,s){let n=await fetch(`https://api.github.com/repos/${e}/${t}/contents/${s}`,{headers:{Authorization:`Bearer ${i}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!n.ok){let o=await n.text();throw console.error(`GitHub Content Fetch Failed (${n.status}):`,o),new Error(`GitHub Content Fetch Failed: ${n.statusText}`)}let l=await n.json(),c=Buffer.from(l.content,"base64").toString("utf-8");return{path:s,content:c}}function O(i){let e="";for(let t of i)e+=`
--- FILE: ${t.path} ---
${t.content}
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
`}function L(i){try{let e=i.replace(/```json/g,"").replace(/```/g,"").trim(),t=JSON.parse(e);return!t.findings||!Array.isArray(t.findings)?(console.warn("Invalid findings structure, returning empty array"),{findings:[],summary:"Failed to parse analysis results."}):(t.findings=t.findings.map((s,n)=>(s.id||(s.id=x(s)),s.type=s.type||"Unknown",s.severity=s.severity||"Low",s.location=s.location||"unknown",s)),t)}catch(e){return console.error("Parse error:",e),{findings:[],summary:"Failed to parse analysis results."}}}function x(i){let e=require("crypto"),t=i.location?.match(/:(\d+)$/),s=t?t[1]:"0",n=`${i.type}:${i.location}:${s}:${i.severity}`;return e.createHash("sha256").update(n).digest("hex").substring(0,12)}0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
