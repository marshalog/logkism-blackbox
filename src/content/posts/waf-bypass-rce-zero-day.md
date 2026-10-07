---
title: "Zero-Day Writeup: WAF Bypass & RCE via Insecure Deserialization on Admin System"
date: 2026-10-06
category: "REVERSE-ENG"
readTime: "22 MIN READ"
classification: "RESTRICTED"
tags: ["BUG-BOUNTY", "RCE", "WAF-BYPASS", "DESERIALIZATION", "PENTEST"]
summary: "Detailed report on discovering and exploiting a zero-day vulnerability chain, from bypassing the Web Application Firewall to achieving Remote Code Execution (RCE) on the core system."
---

## 01 // OVERVIEW
The vulnerability was discovered on an internal corporate financial management platform. Due to insecure authorization configurations and an outdated JSON parsing library, an attacker could bypass the entire WAF and send a malicious payload to execute commands directly on the server (RCE).

## 02 // TECHNICAL DETAILS
The system used an outdated version of **Jackson-databind** and an Nginx reverse proxy that blocked sensitive characters. However, by leveraging **Chunked Transfer Encoding** and **Unicode Evasion** techniques, the payload successfully slipped past the WAF.
Once reaching the backend, the REST API endpoint `/api/v2/reports/generate` received a JSON payload containing an unvalidated `polymorphic` property.

## 03 // EXPLOITATION
The exploitation was carried out in 3 phases:
1. Sent an HTTP request with Chunked Encoding to bypass ModSecurity.
2. Injected the \`java.net.URLClassLoader\` class into the data field.
3. Waited for the backend server to execute the payload and return a Reverse Shell.

## 04 // IMPACT
An attacker could gain full control over the server system, steal customer databases, and escalate privileges within the internal network.

## 05 // REMEDIATION
We recommended the corporate security team to apply the following patches immediately:
- Stop using Java serialization and switch to JSON (Jackson/Gson) with a secure data type checking mechanism.
- Reconfigure the Nginx Ingress Controller to completely drop direct connections to the \`/internal/*\` endpoint.
- Update WAF rules to defend against evasion techniques such as Chunked Encoding Abuse.
