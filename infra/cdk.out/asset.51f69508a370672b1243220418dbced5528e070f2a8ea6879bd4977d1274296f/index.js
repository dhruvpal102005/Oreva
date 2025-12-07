"use strict";var d=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var f=Object.prototype.hasOwnProperty;var m=(n,t)=>{for(var r in t)d(n,r,{get:t[r],enumerable:!0})},b=(n,t,r,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let e of h(t))!f.call(n,e)&&e!==r&&d(n,e,{get:()=>t[e],enumerable:!(o=y(t,e))||o.enumerable});return n};var x=n=>b(d({},"__esModule",{value:!0}),n);var C={};m(C,{handler:()=>w});module.exports=x(C);var w=async n=>{console.log("Received scan request");try{if(!n.body)return{statusCode:400,body:JSON.stringify({error:"No body provided"})};let{owner:t,repo:r,token:o,apiKey:e}=JSON.parse(n.body);if(!t||!r||!o||!e)return{statusCode:400,body:JSON.stringify({error:"Missing required fields: owner, repo, token, apiKey (for Gemini)"})};let i=(await $(o,t,r)).filter(a=>/\.(js|ts|tsx|jsx|py|go|rs|java|sol)$/.test(a.path));console.log(`Found ${i.length} code files. Fetching content...`);let s=await Promise.all(i.slice(0,10).map(a=>v(o,t,r,a.path))),g=F(s);console.log("Invoking Google Gemini...");let l=await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:g}]}]})});if(!l.ok){let a=await l.text();throw console.error("Gemini API error:",a),new Error(`Gemini API error: ${l.status} - ${a}`)}let p=(await l.json()).candidates[0].content.parts[0].text,u=S(p);return{statusCode:200,body:JSON.stringify(u),headers:{"Content-Type":"application/json"}}}catch(t){return console.error("Lambda Scan Failed:",t),{statusCode:500,body:JSON.stringify({error:t.message||"Internal Server Error"})}}};async function $(n,t,r,o=""){console.log(`Fetching files from: https://api.github.com/repos/${t}/${r}/contents/${o}`);let e=await fetch(`https://api.github.com/repos/${t}/${r}/contents/${o}`,{headers:{Authorization:`Bearer ${n}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!e.ok){let s=await e.text();throw console.error(`GitHub Fetch Failed (${e.status}):`,s),new Error(`GitHub Fetch Failed: ${e.statusText} (${e.status}) - ${s}`)}let c=await e.json(),i=[];if(Array.isArray(c))for(let s of c)s.type==="file"&&i.push(s);return i}async function v(n,t,r,o){let e=await fetch(`https://api.github.com/repos/${t}/${r}/contents/${o}`,{headers:{Authorization:`Bearer ${n}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!e.ok){let s=await e.text();throw console.error(`GitHub Content Fetch Failed (${e.status}):`,s),new Error(`GitHub Content Fetch Failed: ${e.statusText}`)}let c=await e.json(),i=Buffer.from(c.content,"base64").toString("utf-8");return{path:o,content:i}}function F(n){let t="";for(let r of n)t+=`
--- FILE: ${r.path} ---
${r.content}
`;return`
    You are an expert Cyber Security Analyst. Analyze the following code for security vulnerabilities.
    
    Code Context:
    ${t}

    Output Format: JSON object with "findings" (array) and "summary" (string).
    Each finding should have:
    - type: string (e.g., "SQL Injection", "XSS", "Dependency Vulnerability")
    - name: string (short title, max 50 characters)
    - severity: "Critical" | "High" | "Medium" | "Low"
    - location: string (file path)
    - description: string (ONE LINE ONLY, max 80 characters, concise explanation)
    - fix: string (brief fix suggestion, max 150 characters)
    - fixTime: string (estimated time, e.g., "30 min", "1 hr", "2 hr")
    - detailedAnalysis: string (optional, detailed explanation)
    - subIssues: array (optional, for dependencies) with {id, cve, severity, package, version, analysis}

    IMPORTANT: 
    - Keep descriptions very short and concise (one line, max 80 characters).
    - For dependency vulnerabilities (Next.js, React), include subIssues with CVE info.
    - Return ONLY valid JSON.
    `}function S(n){try{let t=n.replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(t)}catch(t){return console.error("Parse error:",t),{findings:[],summary:"Failed to parse analysis results."}}}0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
