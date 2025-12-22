"use strict";var u=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var y=Object.getOwnPropertyNames;var f=Object.prototype.hasOwnProperty;var g=(r,e)=>{for(var t in e)u(r,t,{get:e[t],enumerable:!0})},C=(r,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of y(e))!f.call(r,s)&&s!==t&&u(r,s,{get:()=>e[s],enumerable:!(n=m(e,s))||n.enumerable});return r};var b=r=>C(u({},"__esModule",{value:!0}),r);var A={};g(A,{handler:()=>w});module.exports=b(A);var w=async r=>{console.log("Received scan request");try{if(!r.body)return{statusCode:400,body:JSON.stringify({error:"No body provided"})};let{owner:e,repo:t,token:n,apiKey:s}=JSON.parse(r.body);if(!e||!t||!n||!s)return{statusCode:400,body:JSON.stringify({error:"Missing required fields: owner, repo, token, apiKey (for Gemini)"})};let o=(await S(n,e,t)).filter(a=>/\.(js|ts|tsx|jsx|py|go|rs|java|sol)$/.test(a.path));console.log(`Found ${o.length} code files. Fetching content...`);let i=await Promise.all(o.slice(0,10).map(a=>I(n,e,t,a.path))),d=v(i);console.log("Invoking Google Gemini with deterministic settings...");let l=await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${s}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:d}]}],generationConfig:{temperature:0,topK:1,topP:.1,candidateCount:1,maxOutputTokens:8192}})});if(!l.ok){let a=await l.text();throw console.error("Gemini API error:",a),new Error(`Gemini API error: ${l.status} - ${a}`)}let p=(await l.json()).candidates[0].content.parts[0].text,h=x(p);return{statusCode:200,body:JSON.stringify(h),headers:{"Content-Type":"application/json"}}}catch(e){return console.error("Lambda Scan Failed:",e),{statusCode:500,body:JSON.stringify({error:e.message||"Internal Server Error"})}}};async function S(r,e,t,n=""){console.log(`Fetching files from: https://api.github.com/repos/${e}/${t}/contents/${n}`);let s=await fetch(`https://api.github.com/repos/${e}/${t}/contents/${n}`,{headers:{Authorization:`Bearer ${r}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!s.ok){let i=await s.text();throw console.error(`GitHub Fetch Failed (${s.status}):`,i),new Error(`GitHub Fetch Failed: ${s.statusText} (${s.status}) - ${i}`)}let c=await s.json(),o=[];if(Array.isArray(c))for(let i of c)i.type==="file"&&o.push(i);return o}async function I(r,e,t,n){let s=await fetch(`https://api.github.com/repos/${e}/${t}/contents/${n}`,{headers:{Authorization:`Bearer ${r}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!s.ok){let i=await s.text();throw console.error(`GitHub Content Fetch Failed (${s.status}):`,i),new Error(`GitHub Content Fetch Failed: ${s.statusText}`)}let c=await s.json(),o=Buffer.from(c.content,"base64").toString("utf-8");return{path:n,content:o}}function v(r){let e="";for(let t of r)e+=`
--- FILE: ${t.path} ---
${t.content}
`;return`You are a deterministic security scanner. Analyze the following code for ONLY these specific vulnerability types:

VULNERABILITY CATEGORIES (ONLY report these):
1. SQL Injection (CWE-89) - Unsanitized database queries
2. Cross-Site Scripting (CWE-79) - Unescaped user input in HTML/JS
3. Path Traversal (CWE-22) - File path manipulation
4. Command Injection (CWE-78) - Unsanitized shell commands
5. Hardcoded Secrets (CWE-798) - API keys, passwords in code
6. Insecure Deserialization (CWE-502) - Unsafe object deserialization
7. Authentication Bypass (CWE-287) - Missing or weak auth checks
8. Authorization Issues (CWE-285) - Improper access control
9. Cryptographic Failures (CWE-327) - Weak crypto or insecure random
10. Dependency Vulnerabilities - Known CVEs in packages

Code Context:
${e}

ANALYSIS RULES:
- ONLY report vulnerabilities with CONCRETE evidence in the code
- Include EXACT line numbers where the issue occurs
- Do NOT report theoretical issues or best practices
- Do NOT report the same issue multiple times
- Be CONSISTENT - same code should produce same findings
- Focus on HIGH and CRITICAL severity issues first

Output Format: Valid JSON object with this EXACT structure:
{
  "findings": [
    {
      "id": "unique-hash",
      "type": "SQL Injection | XSS | Path Traversal | Command Injection | Hardcoded Secret | Insecure Deserialization | Auth Bypass | Authorization Issue | Crypto Failure | Dependency Vulnerability",
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

CRITICAL: 
- Return ONLY valid JSON (no markdown, no code blocks, no explanations)
- Include line numbers in location field (format: "path/file.ts:42")
- Generate deterministic IDs based on file+line+type
- For dependency issues, include actual CVE numbers from public databases
- Be CONSISTENT across multiple scans of the same code
`}function x(r){try{let e=r.replace(/```json/g,"").replace(/```/g,"").trim(),t=JSON.parse(e);return!t.findings||!Array.isArray(t.findings)?(console.warn("Invalid findings structure, returning empty array"),{findings:[],summary:"Failed to parse analysis results."}):(t.findings=t.findings.map((n,s)=>(n.id||(n.id=$(n)),n.type=n.type||"Unknown",n.severity=n.severity||"Low",n.location=n.location||"unknown",n)),t)}catch(e){return console.error("Parse error:",e),{findings:[],summary:"Failed to parse analysis results."}}}function $(r){let e=require("crypto"),t=r.location?.match(/:(\d+)$/),n=t?t[1]:"0",s=`${r.type}:${r.location}:${n}:${r.severity}`;return e.createHash("sha256").update(s).digest("hex").substring(0,12)}0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
