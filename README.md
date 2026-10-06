# BLACKBOX // INTEL LOG (BLOG)
> **Declassified Cybersecurity Write-ups & Aerospace Telemetry Articles**

Trang blog chuyên dụng để công bố các tài liệu phân tích kỹ thuật, CTF write-ups, và nghiên cứu phần cứng không gian sâu:
- **Ngôn ngữ thiết kế đồng bộ**: Deep Crimson, Black, Bone White, giao diện hiển thị tài liệu mật (Top Secret / Restricted).
- **Bộ lọc chủ đề**: Phân loại theo Aerospace & RF, Reverse Engineering, Hậu lượng tử PQC, và CTF Write-ups.
- **Trang đọc bài viết tối ưu**: Hiển thị code terminal, trích xuất mã hex & mã assembly trực quan.
- **Chế độ Tu Tiên (修仙 Tàng Kinh Các)**: Đồng bộ trạng thái từ Portfolio, chuyển toàn bộ văn phong bài viết sang dạng mật lục bí tịch tu chân.
- **Cổng liên kết ngược về Mission Control**: Nút Warp Jump để trở lại trang Portfolio chính chủ.

---

## Cấu trúc thư mục
- `src/data/posts.ts`: Dữ liệu bài viết phân tích kỹ thuật chuyên sâu.
- `src/pages/index.astro`: Danh sách bài viết với bộ lọc động thời gian thực.
- `src/pages/posts/[slug].astro`: Trang đọc chi tiết từng bài viết.
- `site.config.mjs`: Cấu hình deploy và địa chỉ liên kết ngược về Portfolio.

---

## Hướng dẫn chạy và Deploy
```bash
# Cài đặt thư viện
npm install

# Chạy bản thử nghiệm local (Port 4322)
npm run dev

# Build sản phẩm hoàn chỉnh
npm run build
```

Để đưa lên GitHub:
```bash
git remote add origin https://github.com/<your-username>/logkism-blackbox.git
git push -u origin main
```
Workflow GitHub Actions (`.github/workflows/deploy.yml`) sẽ tự động triển khai lên GitHub Pages.
