# KẾ HOẠCH BỔ SUNG: ÁNH XẠ SỨC CHỨA TỰ NHIÊN (SPATIAL SCALING)

## 🎯 1. Nguyên Lý Toán Học (Quadrat Sampling Method)
* Mô phỏng 3D hiện tại không đại diện cho toàn bộ tổ kiến, mà đóng vai trò là một **"Ô lấy mẫu vi mô" (Microcosm)**.
* Giữ nguyên tỷ lệ hành vi 1:1 (1 kiến 3D = 1 kiến thật).
* Dùng công thức nội suy diện tích để phóng đại Sức chứa vi mô ($K_{sim}$) thành Sức chứa vĩ mô ngoài tự nhiên ($K_{real}$).

## ⚙️ 2. Biến Số Bổ Sung (Variables)
Cần định nghĩa 2 hằng số (Constants) về không gian trong file cấu hình:
* `SIM_AREA_M2`: Diện tích mảng cỏ 3D đang mô phỏng (Ví dụ: `0.1` - tức là $0.1 m^2$).
* `REAL_TERRITORY_M2`: Diện tích lãnh thổ trung bình của một vương quốc kiến lửa ngoài tự nhiên (Ví dụ: `50.0` - tức là $50 m^2$).
* `SCALE_FACTOR`: Tỷ lệ phóng đại = `REAL_TERRITORY_M2 / SIM_AREA_M2` (Ví dụ: $50 / 0.1 = 500$).

## 🧮 3. Thuật Toán Ánh Xạ (Scaling Algorithm)
* Bước 1: Hệ thống vẫn chạy Moving Average ngầm để tính ra **Sức chứa vi mô ($K_{sim}$)** của bàn cờ 3D (như kế hoạch trước). Ví dụ: Tính ra được mảng cỏ này nuôi được tối đa 35 con.
* Bước 2: Chạy hàm nội suy: 
  `K_real = K_sim * SCALE_FACTOR`
  *(Ví dụ: 35 x 500 = 17,500 con kiến).*

## 🖥️ 4. Hiển Thị Giao Diện (Dashboard UI Update)
Cập nhật lại dòng thông báo Sức chứa trên **Swarm Dashboard** để hiển thị cả 2 thông số, giúp người dùng hiểu rõ quy mô:

* **Thay đổi Text hiển thị thành:**
  * `[Khung Vi Mô]: Sức chứa ~ [K_sim] cá thể`
  * `[Thực Tế Ước Tính]: Sức chứa vương quốc ~ [K_real] vạn cá thể`
* Thêm một dấu `(?)` nhỏ (Tooltip) cạnh chữ "Thực Tế Ước Tính". Khi người dùng hover chuột vào, hiện giải thích: *"Dựa trên phép nội suy diện tích từ ô lấy mẫu vi mô ra lãnh thổ 50 mét vuông ngoài tự nhiên."*

## 🚀 5. Lộ Trình Triển Khai Nhanh (Fast-track)
1. Thêm 3 biến `SIM_AREA_M2`, `REAL_TERRITORY_M2`, `SCALE_FACTOR` vào đầu file quản lý mô phỏng.
2. Viết hàm `calculateRealCapacity(k_sim) { return Math.round(k_sim * SCALE_FACTOR); }`.
3. Cập nhật thẻ HTML/React hiển thị trên UI Bảng điều khiển.