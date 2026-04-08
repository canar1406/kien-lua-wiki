# BẢN KẾ HOẠCH TÍCH HỢP MÔ HÌNH 3D KIẾN LỬA (SOLENOPSIS GEMINATA)

## 1. Công nghệ Sử dụng (Tech Stack)

Dựa vào source code bạn cung cấp, dự án của bạn đang chạy bằng **Docusaurus** (ReactJS) và sử dụng **Tailwind CSS**. Do đó, công nghệ lý tưởng nhất là:

- **Thư viện 3D Core:** `<model-viewer>` của Google. Cực kỳ nhẹ, dễ nhúng vào React (Docusaurus) dưới dạng component, hỗ trợ sẵn Hotspot (Điểm neo) và Animations (Hoạt ảnh) mà không cần tự code WebGL phức tạp.
- **Thành phần UI:** Dùng Tailwind CSS để style cho các Tooltip (Bảng mô tả hiện ra khi di chuột) và Bảng điều khiển Hoạt ảnh.
- **Điều hướng (Routing):** Sử dụng component `<Link>` của Docusaurus (React Router) để nút "Read more" chuyển trang mượt mà không cần tải lại web.

## 2. Thiết kế Kịch bản Tương tác Điểm Neo (Hotspots)

Khi người dùng di chuột (hover) vào các bộ phận cụ thể, một bảng thông tin (Tooltip) sẽ nổi lên. Dưới đây là các vị trí neo và liên kết tương ứng với file tài liệu (`docs/`) trong kho của bạn:

| **Vị trí Bộ Phận**                     | **Tọa độ dự kiến (X, Y, Z)** | **Nội dung Tooltip (Hiển thị khi Hover)**                    | **Nút "Read more" (Dẫn Link tới Docs)**                      |
| -------------------------------------- | ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Cặp Hàm (Mandibles)**                | `[Gắn ở miệng]`              | **Hàm Răng Cưa:** Vũ khí sắc bén dùng để cắt xẻ mồi, cắn chặt kẻ thù để làm điểm tựa trước khi chích nọc. | 🔗 Đi tới: `/docs/03-dac-diem-hinh-thai` (Đặc điểm hình thái) |
| **Cặp Râu (Antennae)**                 | `[Gắn ở râu]`                | **Cơ Quan Cảm Giác:** Gồm 10 đốt với đốt cuối phình to. Dùng để "ngửi" pheromone, giao tiếp và tìm đường. | 🔗 Đi tới: `/docs/03-dac-diem-hinh-thai`                      |
| **Ngực & Chân (Thorax & Legs)**        | `[Gắn ở lưng ngực]`          | **Trung Tâm Vận Động:** Không có gai ngực. Sở hữu 3 cặp chân khỏe giúp kiến thợ di chuyển với tốc độ cao và linh hoạt. | 🔗 Đi tới: `/docs/03-dac-diem-hinh-thai`                      |
| **Bụng & Kim Chích (Abdomen/Stinger)** | `[Gắn ở đuôi bụng]`          | **Nọc Độc Solenopsin:** Nơi chứa túi nọc và kim chích. Vết chích gây cảm giác bỏng rát như lửa đốt và tạo mủ trắng. | 🔗 Đi tới: `/docs/12-noc-doc-va-trieu-chung` (Nọc độc và Triệu chứng) |

## 3. Kịch bản Điều khiển Hoạt ảnh (Animations)

File `.gltf` của bạn chứa các hoạt ảnh (animation) được rigging sẵn. Ta sẽ thiết kế một **Bảng điều khiển (Control Panel)** ở góc màn hình để người dùng click xem các hành vi của kiến.

Khi click vào một hành vi, mô hình 3D sẽ chuyển động, đồng thời một thẻ thông tin bên cạnh sẽ giải thích hành vi đó:

- 🎬 **Hoạt ảnh 1: Di chuyển / Tuần tra (Walking/Foraging)**
  - **Mô tả hiển thị:** Kiến thợ liên tục tuần tra quanh tổ. Khi phát hiện thức ăn, chúng sẽ tiết ra pheromone từ bụng xuống đất để tạo vệt mùi cho đồng loại đi theo.
  - **Link đọc thêm:** Dẫn tới `/docs/06-mo-hinh-to-chuc` (Mô hình tổ chức / Phân công lao động).
- 🎬 **Hoạt ảnh 2: Cảnh giác / Tấn công (Aggressive/Stinging Pose)**
  - **Mô tả hiển thị:** Khi tổ bị đe dọa, kiến thợ sẽ đứng bằng hai chân sau, vươn cao thân mình, hàm mở rộng sẵn sàng cắn và bụng gập lại phía trước để chích nọc liên tục.
  - **Link đọc thêm:** Dẫn tới `/docs/13-soc-phan-ve-va-so-cuu` (Sốc phản vệ) hoặc `/docs/08-vat-ly-ket-be` (Cách chúng phản ứng khi lũ lụt).
- 🎬 **Hoạt ảnh 3: Trạng thái nghỉ (Idle/Grooming)**
  - **Mô tả hiển thị:** Kiến có thói quen làm sạch cơ thể, đặc biệt là vuốt cặp râu để đảm bảo các thụ thể hóa học luôn nhạy bén.

## 4. Các Bước Triển Khai Thực Tế (Implementation Roadmap)

### Bước 1: Tối ưu hóa file 3D (Asset Prep)

- Hiện tại bạn đang để rời rạc file `.gltf`, `.bin`, và thư mục `images`. Khi đưa lên web (đặc biệt là Docusaurus), bạn **nên nén chúng lại thành 1 file `.glb` duy nhất** để tránh các lỗi đường dẫn (CORS, 404).
- Đặt file này vào thư mục `static/model/fire-ant.glb` trong dự án Docusaurus của bạn.

### Bước 2: Tạo Component React cho Mô hình

- Tạo một file mới (ví dụ: `src/components/AntViewer/index.js`).
- Import thư viện `@google/model-viewer`.
- Cấu hình các Hotspot bằng thẻ `<button slot="hotspot-x">` bên trong thẻ `<model-viewer>`. Dùng Tailwind CSS để style Tooltip ẩn/hiện khi CSS `:hover`.

### Bước 3: Logic Hoạt Ảnh & Liên Kết

- Dùng React `useState` để quản lý trạng thái: *Hoạt ảnh nào đang chạy?* và *Mô tả tương ứng là gì?*
- Sử dụng thuộc tính `animation-name="tên_hoạt_ảnh_trong_file_gltf"` của `<model-viewer>` để thay đổi chuyển động khi người dùng bấm nút trên bảng điều khiển.
- Thay thẻ `<a>` thông thường bằng thẻ `<Link to="/docs/... ">` của Docusaurus để điều hướng siêu tốc.

### Bước 4: Tìm Tọa Độ Cho Điểm Neo

- Viết một đoạn script nhỏ gắn vào event `onClick` của model-viewer (như mình đã hướng dẫn ở câu trả lời trước) để trỏ chuột vào vị trí hàm, râu, bụng của con kiến trên trình duyệt và lấy được chuỗi `data-position`, `data-normal` chính xác. Copy dán vào component React.

### Bước 5: Nhúng vào Trang Chủ hoặc Trang Chi Tiết

- Đưa Component `AntViewer` này vào file `src/pages/index.js` (Làm màn hình Hero cực ngầu) hoặc chèn trực tiếp vào các trang Markdown (Docusaurus hỗ trợ MDX, cho phép nhúng Component React vào thẳng file `.md`).
