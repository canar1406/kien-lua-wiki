---
id: huong-dan-mo-phong
title: "Hướng dẫn sử dụng Mô Phỏng Hệ Sinh Thái 3D"
sidebar_label: "Hướng Dẫn Mô Phỏng 3D"
---

# 📖 Hướng Dẫn Mô Phỏng Tổ Kiến Lửa 3D

Chào mừng bạn đến với module **Mô Phỏng Tổ Kiến Lửa 3D (Fire Ant Swarm Simulation)**. Khác với những bài viết văn bản khô khan, hệ thống mô phỏng này tái tạo lại các "chương trình phần mềm sinh học" đang chạy ngầm trong đầu của từng cá thể kiến lửa, cho phép bạn quan sát trực tiếp cái gọi là **Trí Tuệ Bầy Đàn (Swarm Intelligence)**.

Dưới đây là giải thích chi tiết về cách tương tác, ý nghĩa của các công cụ và các cơ chế ẩn được tích hợp.

---

## 1. Màn Hình Điều Khiển Sinh Học (Control Panel)
Ở góc dưới bên trái màn hình là hộp công cụ **"Điều Khiển Sinh Học"**, nơi bạn đóng vai trò là một "vị thần tự nhiên", có thể trực tiếp can thiệp vào môi trường sống của bầy kiến để xem cách chúng phản ứng lại các biến cố bất ngờ.

*   🤚 **Kéo Cam (Pan):** Nhấn giữ nút chuột trái hoặc ngón tay để kéo và di chuyển góc nhìn Camera quanh bản đồ 3D.
*   🔄 **Xoay (Rotate):** Nhấn giữ để xoay Camera 360 độ quanh trọng tâm của tổ kiến. Bức tranh toàn cảnh về cách đàn kiến tản ra tìm kiếm thức ăn sẽ rõ nét nhất ở chế độ này.
*   🍬 **Thả Đường (Food Drop):** Khi nhấp hoặc chạm vào bất kỳ đâu trên mặt cỏ xanh rờn, một viên đường nạp năng lượng cao (hình lập phương trong suốt) sẽ rơi thẳng từ trên trời xuống. Lập tức, sự kiện này sẽ kích hoạt quy trình "Thám thính - Tuyển dụng - Vận chuyển" (Recruitment & Cooperative Transport) kinh điển của loài kiến. Mùi Pheromone sẽ vạch thành các luồng xanh tím dẫn đường rủ rê hàng chục cá thể đang lang thang bu lại viên đường.
*   ⚠️ **Báo Động (Alarm pheromone):** Thả một tín hiệu "Kẻ Thù Xâm Nhập" (hình khối cầu sẫm màu) bất kỳ đâu xuống bề mặt tổ. Ngay lập tức, **tuyến Dufour** của đàn kiến sẽ kích hoạt loại Pheromone Báo Động có tính bay hơi siêu nhanh. Đàn kiến sẽ rơi vào trạng thái khủng hoảng, hủy bỏ mọi công việc hiện tại, hàm mở rộng, vươn cao bụng, và lao thẳng tới tiêu diệt kẻ thù không tiếc mạng sống. 
*   💧 **Uống Nước (Water Drop):** Cung cấp các nguồn nước nhỏ tại những khu vực khác nhau. Kiến đang đi lang thang đôi khi sẽ nạp khoáng chất bù nước để duy trì thể trạng.
*   🌧️ **Đổ Mưa (Rainfall):** Bấm nút này để làm "Sập nguồn" hệ sinh thái kiến thức ăn bên ngoài. Nền trời sẽ chuyền tối đen (`#1a2b3c`), hiệu ứng mưa rơi dày đặc. Điều đặc biệt là nước diệt hoàn toàn mùi Pheromone trên mặt đất. Đồng thời, theo **cơ chế bầy đàn dưới nước**, loài Kiến Lửa sẽ không trốn đi mà tập trung cuộn tròn vào nhau với bề mặt bụng kỵ nước để đan lại thành "Bè Sống Mảng Nổi" trôi dạt vô định! Chờ tạnh mưa, bầy sẽ lại túa ra sinh hoạt bình thường.

---

## 2. Bảng Thống Kê Bầy Đàn (Swarm Dashboard)
Bảng Thống Kê ở góc phải phía trên là **Mắt Thần Số Hóa** đếm trực tiếp trạng thái của tất cả thần dân trong tổ. Ở đây bạn có thể thấy rõ quy tắc phân chia tỷ lệ lao động theo thời gian thực (Labor Division).

*   **👑 Kiến Tướng (Major Ant)** và **👷 Kiến Thợ (Minor Ant)**: Nếu bạn để ý, trong đàn mô phỏng sẽ có 80% là kiến Thợ (nhỏ xíu, nhanh nhẹn) và 20% là Kiến Tướng (to gấp đôi, cái đầu "hộ pháp", xương hàm lớn). Kiến Tướng sẽ mặc định thực hiện nhiệm vụ canh phòng, và chỉ chịu xuất quân ra ngoài khi có miếng đường RẤT LỚN cần sức kéo, hoặc có báo động đỏ ⚠️.
*   **Vệ binh tuần tra**: Số lượng các cá thể đang lang thang thực hiện quy tắc **Brownian motion** (Thuật toán Tìm kiếm ngẫu nhiên).
*   **Nhả mùi Dẫn đường**: Kiến thợ vừa kiếm được đường và mang một phân mảnh đường màu vàng chạy bán sống bán chết về tổ, đồng thời vẽ ra một đường mòn toán học Pheromone (đường chấm xanh tím lấp lánh ở đằng sau đít).
*   **Chờ đội hình (Waiting):** Viên đường quá nặng, kiến không chuyển nổi. Cơ chế **Lắp ráp sinh học** bắt đầu. Con kiến đầu tiên sẽ đứng cắn chặt vào viên đường chờ. Con số này đếm xem bao nhiêu cá thể đang bám vào cục đường chờ đủ quân số.
*   **Kéo mồi tập thể (Carrying):** Số lượng kiến thực tế đang đồng bộ dùng hàm kéo tụt cục lượng đường về cái tổ trung tâm.
*   **Chiến binh tự vệ**: Những con kiến đang ở trạng thái kích động lao thẳng vào Kẻ xâm nhập.
*   **Quy Tiên**: Rất tiếc, kiến cũng có thanh máu. Khi làm việc kiệt sức không bù nước, hoặc đánh nhau dính sát thương nọc độc từ kẻ thù, một số cá thể sẽ gục ngã biến thành xác (đổi màu thành đen xám). Lúc này **Cơ chế An Táng Đồng Loại (Necrophoresis)** tự động kích hoạt. Sẽ có những cô kiến thợ dọn dẹp nhặt xác đem quẳng ra nghĩa địa (Góc ngoài cùng bên phải, biểu tượng 🪦).

> **💡 Cơ chế Bí mật: "Sinh Khôi Phục Quân Số"**
> Khi khối đường được mang thành công về lỗ tổ (`-70, -70`), điểm "Lương thực dự trữ" ở bảng Điều khiển bên trái sẽ +1. Cứ mỗi 3 Lương thực, vương quốc sẽ **ấp nở ra 1 cá thể kiến thợ hoàn toàn mới**, tăng dân số tối đa cho tổ từ đàn 20 con ban đầu!

---

## 3. Hệ Thống Dò Vi Sinh Mục Tiêu (Focus Panel)
Đây là công cụ **Trực Quan Hóa Khoa Học** (Science Visualization) siêu xịn xò của module!

**Cách dùng:** Trên bản đồ 3D, hãy **Click trực tiếp** hoặc chạm vào bất kỳ cá thể kiến lửa nào đang di chuyển!  
Ngay lập tức, **Focus Panel** (Chế độ khóa mục tiêu) sẽ bung ra.

Khung chứa này sẽ cho bạn:
1.  **Dữ Liệu Huyết Khí:** Nó là loại cấp bậc gì (Tướng/Thợ).
2.  **Trạng thái Máy Trạng Thái Hữu Hạn (FSM):** Hiển thị bộ mã Não bộ hiện tại của nó (Ví dụ: `Bio State: EVALUATING`, `CARRYING`, `FLEEING_RAIN`...).
3.  **Diễn giải Chuyên Sâu:** Biến đoạn code máy học vô tri thành đoạn hội thoại sinh thái học. Giải nghĩa hành động đó bằng khoa học bằng tiến Việt.
4.  **📚 Liên kết sâu Bách Khoa (Readmore):** Quan trọng nhất! Sẽ có một đường link màu xanh hiện ra như: `ĐỌC CHI TIẾT TRONG BÁCH KHOA →`. Khi dọng nút bấm đó, bạn sẽ ngay lập tức được "Bắn" vào bộ Bách Khoa Toàn Thư kiến Lửa, dừng chính xác tại Dòng Giải Thích Toán Học, Vật Lý và Sinh học của hành động bạn đang soi! (Đỉnh móp!).
5.  **🎥 Theo Dõi Camera (Tracking Mode):** Nút này ép Camera 3D vĩnh viễn khóa chặt và tự động bay lượn theo đuôi của cá thể Ant được chọn. Bạn sẽ trải nghiệm góc nhìn thứ nhất (FPS) của kiến như phim hành động!

---

*Chúc các bạn có những giờ phút "Hóa thân thành Đấng Sáng Tạo Trí Tuệ Não Bộ Phức Tạp" tuyệt vời nhất trong module 3D này!*
