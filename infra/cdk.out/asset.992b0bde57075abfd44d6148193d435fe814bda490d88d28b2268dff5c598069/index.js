"use strict";var l=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var x=Object.getOwnPropertyNames;var b=Object.prototype.hasOwnProperty;var w=(t,e)=>{for(var n in e)l(t,n,{get:e[n],enumerable:!0})},N=(t,e,n,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of x(e))!b.call(t,o)&&o!==n&&l(t,o,{get:()=>e[o],enumerable:!(r=m(e,o))||r.enumerable});return t};var S=t=>N(l({},"__esModule",{value:!0}),t);var k={};w(k,{handler:()=>v});module.exports=S(k);var a=require("@aws-sdk/client-bedrock-runtime"),O=new a.BedrockRuntimeClient({region:"us-east-1"}),p="anthropic.claude-3-sonnet-20240229-v1:0",v=async t=>{console.log("Received scan request:",t.body);try{if(!t.body)return{statusCode:400,body:JSON.stringify({error:"No body provided"})};let{owner:e,repo:n,token:r}=JSON.parse(t.body);if(!e||!n||!r)return{statusCode:400,body:JSON.stringify({error:"Missing required fields: owner, repo, token"})};let s=(await C(r,e,n)).filter(d=>/\.(js|ts|tsx|jsx|py|go|rs|java|sol)$/.test(d.path)),i=await Promise.all(s.slice(0,10).map(d=>I(r,e,n,d.path))),y={anthropic_version:"bedrock-2023-05-31",max_tokens:4e3,messages:[{role:"user",content:[{type:"text",text:$(i)}]}]},u=new a.InvokeModelCommand({contentType:"application/json",body:JSON.stringify(y),modelId:p});console.log("Invoking Bedrock model:",p);let g=await O.send(u),f=JSON.parse(new TextDecoder().decode(g.body)).content[0].text,h=j(f);return{statusCode:200,body:JSON.stringify(h),headers:{"Content-Type":"application/json"}}}catch(e){return console.error("Lambda Scan Failed:",e),{statusCode:500,body:JSON.stringify({error:e.message||"Internal Server Error"})}}};async function C(t,e,n,r=""){let o=await fetch(`https://api.github.com/repos/${e}/${n}/contents/${r}`,{headers:{Authorization:`Bearer ${t}`}});if(!o.ok)throw new Error(`GitHub Fetch Failed: ${o.statusText}`);let s=await o.json(),i=[];if(Array.isArray(s))for(let c of s)c.type==="file"&&i.push(c);return i}async function I(t,e,n,r){let s=await(await fetch(`https://api.github.com/repos/${e}/${n}/contents/${r}`,{headers:{Authorization:`Bearer ${t}`}})).json(),i=Buffer.from(s.content,"base64").toString("utf-8");return{path:r,content:i}}function $(t){let e="";for(let n of t)e+=`
--- FILE: ${n.path} ---
${n.content}
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
    `}function j(t){try{let e=t.replace(/```json/g,"").replace(/```/g,"").trim();return JSON.parse(e)}catch(e){return console.error("Parse error:",e),{findings:[],summary:"Failed to parse analysis results."}}}0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
