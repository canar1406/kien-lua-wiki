<p align="center">
  <img src="static/img/logo.png" alt="Kiến Lửa Wiki Logo" width="120" />
</p>

<h1 align="center">🔥 Kiến Lửa Wiki — Bách Khoa Toàn Thư Vi Phẫu</h1>

<p align="center">
  <em>Trang bách khoa toàn thư chuyên sâu về hệ sinh thái loài Kiến lửa đỏ (<i>Solenopsis geminata</i>)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docusaurus-3.9.2-green?style=flat-square&logo=docusaurus" alt="Docusaurus" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-r170-black?style=flat-square&logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/3D_Viewer-model--viewer-orange?style=flat-square" alt="Model Viewer" />
  <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions" alt="CI/CD" />
  <img src="https://img.shields.io/badge/License-Educational-yellow?style=flat-square" alt="License" />
</p>

---

## 📖 Giới thiệu

**Kiến Lửa Wiki** là dự án Sinh học dưới hình thức website bách khoa toàn thư, cung cấp kiến thức toàn diện về loài kiến lửa đỏ (*Solenopsis geminata*) — một loài côn trùng xâm lấn nguy hiểm tại Việt Nam và trên toàn cầu. Dự án kết hợp nội dung nghiên cứu chuyên sâu với công nghệ hiển thị 3D tương tác và mô phỏng AI hành vi đàn kiến theo thời gian thực.

### ✨ Điểm nổi bật

- 🐜 **Mô hình 3D tương tác** — Xoay, phóng to, khám phá giải phẫu kiến lửa với hotspot thông tin cho từng bộ phận
- 🤖 **Mô phỏng AI đàn kiến** — Phòng thí nghiệm WebGL với 2 cá thể kiến được điều khiển bởi State Machine, có khả năng tự tuần tra, gọi bầy, giao tiếp hóa học, uống nước, né vật cản
- 📚 **16 chương nội dung chuyên sâu** — Từ phân loại học, hình thái, vòng đời đến nọc độc và phòng ngừa
- 🎨 **Giao diện hiện đại** — Dark/Light mode, hiệu ứng glassmorphism, micro-animation, responsive mobile-first
- 📊 **Biểu đồ tương tác** — Chart.js hiển thị dữ liệu sinh sản và phát triển đàn kiến
- 🧮 **Hỗ trợ KaTeX** — Hiển thị công thức toán/hóa học trong nội dung

---

## 🛠️ Công nghệ sử dụng

### Nền Tảng & Framework

| Stack | Chi tiết | Vai trò |
|-------|----------|---------|
| **Framework** | [Docusaurus 3.9.2](https://docusaurus.io/) | SSG Framework, quản lý nội dung MDX, routing, sidebar |
| **Frontend** | React 19, MDX | Component-based UI, nội dung Markdown mở rộng |
| **Styling** | Tailwind CSS 4 | Utility-first CSS, responsive design, dark mode |
| **Custom CSS** | Phycat Abyss / Sky themes | 2 bộ giao diện tuỳ chỉnh (tối/sáng) với CSS variables |
| **Deploy** | GitHub Pages + GitHub Actions CI/CD | Tự động build & deploy khi push lên `main` |

### Hệ Thống 3D

| Stack | Chi tiết | Vai trò |
|-------|----------|---------|
| **Three.js** | [three](https://threejs.org/) | Lõi rendering WebGL, xử lý vector, quaternion, matrix |
| **React Three Fiber** | [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | React renderer cho Three.js, hooks (`useFrame`, `useLoader`) |
| **Drei** | [@react-three/drei](https://github.com/pmndrs/drei) | Helpers: `OrbitControls`, `ContactShadows`, `Html`, `Sparkles` |
| **three-stdlib** | `SkeletonUtils` | Deep clone skeleton để tạo nhiều instance kiến độc lập |
| **Model Viewer** | [@google/model-viewer](https://modelviewer.dev/) | Hiển thị mô hình 3D tĩnh với hotspot tương tác (Ant Viewer) |

### Dữ Liệu & Trực Quan Hoá

| Stack | Chi tiết | Vai trò |
|-------|----------|---------|
| **Chart.js** | chart.js + react-chartjs-2 | Biểu đồ tăng trưởng đàn kiến tương tác |
| **KaTeX** | remark-math + rehype-katex | Hiển thị công thức toán/hóa học inline |

---

## 🌐 Tổng Quan Trang Web

Website gồm 3 khu vực chính:

### 🏠 Trang Chủ (`/`)
Giao diện landing page hiện đại với 5 section:

| Section | Mô tả |
|---------|-------|
| **Hero Section** | Banner gradient với hình ảnh kiến lửa, CTA buttons, hiệu ứng parallax blur |
| **Giải Phẫu Thể Cấu Trúc** | 4 thẻ thông tin (Đầu, Mạng Phân Tán, Túi Lọc, Vỏ Kitin) — click dẫn tới bài viết tương ứng |
| **Mô Hình 3D Tương Tác** | Embedded `AntViewer` component + nút chuyển sang Mô phỏng 3D |
| **Các Trang Cốt Lõi** | 4 bài viết nổi bật với link trực tiếp, hover animation |
| **Biểu Đồ Sinh Sản** | Chart.js Line chart hiển thị tốc độ tăng trưởng đàn kiến (250,000+ cá thể/năm) |

### 📚 Bách Khoa Toàn Thư (`/docs/...`)
16 chương nội dung MDX chuyên sâu:

| # | Chương | Chủ đề |
|---|--------|--------|
| 01 | Nguồn gốc & Lịch sử | Lịch sử phát hiện, hành trình lan rộng toàn cầu |
| 02 | Hệ thống phân loại | Phân loại học, danh pháp, taxonomy |
| 03 | Đặc điểm hình thái | Giải phẫu chi tiết, cấu tạo cơ thể |
| 04 | Vòng đời & Tuổi thọ | Các giai đoạn phát triển từ trứng đến trưởng thành |
| 05 | Giai cấp xã hội | Kiến chúa, kiến thợ, kiến đực — phân công lao động |
| 06 | Mô hình tổ chức | Cấu trúc xã hội, giao tiếp pheromone |
| 07 | Kiến trúc tổ ngầm | Cấu trúc tổ dưới lòng đất |
| 08 | Vật lý kết bè | Hiện tượng kết bè nổi trên nước |
| 09 | Cạnh tranh sinh thái VN | Tương tác với các loài bản địa |
| 10 | Phân bố toàn cầu | Bản đồ phân bố, vùng xâm lấn |
| 11 | Tác động kinh tế–môi trường | Thiệt hại nông nghiệp, hệ sinh thái |
| 12 | Nọc độc & Triệu chứng | Solenopsin, cơ chế gây đau |
| 13 | Sốc phản vệ & Sơ cứu | Xử lý y tế khi bị chích |
| 14 | Kiểm soát hóa học | Thuốc diệt, mồi độc |
| 15 | Kiểm soát sinh học | Thiên địch, nấm ký sinh |
| 16 | Phòng ngừa hộ gia đình | Biện pháp phòng tránh thực tế |

### 🧪 Phòng Mô Phỏng 3D (`/ant-simulation`)
Trang mô phỏng AI đàn kiến toàn màn hình (xem chi tiết bên dưới).

---

## 🐜 Hệ Thống 3D Đa Trải Nghiệm

Dự án cung cấp **2 chế độ hiển thị 3D** tương tác tiên tiến, mỗi chế độ phục vụ mục đích giáo dục khác nhau:

### 1. 🔬 Mô Hình 3D Tương Tác — Ant Viewer (Trang Chủ)

Component `AntViewer` sử dụng `@google/model-viewer` để hiển thị mô hình kiến lửa GLTF đơn lẻ với khả năng tương tác phong phú:

| Tính năng | Chi tiết |
|-----------|----------|
| **Hotspot đa điểm** | 6 nhóm bộ phận × 13 điểm tương tác: Đầu, Mắt kép, Râu (Antennae), Ngực (Mesosoma), 6 Chân, Bụng (Gaster) |
| **Hoạt ảnh** | 4 chế độ chuyển đổi mượt: Đứng yên (freeze), Đứng nghỉ (idle), Đi bộ (walk), Cảnh giác (alert) |
| **Điều khiển camera** | D-pad xoay 4 hướng (Lên/Xuống/Trái/Phải) + nút Reset về góc nhìn mặc định |
| **Panel thông tin** | Mô tả chi tiết từng bộ phận khi click hotspot, kèm liên kết đọc thêm trong docs |
| **Responsive** | Tự co giãn theo kích thước màn hình, tối ưu cho cả desktop và mobile |

### 2. 🤖 Mô Phỏng Đàn Kiến AI — Ant Simulation (Trang riêng)

Môi trường giả lập WebGL toàn màn hình với **20 cá thể kiến AI** được điều khiển bởi **Finite State Machine (FSM)**, chạy trên React Three Fiber ở tốc độ 60 FPS.

#### 🗺️ Thế Giới Mô Phỏng

| Thành phần | Mô tả |
|------------|-------|
| **Mặt đất** | Bãi cỏ 200×200 đơn vị với texture lặp, bao quanh bởi biên giới ±85 |
| **Tổ kiến** | Đĩa đỏ phát sáng tại góc (-70, -70), điểm giao hàng thức ăn |
| **Hồ nước** | Hình cầu xanh cyan tại (60, 40) bán kính 20, nơi kiến đến uống nước |
| **Tảng đá** | 3 khối đá xám đặt rải rác, tạo chướng ngại vật vật lý cho kiến |
| **Cây cối** | Nhiều cây trang trí với tán lá hình cầu xanh lá |
| **Khúc gỗ** | Khối gỗ nâu trang trí |
| **Hiệu ứng** | ContactShadows, Sparkles (đom đóm), ánh sáng đa nguồn |

#### 🧠 Cỗ Máy Trạng Thái AI (State Machine)

Mỗi con kiến hoạt động dựa trên FSM với các trạng thái sau:

| Trạng thái | Hành vi | Điều kiện chuyển |
|-----------|---------|-----------------|
| `wandering` | Đi tuần tra ngẫu nhiên, đổi hướng mỗi 2-4 giây | Phát hiện đồ ăn / Nhận lệnh giao tiếp / Hẹn giờ uống nước |
| `seek_peer` | Kiến A tìm kiến B để bắt đầu giao tiếp | Khi 2 con đủ gần (< 4 đơn vị) |
| `communicating` | Hai con chạm râu (antennation), kiểm tra mã hydrocarbon | Hết thời gian 5 giây |
| `food_finder_approach` | Kiến phát hiện đường → tiến đến gần | Đến nơi → gọi bầy |
| `food_trophallaxis` | Mớm mồi (trophallaxis) — truyền thông tin chất lượng | Hoàn tất → tuyển dụng |
| `food_recruit_return` | Kiến tuyển dụng quay về tìm đồng đội | Gặp đồng đội |
| `food_both_approach` | Cả 2 con cùng tiến đến viên đường | Nhặt được đường |
| `food_carry` | Kéo đường về tổ theo đội hình (kéo trước - đẩy sau) | Đến tổ → giao hàng |
| `alarmed` | Chạy hoảng loạn theo mọi hướng với tốc độ 1.5x | Hết 5 giây |
| `drink_water` | Di chuyển tới hồ nước → cúi đầu uống 5 giây | Tự động mỗi 2.5 phút hoặc ép thủ công |

#### 🎮 Bảng Điều Khiển Sinh Học (6 nút)

| Nút | Loại | Chức năng (Đã đồng bộ Dark Mode) |
|-----|------|--------------------------------|
| 🤚 **Kéo Cam** | Môi Trường | Kéo chuột để di chuyển (pan/strafe) bản đồ |
| 🔄 **Xoay/Nghiêng** | Môi Trường | Kéo chuột để xoay và nghiêng camera quanh tâm tổ |
| 🍬 **Thả Đường** | Tương tác | Sinh ra một khối đường năng lượng cao, rủ rê kiến bu lại thành cụm |
| ⚠️ **Báo Động** | Tương tác | Kích hoạt hiệu ứng Pheromone tự vệ, kiến vươn bụng lao về phía kẻ thù |
| 💧 **Uống Nước** | Hệ sinh thái | Cung cấp giọt nước lọc để giải quyết cơn khát (ngăn kiến chết khô) |
| 🌧️ **Đổ Mưa** | Đại thảm họa | Màn hình tối đen, nước diệt toàn bộ Pheromone, kiến cuộn lại thành "bè nổi" chống ngập! |

> **Ghi chú UX:** Nút `📖 i` ở góc Bảng điều khiển dẫn thẳng đến [Sổ Tay Hướng Dẫn Tương Tác 3D](/docs/huong-dan-mo-phong) hoàn chỉnh để người dùng hiểu quy luật sinh tồn. Mọi bảng biểu đều tích hợp hiệu ứng Glassmorphism và **đồng độ mã màu hoàn toàn với giao diện Đen/Trắng của Docusaurus**. Bảng biểu tự động thu gọn dạng Accordion (Dropdown) trên Mobile.

#### 🦿 Bảng Dữ Liệu & Theo Dõi (Dual Dashboard)

Hệ thống UI được chia thành hai mảng lớn để phục vụ Macro (Đại cục) và Micro (Cá thể):

**1. Swarm Dashboard (Bảng Thống Kê Bầy Đàn)**
*   Hiển thị theo thời gian thực tỷ lệ: _Kiến Tướng / Kiến Thợ / Kiến Đang Tuần Tra / Kiến Nhả Mùi / Kiến Chờ Hỗ Trợ / Kiến Đang Kéo Mồi_.
*   Có thanh HP/Sinh tử: Theo dõi số lượng kiến gục ngã (Quy tiên) và cơ chế "An Táng Đồng Loại".
*   Ghi nhận số lượng Trophallaxis (Viên đường) được vận chuyển về Tổ để kích hoạt quy trình sinh đẻ kiến thợ mới.

#### 📐 Hệ Thống Ánh Xạ Sức Chứa Tự Nhiên (Spatial Scaling)

Tính năng khoa học sinh thái học tích hợp trong Swarm Dashboard, áp dụng phương pháp **Quadrat Sampling** để nội suy từ dữ liệu vi mô (mô phỏng 3D) ra quy mô vĩ mô (lãnh thổ thực tế).

**Công thức ánh xạ:**

$$K_{real} = K_{sim} \times \text{SCALE\_FACTOR} \quad (\text{SCALE\_FACTOR} = \frac{50\,m^2}{0.1\,m^2} = 500)$$

**Sức chứa lý thuyết tối đa** dựa trên **Định luật Liebig (Liebig's Law of the Minimum, 1840)**:

$$K_{max} = \min(K_{food},\ K_{water},\ K_{space}) \times (1 - P_{predation})$$

| Biến | Công thức | Cơ sở |
|------|-----------|-------|
| $K_{food}$ | `foodRate × 15` | Tỷ lệ tiêu thụ thức ăn của kiến lửa |
| $K_{water}$ | `waterRate × 20` | Khả năng nhịn khát cao hơn nhịn đói |
| $K_{space}$ | `60` | Giới hạn mật độ không gian vật lý |
| $P_{predation}$ | `min(0.8, enemyRate × 0.08)` | Áp lực săn mồi phi tuyến (0–80%) |

> **Cơ sở thực địa:** *S. geminata* có mật độ 10–80 tổ/acre ở môi trường tự nhiên, lãnh thổ kiếm ăn ~50 m²/tổ. Các tổ *S. invicta* trưởng thành chứa 100,000–250,000 cá thể *(Tschinkel, 1988)*.

**2. Focus Panel (Dò Vi Sinh Khuê Đại)**
*   **Kích hoạt:** Bằng cách nhấp trực tiếp vào 1 cá thể kiến lửa bất kỳ đang đi dạo trên màn hình 3D.
*   **State Machine FSM Dump:** Hiển thị trực tiếp mã trạng thái thực thi hiện tại (Bù khoáng ngẫu nhiên, Nhả mùi, Cắn xé).
*   **Deep Linking:** Cung cấp thông tin sinh học sơ cấp và nút "ĐỌC CHI TIẾT" liên kết Docusaurus Single-Page-App trỏ thẳng đến **Mục/Heading Neo (Anchor)** trong Bách khoa toàn thư giải thích lý do đằng sau hành động đó!
*   **Tracking Mode:** Theo dõi góc nhìn thứ 3 gắn cứng theo sau đuôi chú kiến được chọn nhầm trải nghiệm cảm giác FPV.

#### 🤔 Bí kíp & Thử Thách Kỹ Thuật (Nhật Ký Dev)
Hơn **11 Bài Học Cốt Lõi** được ghi chép cẩn thận dưới dạng Nhật ký kinh nghiệm trong tệp `kinh_nghiem.md` đính kèm ở gốc dự án. Điển hình:
*   Ma trận Basis Calibration tự động xoay lật Model WebGL 3D khi import.
*   Giải quyết vòng lặp Vô Tận (Infinite render loop) giữa State của React và `useFrame` 60 FPS.
*   Nghệ thuật Dynamic Retargeting: Gỡ lỗi "Kiến Lú Lẫn Mục Tiêu" trong AI.
*   Giải quyết mâu thuẫn giữa Phóng to Model 1000 lần bằng Skeleton Utils so với Object3D thông thường.

---

## 🚀 Bắt đầu

### Yêu cầu hệ thống

- **Node.js** ≥ 20.0
- **npm** (đi kèm Node.js)

### Cài đặt

```bash
# Clone repository
git clone https://github.com/canar1406/kien-lua-wiki.git
cd kien-lua-wiki

# Cài đặt dependencies
npm install --legacy-peer-deps
```

### Phát triển

```bash
# Khởi chạy server phát triển (hot-reload)
npm run start
```

Server sẽ chạy tại `http://localhost:3000/kien-lua-wiki/`

### Build production

```bash
# Tạo bản build tĩnh
npm run build

# Xem trước bản build
npm run serve
```

### Deploy lên GitHub Pages

Dự án sử dụng GitHub Actions CI/CD. Mỗi lần push lên nhánh `main`, workflow tự động:
1. Checkout mã nguồn
2. Cài đặt dependencies (`npm ci --legacy-peer-deps`)
3. Build website (`npm run build`)
4. Deploy lên GitHub Pages

---

## 📁 Cấu trúc dự án

```
wiki/
├── docs/                              # Nội dung bách khoa (16 chương)
│   ├── 01-nguon-goc-va-lich-su.md
│   ├── ...
│   └── 16-phong-ngua-ho-gia-dinh.md
├── src/
│   ├── components/
│   │   ├── AntViewer/                 # 3D Viewer tĩnh (model-viewer + hotspots)
│   │   ├── AntSimulation/            # 🆕 Mô phỏng AI đàn kiến
│   │   │   ├── index.js              #   State Machine, vật lý, UI controls
│   │   │   └── AntModel.js           #   Skeleton clone, procedural animation, auto-calibration
│   │   └── HomepageFeatures/         # Component trang chủ
│   ├── css/
│   │   ├── custom.css                # CSS chính + responsive
│   │   ├── phycat-abyss.css          # Theme tối
│   │   └── phycat-sky.css            # Theme sáng
│   ├── pages/
│   │   ├── index.js                  # Trang chủ (Hero, Anatomy, 3D Viewer, Stats)
│   │   └── ant-simulation.js         # 🆕 Trang mô phỏng đàn kiến AI
│   └── theme/
│       └── MDXComponents.js          # Custom MDX (bảng responsive cuộn ngang)
├── static/
│   ├── img/                          # Hình ảnh, logo, hero banner
│   └── models/fire_ant/              # File 3D GLTF + textures mô hình kiến lửa
├── .github/workflows/deploy.yml      # CI/CD GitHub Actions
├── docusaurus.config.js              # Cấu hình Docusaurus
├── sidebars.js                       # Cấu trúc sidebar
├── kinh_nghiem.md                    # 🆕 Nhật ký kinh nghiệm phát triển (11 bài học)
└── package.json
```

---

## 🎨 Thiết Kế Giao Diện

| Đặc điểm | Chi tiết |
|-----------|----------|
| **Dual Theme** | Phycat Abyss (tối) / Phycat Sky (sáng) — chuyển đổi qua nút trên navbar |
| **Glassmorphism** | Backdrop blur + semi-transparent panels trên Hero Section và Control Panel |
| **Micro-animations** | Hover scale, translate-y, rotate, pulse, ping trên mọi thẻ tương tác |
| **Gradient Text** | Tiêu đề Hero dùng `bg-clip-text` gradient từ orange → rose |
| **Responsive** | Mobile-first: bảng điều khiển 3D chuyển xuống dưới, Info Panel thu gọn, bảng tự cuộn ngang |
| **Custom Selection** | Highlight text dùng màu hồng đặc trưng trên cả 2 theme |
| **SEO** | Meta tags, Open Graph image, semantic HTML, heading hierarchy |

---

## 👥 Đội ngũ dự án

| Thành viên | Vai trò |
|------------|---------|
| Nguyễn Quốc Gia Huy | Leader, Thuyết trình |
| Trương Minh Khoa | Nghiên cứu thực địa |
| Đặng Quang Minh | Soạn nội dung |
| Đặng Trần Diễm Phúc | Soạn nội dung |
| Võ Nguyễn Hoàng Long | Nghiên cứu thực địa, Developer |
| Thanh Ngọc | Xây dựng môi trường nuôi |
| Phan Lê Ánh Ngọc | Chăm sóc mẫu vật |
| Nguyễn Trọng Nhân | Chăm sóc mẫu vật |
| Uyên Phạm | Chăm sóc mẫu vật |
| Lê Viết Triết | Thuyết trình |

---

## 📄 Giấy phép

Dự án phục vụ mục đích giáo dục. © 2026 Dự án Sinh Học. Built with [Heavietnam](https://home.heavietnam.com/).
