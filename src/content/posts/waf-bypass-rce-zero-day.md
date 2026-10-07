---
title: "Zero-Day Writeup: Bypass WAF & RCE qua Insecure Deserialization trên Hệ Thống Quản Trị"
date: 2026-10-06
category: "REVERSE-ENG"
readTime: "22 MIN READ"
classification: "RESTRICTED"
tags: ["BUG-BOUNTY", "RCE", "WAF-BYPASS", "DESERIALIZATION", "PENTEST"]
summary: "Báo cáo chi tiết quá trình phát hiện và khai thác chuỗi lỗ hổng zero-day từ việc bypass Web Application Firewall đến thực thi mã từ xa (RCE) trên hệ thống lõi."
---

## 01 // OVERVIEW
Lỗ hổng được phát hiện trên một nền tảng quản trị tài chính doanh nghiệp nội bộ. Do cấu hình phân quyền không an toàn và thư viện parsing JSON lỗi thời, hacker có thể bypass toàn bộ WAF và gửi payload độc hại để thực thi lệnh trực tiếp trên server (RCE).

## 02 // TECHNICAL DETAILS
Hệ thống sử dụng **Jackson-databind** version cũ và một proxy ngược Nginx chặn các ký tự nhạy cảm. Tuy nhiên, bằng kỹ thuật **Chunked Transfer Encoding** và **Unicode Evasion**, payload đã lọt qua WAF.
Sau khi vào đến backend, endpoint API REST `/api/v2/reports/generate` tiếp nhận một JSON chứa thuộc tính `polymorphic` không được validate.

## 03 // EXPLOITATION
Khai thác qua 3 giai đoạn:
1. Gửi request HTTP với Chunked Encoding để bypass ModSecurity.
2. Inject class \`java.net.URLClassLoader\` vào trường dữ liệu.
3. Chờ máy chủ backend thực thi và trả về một Reverse Shell.

## 04 // IMPACT
Kẻ tấn công có thể kiểm soát hoàn toàn hệ thống máy chủ, đánh cắp cơ sở dữ liệu khách hàng và leo thang đặc quyền trong mạng nội bộ.

## 05 // REMEDIATION
Chúng tôi đã khuyến nghị đội ngũ bảo mật của tập đoàn áp dụng các bản vá ngay lập tức:
- Ngừng sử dụng serialization của Java, thay bằng JSON (Jackson/Gson) với cơ chế kiểm tra kiểu dữ liệu an toàn.
- Cấu hình lại Nginx Ingress Controller để drop triệt để các kết nối trực tiếp vào endpoint \`/internal/*\`.
- Cập nhật rule WAF để chống lại các kỹ thuật Evasion như Chunked Encoding Abuse.
