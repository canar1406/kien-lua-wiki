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
  <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/3D_Viewer-model--viewer-orange?style=flat-square" alt="Model Viewer" />
  <img src="https://img.shields.io/badge/License-Educational-yellow?style=flat-square" alt="License" />
</p>

---

## 📖 Giới thiệu

**Kiến Lửa Wiki** là dự án Sinh học dưới hình thức website bách khoa toàn thư, cung cấp kiến thức toàn diện về loài kiến lửa đỏ (*Solenopsis geminata*) — một loài côn trùng xâm lấn nguy hiểm tại Việt Nam và trên toàn cầu.

### ✨ Điểm nổi bật

- 🐜 **Mô hình 3D tương tác** — Xoay, phóng to, khám phá giải phẫu kiến lửa với hotspot thông tin cho từng bộ phận
- 📚 **16 chương nội dung chuyên sâu** — Từ phân loại học, hình thái, vòng đời đến nọc độc và phòng ngừa
- 🎨 **Giao diện hiện đại** — Dark mode, hiệu ứng glassmorphism, micro-animation
- 📱 **Responsive** — Tối ưu trải nghiệm trên cả desktop và mobile
- 🧮 **Hỗ trợ KaTeX** — Hiển thị công thức toán/hóa học trong nội dung

---

## 🗂️ Cấu trúc nội dung

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

---

## 🛠️ Công nghệ

| Stack | Chi tiết |
|-------|----------|
| **Framework** | [Docusaurus 3.9.2](https://docusaurus.io/) |
| **Frontend** | React 19, MDX |
| **Styling** | Tailwind CSS 4, custom CSS themes (Phycat Abyss / Sky) |
| **3D Viewer** | [@google/model-viewer](https://modelviewer.dev/) |
| **Math** | KaTeX (remark-math + rehype-katex) |
| **Charts** | Chart.js + react-chartjs-2 |
| **Deploy** | GitHub Pages |

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
npm install
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

```bash
GIT_USER=<username> npm run deploy
```

---

## 📁 Cấu trúc dự án

```
wiki/
├── docs/                          # Nội dung bách khoa (16 chương + intro)
│   ├── 01-nguon-goc-va-lich-su.md
│   ├── 02-he-thong-phan-loai.md
│   ├── ...
│   └── 16-phong-ngua-ho-gia-dinh.md
├── src/
│   ├── components/
│   │   ├── AntViewer/             # Component 3D viewer tương tác
│   │   └── HomepageFeatures/      # Component trang chủ
│   ├── css/
│   │   ├── custom.css             # CSS chính + responsive
│   │   ├── phycat-abyss.css       # Theme tối
│   │   └── phycat-sky.css         # Theme sáng
│   ├── pages/
│   │   └── index.js               # Trang chủ
│   └── theme/
│       └── MDXComponents.js       # Custom MDX (bảng responsive)
├── static/
│   ├── img/                       # Hình ảnh, logo
│   └── model/                     # File 3D (.glb) mô hình kiến lửa
├── docusaurus.config.js           # Cấu hình Docusaurus
├── sidebars.js                    # Cấu trúc sidebar
└── package.json
```

---

## 🐜 Mô hình 3D tương tác

Component `AntViewer` cung cấp trải nghiệm khám phá giải phẫu kiến lửa:

- **Hotspot đa điểm** — 6 nhóm bộ phận với tổng 13 điểm tương tác (Đầu, Mắt, Râu, Ngực, Chân, Bụng)
- **Hoạt ảnh** — 4 chế độ: Đứng yên (freeze), Đứng nghỉ (idle), Đi bộ (walk), Cảnh giác (alert)
- **Điều khiển camera** — D-pad xoay 4 hướng + nút Reset
- **Panel thông tin** — Mô tả chi tiết từng bộ phận với liên kết đọc thêm

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

Dự án phục vụ mục đích giáo dục. © 2025 Dự án Sinh Học. Built with [Docusaurus](https://docusaurus.io/).
