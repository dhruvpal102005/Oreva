"use strict";var l=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var b=Object.getOwnPropertyNames;var x=Object.prototype.hasOwnProperty;var w=(t,e)=>{for(var r in e)l(t,r,{get:e[r],enumerable:!0})},v=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of b(e))!x.call(t,n)&&n!==r&&l(t,n,{get:()=>e[n],enumerable:!(o=m(e,n))||o.enumerable});return t};var $=t=>v(l({},"__esModule",{value:!0}),t);var j={};w(j,{handler:()=>O});module.exports=$(j);var c=require("@aws-sdk/client-bedrock-runtime"),S=new c.BedrockRuntimeClient({region:"us-east-1"}),p="anthropic.claude-3-sonnet-20240229-v1:0",O=async t=>{console.log("Received scan request:",t.body);try{if(!t.body)return{statusCode:400,body:JSON.stringify({error:"No body provided"})};let{owner:e,repo:r,token:o}=JSON.parse(t.body);if(!e||!r||!o)return{statusCode:400,body:JSON.stringify({error:"Missing required fields: owner, repo, token"})};let i=(await C(o,e,r)).filter(d=>/\.(js|ts|tsx|jsx|py|go|rs|java|sol)$/.test(d.path)),a=await Promise.all(i.slice(0,10).map(d=>F(o,e,r,d.path))),u={anthropic_version:"bedrock-2023-05-31",max_tokens:4e3,messages:[{role:"user",content:[{type:"text",text:N(a)}]}]},y=new c.InvokeModelCommand({contentType:"application/json",body:JSON.stringify(u),modelId:p});console.log("Invoking Bedrock model:",p);let g=await S.send(y),f=JSON.parse(new TextDecoder().decode(g.body)).content[0].text,h=A(f);return{statusCode:200,body:JSON.stringify(h),headers:{"Content-Type":"application/json"}}}catch(e){return console.error("Lambda Scan Failed:",e),{statusCode:500,body:JSON.stringify({error:e.message||"Internal Server Error"})}}};async function C(t,e,r,o=""){console.log(`Fetching files from: https://api.github.com/repos/${e}/${r}/contents/${o}`);let n=await fetch(`https://api.github.com/repos/${e}/${r}/contents/${o}`,{headers:{Authorization:`Bearer ${t}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!n.ok){let s=await n.text();throw console.error(`GitHub Fetch Failed (${n.status}):`,s),new Error(`GitHub Fetch Failed: ${n.statusText} (${n.status}) - ${s}`)}let i=await n.json(),a=[];if(Array.isArray(i))for(let s of i)s.type==="file"&&a.push(s);return a}async function F(t,e,r,o){let n=await fetch(`https://api.github.com/repos/${e}/${r}/contents/${o}`,{headers:{Authorization:`Bearer ${t}`,"User-Agent":"Oreva-Scanner-Lambda",Accept:"application/vnd.github.v3+json"}});if(!n.ok){let s=await n.text();throw console.error(`GitHub Content Fetch Failed (${n.status}):`,s),new Error(`GitHub Content Fetch Failed: ${n.statusText}`)}let i=await n.json(),a=Buffer.from(i.content,"base64").toString("utf-8");return{path:o,content:a}}function N(t){let e="";for(let r of t)e+=`
--- FILE: ${r.path} ---
${r.content}
`;return`
    You are an expert Cyber Security Analyst. Analyze the following code for security vulnerabilities.
    
    Code Context:
    ${e}

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
    `}function A(t){try{let e=t.replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(e)}catch(e){return console.error("Parse error:",e),{findings:[],summary:"Failed to parse analysis results."}}}0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
