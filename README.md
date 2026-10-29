<p align="center">
  <img src="static/img/logo.png" alt="Kiến Lửa Wiki Logo" width="120" />
</p>

<h1 align="center">🔥 Kiến Lửa Wiki — Bách Khoa Toàn Thư Vi Phẫu & Mô Phỏng Siêu Sinh Vật 3D</h1>

<p align="center">
  <em>Bách khoa toàn thư chuyên sâu kết hợp Phòng thí nghiệm Mô phỏng 3D Đa Giai Cấp & Ngoại suy Toán Sinh thái 5 Tầng về loài Kiến lửa nhiệt đới (<i>Solenopsis geminata</i>)</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docusaurus-3.9.2-green?style=flat-square&logo=docusaurus" alt="Docusaurus" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-r170-black?style=flat-square&logo=threedotjs" alt="Three.js" />
  <img src="https://img.shields.io/badge/GPU_Skinning-DataTexture_Atlas-10b981?style=flat-square" alt="GPU Bone Atlas" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions" alt="CI/CD" />
  <img src="https://img.shields.io/badge/License-Educational-yellow?style=flat-square" alt="License" />
</p>

---

## 📖 Giới thiệu

**Kiến Lửa Wiki** là dự án Sinh học – Khoa học Máy tính dưới hình thức website bách khoa toàn thư tương tác, cung cấp kiến thức toàn diện về loài kiến lửa nhiệt đới (*Solenopsis geminata*) — một loài côn trùng xã hội xâm lấn nguy hiểm tại Việt Nam và trên toàn cầu. Dự án kết hợp **17 tài liệu bách khoa chuyên sâu** với **Phòng thí nghiệm Mô phỏng 3D thời gian thực (60 FPS GPU Hardware-Skinned)** và **Phòng Lab Ánh xạ & Ngoại suy Toán Sinh thái 5 Tầng**.

### ✨ Điểm nổi bật

- 🐜 **Mô hình Giải phẫu 3D Tương tác (`AntViewer`)** — Xoay 360°, phóng to, khám phá 13 hotspot giải phẫu vi phẫu kèm hoạt ảnh chuyển đổi mượt mà.
- 👑 **Mô phỏng Xã hội Đa Giai Cấp 4 Tầng (`AntSimulation`)** — Mô phỏng đồng thời **Kiến Chúa (`Queen`, 14.2 mg)**, **Kiến Tướng (`Major`, 4.0 mg)**, **Kiến Lính (`Soldier`, 2.2 mg)** và **Kiến Thợ (`Minor`, 1.0 mg)** với đầy đủ cơ chế sinh học:
  - **Nội tiết Hoàng gia QMP & Kế vị Kiến Chúa (Queen Succession — Fletcher & Blum, 1983)**: Kiến Chúa tiết pheromone QMP (`9-ODA`) ức chế buồng trứng kiến thợ và tăng tốc +22% cho toàn đàn. Khi Kiến Chúa tử vong (do Lốc xoáy hoặc Thiên địch), sự mất đi của QMP kích hoạt ngay quy trình **Ấp Tân Chúa Kế Vị Khẩn Cấp (`Emergency Queen Rearing`)** từ ấu trùng lưỡng bội trong buồng ấp ngầm để tái lập vương quốc!
  - **Đơn Chúa (`Monogyne`) ↔ Đa Chúa (`Polygyne`)**: Chuyển đổi trực tiếp giữa cấu trúc 1 Kiến Chúa độc tôn và 3 Kiến Chúa đồng trị vì (kèm 6 Kiến Lính chia đều 2 Vệ binh hộ giá mỗi Chúa).
  - **Dây chuyền Cắt hạt "Cutters & Carriers" (Wilson, 1978)**: Kiến Tướng dùng cặp hàm cối xay *Edentate* nghiền vỡ hạt cứng/vỏ Kitin trước khi Kiến Thợ hợp tác khiêng về tổ.
  - **Tác chiến 3 Vòng Đồng tâm & Y tá Chiến trường (`Allogrooming`)**: Kiến Tướng làm lá chắn giảm 60% sát thương AoE, Kiến Lính cắn khóa khớp làm chậm Nhện Độc tới 75%, Kiến Thợ chích nọc *Solenopsin* và liếm vết thương cứu chữa đồng đội.
- ⏳ **Nhịp Sinh học 4 Buổi (`Sáng · Trưa · Chiều · Tối`) & 6 Chế độ Thời tiết / Thảm họa Thượng Đế**:
  - **4 Buổi Sinh học (24h)**: Phơi nắng làm ấm cơ ngực buổi sáng (`Basking`), rút xuống bóng râm tránh sốc nhiệt $CT_{\max}$ buổi trưa (`Shade-Seeking`), cao điểm vận chuyển buổi chiều, và cụm cảnh giới chống Nhện Độc săn đêm (`Nocturnal Guard`).
  - **6 Thời tiết & Thảm họa Chuyển pha Thực tế**: `☀️ Quang Đãng`, `🌧️ Mưa Rào` (kiến chạy về miệng tổ và bò tụt xuống 3 buồng hầm ngầm dưới lòng đất), `🌬️ Gió Bão` (cắn cỏ neo trụ *Anemotactic Mandibular Anchoring*), `🌪️ Lốc Xoáy` (vòi rồng 3D có thể điều hướng bằng chuột trên mặt đất, cuốn bổng kiến và mồi lên độ cao 16m), `🔥 Nắng Hạn`, và `🌊 Đại Hồng Thủy` (mưa lớn liên tục → nước lũ dâng dần → kiến chạy về đỉnh Gò Tổ kết **Bè Kiến Sống Cassie–Baxter** nâng Kiến Chúa ở tâm bè, các cá thể ở xa vùng vẫy và có thể chết đuối nếu không bơi kịp về rìa bè).
- 📐 **Phòng Lab Ánh Xạ & Ngoại Suy Thực Địa 5 Tầng**: Bảng điều khiển khoa học cho phép kéo thanh trượt thay đổi trực tiếp thế giới 3D bên ngoài (Cấu trúc Đơn/Đa Chúa, Bán kính Lãnh thổ Kiếm ăn $A_{\text{terr}} \in [15, 120]\text{ m}^2$ lấy Tổ Chính làm tâm, Nhiệt độ Đất $T_{\text{soil}} \in [15, 40]^\circ\text{C}$ theo động học Arrhenius).
- ⚡ **Tối ưu hóa Đồ họa 100% GPU (`Pre-baked Bone DataTexture Atlas`)**: Nướng sẵn 8 trạng thái hoạt ảnh xương vào `FloatType DataTexture` trên GPU, giảm từ `7.200+` phép nhân ma trận xương CPU/frame và `150` nguồn sáng ẩn xuống **0 phép tính ma trận CPU**, chạy mượt 60 FPS trên Apple Silicon (M1/M2/M3).

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ | Vai trò trong dự án |
|------|-----------|---------------------|
| **SSG & Docs** | [Docusaurus 3.9.2](https://docusaurus.io/) + MDX | Quản lý 17 chương bách khoa, định tuyến SPA, tìm kiếm, biên dịch công thức toán KaTeX |
| **UI & Styling** | React 19 + Tailwind CSS 4 | Giao diện Glassmorphism, bảng điều khiển có nút `Thu gọn ▲ / Mở ▼`, hỗ trợ Dark/Light mode (`Phycat Abyss` / `Phycat Sky`) |
| **Đồ họa 3D** | [Three.js r170](https://threejs.org/) + `@react-three/fiber` + `@react-three/drei` | Dựng cảnh 3D thời gian thực, Spatial Hash Grid $O(1)$, `InstancedMesh` Pheromone, X-Ray Tổ Ngầm 3 tầng, Bản đồ nhiệt Microclimate |
| **GPU Animation** | Custom `DataTexture` Bone Matrix Atlas (`AntModel.js`) | Nướng hoạt ảnh bộ xương 6 chân (`Tripod Gait`) lên VRAM GPU, khử hoàn toàn hiện tượng trượt chân và nghẽn cổ chai CPU |
| **3D Anatomy** | `@google/model-viewer` | Khám phá giải phẫu 3D tĩnh với 13 điểm Hotspot tương tác tại Trang Chủ |

---

## 📐 Mô Hình Ngoại Suy Bầy Đàn 5 Tầng & Sinh Năng Lượng Dị Tốc

Hệ thống tích hợp mô hình toán sinh thái 5 tầng trong [`src/components/AntSimulation/index.js`](src/components/AntSimulation/index.js), khắc phục hoàn toàn sai số nhân tuyến tính cổ điển khi quy đổi từ ô quan sát vi mô ($A_{\text{quad}} = 0.25\text{ m}^2$) sang toàn vương quốc ngoài tự nhiên:

### Tầng 1 — Tích phân Cực 2D Suy giảm Mật độ Kiếm ăn (*Central-Place Foraging*)
Mật độ kiến kiếm ăn suy giảm theo hàm mũ từ tâm Gò Tổ (`NEST_POS`) ra biên giới lãnh thổ $R_{\text{terr}} = \sqrt{A_{\text{terr}}/\pi}$ theo quy luật $D(r) = D_0 e^{-\lambda r}$ (Orians & Pearson, 1979; Porter & Tschinkel, 1987):

$$\eta_{\text{spatial}}(\lambda, R_{\text{terr}}) = \frac{2}{(\lambda R_{\text{terr}})^2}\Big[1 - (1 + \lambda R_{\text{terr}})e^{-\lambda R_{\text{terr}}}\Big] e^{\lambda r_{\text{quad}}}, \quad N_{\text{surface}, c} = n_{\text{sim}, c} \cdot \frac{A_{\text{terr}}}{A_{\text{quad}}} \cdot \eta_{\text{spatial}}$$

> **Quy tắc Sinh học Kiến Chúa:** Kiến Chúa (`Queen`) được **loại trừ hoàn toàn khỏi phép nhân diện tích** và chỉ định lượng theo cấu trúc xã hội (*Monogyne* = 1 Chúa, *Polygyne* = 3–6 Chúa đồng trị — Vargo & Fletcher, 1989).

### Tầng 2 — Ma trận Nghịch đảo Horvitz–Thompson theo Giai cấp & Động học Nhiệt Arrhenius
Tỷ lệ xuất quân lên bề mặt $f_c(T_{\text{soil}}, W)$ khác biệt rõ rệt giữa các giai cấp (Tschinkel, 2006): Kiến Tướng (`Major`) có tới ~86% quân số ở dưới kho hạt ngầm, Kiến Lính (`Soldier`) canh gác cửa tổ (~27%), và Kiến Thợ (`Minor`) có ~81% quân số chăm sóc ấu trùng ngầm:

$$N_{\text{col}, c} = \frac{N_{\text{surface}, c}}{f_c(T_{\text{soil}}, W)}, \quad N_{\text{brood}} = \alpha_{\text{brood}}(F, W) \cdot \sum_{c} N_{\text{col}, c}$$

### Tầng 3 — Định luật Dị tốc Siêu sinh vật Kleiber–Hou (*Superorganism Allometry*)
- **Đơn vị Trao đổi chất Tương đương (`MEU` — Kleiber, 1932, $B \propto M^{0.75}$)**:
  - Kiến Thợ (`Minor`, $1.0\text{ mg}$) = $\mathbf{1.00\text{ MEU}}$
  - Kiến Lính (`Soldier`, $2.2\text{ mg}$) = $\mathbf{1.81\text{ MEU}}$
  - Kiến Tướng (`Major`, $4.0\text{ mg}$) = $\mathbf{2.83\text{ MEU}}$
  - Kiến Chúa (`Queen`, $14.2\text{ mg}$) = $\mathbf{7.32\text{ MEU}}$
- **Công suất Trao đổi chất Toàn Tổ (Hou et al., 2010 *PNAS*, $B_{\text{col}} \propto M_{\text{col}}^{0.81}$)**:

$$B_{\text{col}}\text{ (kJ/ngày)} = B_0 \cdot \left(\frac{M_{\text{fresh}}}{\text{g}}\right)^{0.81} \cdot \phi_{\text{Arrhenius}}(T_{\text{soil}})$$

### Tầng 4 — Sức chứa Cực đại theo Định luật Tối thiểu Liebig & Đáp ứng Săn mồi Holling Type II

$$K_{\max}^{\text{MEU}} = \min\!\Big(K_{\text{trophic}}(F),\ K_{\text{hydro}}(W),\ K_{\text{space}}(A_{\text{terr}}, \text{Social})\Big) \times \left(1 - \frac{P_{\max} \cdot E}{E_{1/2} + E}\right)$$

### Tầng 5 — Phương sai Không gian Taylor & Khoảng Tin Cậy 95% ($\text{CI}_{95\%}$)
Do kiến phân bố cụm theo vết mùi Pheromone ($\sigma^2 = a\mu^b$ với hệ số kết cụm Taylor $b = 1.44$), kết quả ngoại suy toàn tổ luôn đi kèm biên độ sai số chuẩn tương đối ($\text{RSE}$) và khoảng tin cậy $95\%$ ($N_{\text{col}} \pm 1.96 \cdot \text{SE}$).

---

## 🎮 Hệ Thống Điều Khiển & Quyền Năng Thượng Đế (`/ant-simulation`)

Hai bảng điều khiển hai bên đều tích hợp nút **`Thu gọn ▲` / `Mở ▼`** giúp mở rộng tối đa không gian quan sát 3D:

| Nhóm Quyền Năng | Các Nút / Thanh Trượt | Cơ Chế Tác Động Trực Tiếp Trong Thế Giới 3D |
|-----------------|-----------------------|---------------------------------------------|
| **⏳ Chu Kỳ 4 Buổi (24h)** | `🌅 Sáng` · `☀️ Trưa` · `🌇 Chiều` · `🌙 Tối` + `🔄 Tự chuyển 24h` | Điều biến ánh sáng mặt trời, nhiệt độ đất $T_{\text{soil}}$, tốc độ chạy Arrhenius, tầm nhìn quang học Ommatidia, độ nhạy râu khứu giác và hành vi phơi nắng / trú râm / cụm đêm |
| **🌪️ Thời Tiết & Thảm Họa** | `☀️ Quang Đãng` · `🌧️ Mưa Rào` · `🌬️ Gió Bão` · `🌪️ Lốc Xoáy` · `🔥 Nắng Hạn` · `🌊 Đại Hồng Thủy` | Chuyển pha thời tiết đa giai đoạn: Mưa rào rút xuống hầm ngầm; Đại hồng thủy mưa lớn dâng nước dần, kết bè tại đỉnh Gò Tổ; Lốc xoáy 3D điều hướng bằng chuột cuốn bay kiến & làm vỡ bụng trứng nếu Kiến Chúa rơi va đập |
| **🔬 Chế Độ Quan Sát & Tương Tác** | `🤚 Kéo Cam` · `🔄 Xoay` · `🍬 Thả Đường` · `⚠️ Báo Động` · `🔍 Tổ Ngầm X-Ray` · `🌡️ Bản Đồ Nhiệt` · `👑 Chúa Tuần Du` | Cắt lớp X-Ray xuyên đất soi 3 buồng tổ ngầm (`-6.5m` đến `-14.5m`); hiển thị trường nhiệt độ vi khí hậu; lệnh cho các Kiến Chúa cùng đội hình Kiến Lính hộ giá diễu hành trên mặt đất |
| **📐 Phòng Lab 5 Tầng** | `Đơn Chúa / Đa Chúa` · `Lãnh thổ A_terr (15–120m²)` · `Nhiệt độ đất T_soil (15–40°C)` + `👁️ Thu Gọn Xem 3D` | Thay đổi trực tiếp số lượng Kiến Chúa trị vì (`1` hoặc `3` Chúa), co giãn vành đai biên giới kiếm ăn quanh Tổ Chính và điều chỉnh động học nhiệt của đàn kiến ngay khi đang kéo thanh trượt |

---

## 📚 Bách Khoa Toàn Thư (17 Chương Chuyên Sâu)

| # | Chương | Chủ đề cốt lõi |
|---|--------|----------------|
| 00 | Hướng dẫn Mô phỏng 3D | Sổ tay vận hành chi tiết toàn bộ cơ chế AI, giai cấp, thời tiết và toán sinh thái |
| 01 | Nguồn gốc & Lịch sử | Lịch sử tiến hóa tại Nam Mỹ và hành trình xâm lấn toàn cầu |
| 02 | Hệ thống phân loại | Phân loại học, danh pháp khoa học chi *Solenopsis* |
| 03 | Đặc điểm hình thái | Giải phẫu vi phẫu đầu, ngực, bụng, ngòi chích và tuyến ngoại tiết |
| 04 | Vòng đời & Tuổi thọ | Biến thái hoàn toàn: Trứng → Ấu trùng (4 tuổi) → Nhộng → Trưởng thành |
| 05 | Giai cấp xã hội | Đa hình dị tốc giữa Kiến Chúa, Kiến Tướng, Kiến Lính và Kiến Thợ |
| 06 | Mô hình tổ chức | Tự tổ chức phi tập trung, giao tiếp Pheromone và Trophallaxis |
| 07 | Kiến trúc tổ ngầm | Hệ thống giếng thông khí, buồng ấp điều nhiệt và buồng ngự cung sâu dưới đất |
| 08 | Vật lý kết bè | Định luật Cassie–Baxter và sức căng bề mặt khi kết bè sống chống lũ |
| 09 | Cạnh tranh sinh thái VN | Tương tác và áp đảo các loài kiến bản địa tại Việt Nam |
| 10 | Phân bố toàn cầu | Bản đồ phân bố và dự báo mở rộng vùng xâm lấn theo biến đổi khí hậu |
| 11 | Tác động kinh tế–môi trường | Thiệt hại nông nghiệp, hạ tầng điện và đa dạng sinh học |
| 12 | Nọc độc & Triệu chứng | Alkaloid *Solenopsin* ($C_{17}H_{35}N$), cơ chế hoại tử vô trùng và mụn mủ |
| 13 | Sốc phản vệ & Sơ cứu | Phác đồ xử trí y tế khi bị kiến lửa đốt và cấp cứu phản vệ |
| 14 | Kiểm soát hóa học | Cơ chế mồi độc tác động chậm (IGR, Hydramethylnon, Indoxacarb) |
| 15 | Kiểm soát sinh học | Thiên địch tự nhiên: Ruồi ký sinh *Pseudacteon*, nấm *Beauveria bassiana*, virus SINV |
| 16 | Phòng ngừa hộ gia đình | Các biện pháp bảo vệ không gian sống và trẻ nhỏ an toàn, bền vững |

---

## 🚀 Cài đặt & Khởi chạy

### Yêu cầu hệ thống
- **Node.js** ≥ 20.0
- **npm** (đi kèm Node.js)

### Chạy môi trường phát triển (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/canar1406/kien-lua-wiki.git
cd kien-lua-wiki

# 2. Cài đặt dependencies
npm install --legacy-peer-deps

# 3. Khởi chạy dev server (Hot-Reload tại http://localhost:3000/kien-lua-wiki/)
npm run start
```

### Build Production & Kiểm thử

```bash
# Tạo bản build tĩnh tối ưu hóa
npm run build

# Xem trước bản build production
npm run serve
```

---

## 📁 Cấu trúc thư mục

```text
kien-lua-wiki/
├── docs/                              # 17 chương Bách khoa toàn thư (.md)
│   ├── 00-huong-dan-mo-phong.md       # Sổ tay hướng dẫn mô phỏng 3D toàn diện
│   ├── 01-nguon-goc-va-lich-su.md
│   └── ... (02 -> 16)
├── src/
│   ├── components/
│   │   ├── AntViewer/                 # Mô hình giải phẫu 3D tĩnh + 13 Hotspots
│   │   ├── AntSimulation/             # Phòng thí nghiệm Mô phỏng Siêu sinh vật 3D
│   │   │   ├── index.js               #   FSM 4 giai cấp, Thời tiết chuyển pha, Kế vị Chúa, Lab 5 Tầng
│   │   │   └── AntModel.js            #   GPU Pre-baked Bone DataTexture Atlas (60 FPS Apple Silicon)
│   │   └── HomepageFeatures/          # Các phân khu tương tác trên Trang chủ
│   ├── css/
│   │   ├── custom.css                 # Hệ thống Z-index 3D Canvas, Glassmorphism & Responsive
│   │   ├── phycat-abyss.css           # Giao diện tối (Dark Mode)
│   │   └── phycat-sky.css             # Giao diện sáng (Light Mode)
│   ├── pages/
│   │   ├── index.js                   # Trang chủ
│   │   ├── ant-simulation.js          # Trang Mô phỏng 3D toàn màn hình (/ant-simulation)
│   │   └── about.js                   # Trang Giới thiệu đội ngũ (/about)
│   └── theme/
│       └── MDXComponents.js           # Tùy biến bảng biểu & thành phần MDX
├── static/
│   ├── img/                           # Hình ảnh, biểu đồ, logo
│   └── models/fire_ant/               # Mô hình 3D GLTF + PBR Textures của Solenopsis geminata
├── .github/workflows/deploy.yml       # Pipeline CI/CD tự động build & deploy GitHub Pages
├── docusaurus.config.js               # Cấu hình Docusaurus 3.9.2 & KaTeX
├── sidebars.js                        # Cấu trúc cây mục lục Bách khoa toàn thư
├── kinh_nghiem.md                     # Nhật ký kỹ thuật 3D WebGL & Tối ưu hóa hiệu năng
└── package.json
```

---

## 👥 Đội ngũ thực hiện

| Thành viên | Vai trò |
|------------|---------|
| **Nguyễn Quốc Gia Huy** | Leader, Thuyết trình |
| **Võ Nguyễn Hoàng Long** | Nghiên cứu thực địa, Lead Developer |
| **Trương Minh Khoa** | Nghiên cứu thực địa |
| **Đặng Quang Minh** | Biên soạn nội dung học thuật |
| **Đặng Trần Diễm Phúc** | Biên soạn nội dung học thuật |
| **Thanh Ngọc** | Xây dựng môi trường nuôi thực nghiệm |
| **Phan Lê Ánh Ngọc** | Chăm sóc & quan sát mẫu vật |
| **Nguyễn Trọng Nhân** | Chăm sóc & quan sát mẫu vật |
| **Uyên Phạm** | Chăm sóc & quan sát mẫu vật |
| **Lê Viết Triết** | Thuyết trình |

---

## 📄 Giấy phép

Dự án phục vụ mục đích nghiên cứu và giáo dục Sinh học. © 2026 Dự án Sinh Học — Built with [Heavietnam](https://home.heavietnam.com/).
