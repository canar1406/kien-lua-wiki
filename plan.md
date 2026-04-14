# Kế Hoạch Chi Tiết: Cơ Chế Giao Tiếp Của Kiến (Ant Communication Mechanics)

## 1. Tổng quan về mặt Sinh học & Ứng dụng vào 3D
Trong thực tế, kiến giao tiếp chủ yếu qua **hóa chất (Pheromone)** và **xúc giác (Chạm râu - Antennation)**. Để thể hiện điều này một cách trực quan trong môi trường 3D, chúng ta sẽ "hình ảnh hóa" các tín hiệu này thông qua 3 yếu tố chính:
- **Chuyển động của râu (Antennae Animation).**
- **Ngôn ngữ cơ thể (Body Language).**
- **Hiệu ứng hạt (VFX - Pheromone Particles).**

---

## 2. Phân rã Hành động (Action Breakdown cho Rigging & Animation)
Yêu cầu hệ thống trích xuất và điều khiển các khớp xương (Bones) cụ thể của model `Fire Ant (Worker).gltf`:

### A. Râu (Antennae) - Công cụ giao tiếp chính
- [ ] **Trạng thái dò đường (Searching):** Khi đi chuyển bình thường, râu đưa qua đưa lại theo hình số 8 với tốc độ chậm (khoảng 1 chu kỳ/giây).
- [ ] **Trạng thái tương tác (Antennation):** Khi 2 con kiến đối diện nhau, râu vươn thẳng về phía trước. Tốc độ rung râu tăng lên gấp 3 lần (3-4 chu kỳ/giây), các đầu râu (Antenna_Tip) của 2 con chạm lướt qua nhau liên tục.

### B. Đầu & Hàm (Head & Mandibles)
- [ ] **Giao tiếp thức ăn (Trophallaxis):** Đầu hơi cúi xuống. Khớp xương hàm (Mandible_L, Mandible_R) mở rộng nhẹ. Hai con kiến nhích lại gần sát sao cho phần miệng chạm nhau.
- [ ] **Báo động nguy hiểm (Alarm):** Đầu ngẩng cao lên khoảng 30 độ, hàm mở to hết cỡ đe dọa.

### C. Thân & Bụng (Body & Abdomen)
- [ ] **Nhận diện:** Thân đứng im, dồn trọng tâm về 4 chân sau, 2 chân trước hơi nhấc lên.
- [ ] **Đánh dấu mùi (Pheromone Trail):** Phần chóp bụng (Abdomen) hạ thấp xuống, thỉnh thoảng chạm nhẹ xuống mặt đất (Ground Plane) khi di chuyển.

---

## 3. Các Kịch Bản Tương Tác (Interaction Scenarios)
Thiết lập logic (State Machine) cho 3 tình huống giao tiếp cụ thể:

### Kịch bản 1: Chào hỏi thông thường (Greeting / Nestmate Recognition)
- **Điều kiện kích hoạt:** 2 con kiến vô tình đi ngang qua nhau (khoảng cách < 5 units).
- **Hành động:** 1. Cả hai dừng lại.
  2. Quay mặt vào nhau (LookAt).
  3. Rung râu chạm nhau trong `1.0 - 1.5 giây`.
- **Kết quả:** Nhận diện là đồng loại, cả hai quay đi và tiếp tục hành trình ngẫu nhiên.

### Kịch bản 2: Truyền tin phát hiện thức ăn (Food Recruitment)
- **Điều kiện kích hoạt:** Kiến A vừa chạm vào một điểm đánh dấu là "Thức ăn", trên đường về tổ gặp Kiến B.
- **Hành động:**
  1. Kiến A lao nhanh về phía Kiến B.
  2. Rung râu với tốc độ cao kèm theo hành động chạm miệng (Trophallaxis) trong `2.0 - 3.0 giây`.
  3. **VFX:** Kích hoạt một hiệu ứng hạt (Particle) nhỏ màu xanh lá/vàng bay ra giữa 2 con.
- **Kết quả:** Kiến A tiếp tục về tổ. Kiến B lập tức đổi hướng, chạy nhanh theo đúng vệt đường (Trail) mà Kiến A vừa đi qua để đến chỗ thức ăn.

### Kịch bản 3: Cảnh báo nguy hiểm (Alarm Signal)
- **Điều kiện kích hoạt:** Người dùng click chuột (tạo tiếng động/chướng ngại vật) gần Kiến A.
- **Hành động:**
  1. Kiến A lùi lại, ngẩng đầu, há hàm, bụng giật giật.
  2. Tiết ra Pheromone báo động (VFX: Hạt màu đỏ lan tỏa dạng vòng tròn).
  3. Bất kỳ Kiến B, C, D nào đi vào bán kính vòng tròn đỏ này lập tức chuyển sang trạng thái "Kích động": Tăng tốc độ di chuyển lên 1.5 lần, chạy tán loạn hoặc hướng về phía nguồn nguy hiểm với hàm mở to.

---

## 4. Yêu cầu lập trình (Technical Logic Setup)
- [ ] Xây dựng class `AntController` với các Enum States: `IDLE`, `WANDERING`, `COMMUNICATING`, `ALARMED`, `FOLLOWING_TRAIL`.
- [ ] Cài đặt hệ thống `Raycast` hoặc `OverlapSphere` ở phần đầu của model 3D để phát hiện các con kiến khác trong cự ly gần.
- [ ] Sử dụng **Tweening** (như GSAP hoặc thư viện tích hợp của engine) để chuyển đổi mượt mà (blend) giữa các tư thế hoạt ảnh (ví dụ: từ Walk sang Antennation mà không bị giật cục).
- [ ] (Tùy chọn) Viết một hệ thống `TrailManager` vô hình trên mặt phẳng (Grid/NavMesh) để lưu lại tọa độ Pheromone, giúp Kiến B có thể đọc dữ liệu và lần theo đường đi của Kiến A ở Kịch bản 2.