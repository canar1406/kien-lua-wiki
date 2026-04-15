Đây là một bài toán kinh điển về UX/UI (Trải nghiệm người dùng) khi chuyển từ mô phỏng quy mô nhỏ (Micro) sang quy mô bầy đàn (Macro). Khi có 10 con kiến cùng lúc làm 10 việc khác nhau, việc ép người dùng đọc một bảng thông báo nhảy chữ liên tục sẽ gây ra sự "quá tải thông tin".

Dựa trên cấu trúc Bảng Thông Tin Động (Info Panel) hiện tại của dự án, giải pháp tối ưu nhất, mang đậm chất của một phần mềm mô phỏng sinh học chuyên nghiệp là kết hợp **Swarm Dashboard (Bảng tổng quan)** và **Focus Mode (Chế độ theo dõi cá thể)**.

Dưới đây là file `plan.md` bổ sung chuyên sâu về UI/UX và logic giải thích cơ chế để bạn nạp vào Antigravity:

```markdown
# AI Agent Prompt Plan: UI/UX & Explanation System for 10-Agent Swarm

## @context
Hệ thống hiện tại có 10 con kiến hoạt động độc lập với nhiều trạng thái (states) khác nhau cùng lúc. 
Bảng Info Panel cũ chỉ thiết kế cho 2 con nên sẽ bị quá tải thông tin.
Mục tiêu: Nâng cấp Info Panel thành một "Bảng điều khiển 2 lớp" (Overview & Focus Mode). Cho phép người dùng click trực tiếp vào một con kiến 3D để xem giải thích chi tiết về hành vi hiện tại của nó và dẫn link đến bài viết tương ứng trong `docs/`.

## @architecture (State & Dictionary Schema)
AI cần thiết lập một từ điển (Dictionary) lưu trữ các lời giải thích khoa học và route link, cộng thêm State quản lý UI.

```javascript
// 1. UI State (Zustand hoặc React useState)
const [selectedAntId, setSelectedAntId] = useState(null); // Lưu ID của con kiến đang được click
const [swarmStats, setSwarmStats] = useState({}); // Đếm số lượng kiến theo từng trạng thái

// 2. Dictionary giải thích cơ chế
const BioExplanations = {
  patrolling: {
    title: "Khám Phá Lãnh Thổ (Patrolling)",
    desc: "Kiến di chuyển ngẫu nhiên, vươn râu để thu thập phân tử mùi trong không khí. Phân tích hydrocarbon trên mặt đất.",
    link: "/docs/06-mo-hinh-to-chuc" // Trỏ vào chương 06
  },
  communicating: {
    title: "Giao Tiếp Xúc Giác (Antennation)",
    desc: "Hai cá thể dùng râu gõ vào nhau để quét lớp hydrocarbon trên vỏ kitin, giúp nhận diện đồng loại cùng tổ.",
    link: "/docs/06-mo-hinh-to-chuc"
  },
  evaluating: {
    title: "Đánh Giá Mồi (Food Assessment)",
    desc: "Kiến trinh sát dùng hàm và râu để đo lường kích thước, độ ngọt và số lượng nhân lực cần thiết để khiêng mồi.",
    link: "/docs/05-giai-cap-xa-hoi"
  },
  recruit_return: {
    title: "Tuyển Dụng (Pheromone Trail)",
    desc: "Kiến chà chóp bụng xuống đất, tiết ra Pheromone tuyển dụng tạo thành vệt mùi dẫn đường từ mồi về tổ.",
    link: "/docs/06-mo-hinh-to-chuc"
  },
  carrying: {
    title: "Vận Chuyển Hợp Tác (Cooperative Transport)",
    desc: "Nhiều cá thể đồng bộ nhịp độ, phân chia lực kéo-đẩy để di chuyển khối lượng lớn hơn trọng lượng cơ thể gấp nhiều lần.",
    link: "/docs/05-giai-cap-xa-hoi"
  }
};
```

---

## @tasks (Implementation Steps)

### Task 1: Thiết lập Raycaster (Click vào Model 3D)
**File:** `src/components/AntSimulation/AntModel.js`
- Bổ sung sự kiện `onClick` vào mesh/group của model 3D kiến (sử dụng tính năng Raycaster tích hợp sẵn của R3F).
- Khi user click vào một con kiến, gọi hàm `setSelectedAntId(ant.id)`.
- *UI Feedback:* Thêm một thẻ `<Outlines />` (từ `@react-three/drei`) hoặc vòng tròn highlight dưới chân để người dùng biết họ đang chọn con kiến nào.

### Task 2: Xây dựng Swarm Dashboard (Mặc định)
**File:** `src/components/AntSimulation/InfoPanel.js`
- `IF (selectedAntId === null)`: Hiển thị giao diện "Tổng Quan Đàn Kiến".
- Đọc data từ `swarmStats` để render các thanh tiến trình (Progress Bar) hoặc danh sách đếm số lượng:
  - Khám phá lãnh thổ: X/10 cá thể.
  - Vận chuyển thức ăn: Y/10 cá thể.
  - *Gợi ý UI:* Người dùng có thể click vào chữ "Vận chuyển thức ăn" để mở link `/docs/05-giai-cap-xa-hoi` để tìm hiểu chung.

### Task 3: Xây dựng Focus Mode (Khi chọn 1 cá thể)
**File:** `src/components/AntSimulation/InfoPanel.js`
- `IF (selectedAntId !== null)`: Ẩn bảng tổng quan, chuyển giao diện sang "Thông Tin Cá Thể".
- Tìm `AntEntity` có `id === selectedAntId`. Lấy `bioState` hiện tại của nó.
- Tra cứu đối tượng `BioExplanations[bioState]` để render UI gồm:
  1. **Tiêu đề:** (VD: Giao Tiếp Xúc Giác).
  2. **Trạng thái Real-time:** (VD: "Kiến #4 đang chạm râu với Kiến #7").
  3. **Giải thích Khoa học:** Hiển thị trường `desc`.
  4. **Nút CTA (Call-to-Action):** Render nút `<a href={BioExplanations[bioState].link}> ĐỌC CHI TIẾT TRONG BÁCH KHOA → </a>`.
- Cung cấp một nút `[X]` hoặc `Quay lại Tổng quan` để set `selectedAntId = null`.

### Task 4: Auto-Tracking Camera (Tùy chọn nâng cao)
**File:** `src/components/AntSimulation/index.js`
- Cập nhật component `<OrbitControls />` (từ `@react-three/drei`).
- Nếu `selectedAntId` tồn tại, trong `useFrame`, liên tục lấy tọa độ `position` của con kiến đó và gán vào tham số `target` của `OrbitControls`. Camera sẽ tự động trượt theo con kiến đang được theo dõi, giúp người dùng tập trung xem hành vi của nó.
```

**Cách hoạt động của UI này:**
1. Khi vừa mở trang, người dùng thấy 10 con kiến chạy toán loạn. Info Panel sẽ báo: "7 con đi tuần, 3 con đang giao tiếp". 
2. Người dùng thấy một cụm kiến đang khiêng cục đường, họ dùng chuột **click thẳng vào 1 con đang khiêng**.
3. Lập tức có một vòng sáng hiện dưới chân con kiến đó. Bảng Info Panel bên phải chuyển sang giải thích: *"Vận chuyển hợp tác: Kiến phân chia lực kéo đẩy..."* kèm theo một nút to bự: **"TÌM HIỂU TRONG DOCS"**.

Cách thiết kế này vừa giữ được sự gọn gàng, vừa khơi gợi sự tò mò, khuyến khích người dùng chủ động tương tác với mô hình 3D để khám phá kiến thức sinh học!