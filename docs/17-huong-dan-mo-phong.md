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
> Khi khối đường được mang thành công về lỗ tổ (`-70, -70`), điểm "Lương thực dự trữ" (Nutrition) ở bảng Điều khiển bên trái sẽ tăng tương ứng với kích thước mồi (1–4 điểm, hoặc 20 điểm từ xác nhện). Cứ mỗi **2 điểm Nutrition**, vương quốc sẽ **ấp nở ra 1 cá thể kiến mới** (tối đa 50 thực thể trực tiếp trên mặt đất và tự động tái chế vòng đời khi có cá thể quy tiên)!

---

## 3. Hệ Thống Dò Vi Sinh Mục Tiêu (Focus Panel)
Đây là công cụ **Trực Quan Hóa Khoa Học** (Science Visualization) siêu xịn xò của module!

**Cách dùng:** Trên bản đồ 3D, hãy **Click trực tiếp** hoặc chạm vào bất kỳ cá thể kiến lửa nào đang di chuyển!  
Ngay lập tức, **Focus Panel** (Chế độ khóa mục tiêu) sẽ bung ra.

Khung chứa này sẽ cho bạn:
1.  **Dữ Liệu Huyết Khí & Sinh Năng Lượng:** Cấp bậc giai cấp (Tướng `2.83 MEU` / Thợ `1.00 MEU`).
2.  **Trạng thái Máy Trạng Thái Hữu Hạn (FSM):** Hiển thị bộ mã Não bộ hiện tại của nó (Ví dụ: `Bio State: FOOD_RECRUITMENT`, `GREETING`, `ALARMED`, `HUNGRY`...).
3.  **Diễn giải Chuyên Sâu:** Biến đoạn code máy học vô tri thành đoạn hội thoại sinh thái học, giải nghĩa hành động đó bằng ngôn ngữ khoa học tiếng Việt.
4.  **📚 Liên kết sâu Bách Khoa (Readmore):** Quan trọng nhất! Sẽ có một đường link màu xanh hiện ra như: `ĐỌC CHI TIẾT TRONG BÁCH KHOA →`. Khi nhấn nút bấm đó, bạn sẽ ngay lập tức được chuyển vào bộ Bách Khoa Toàn Thư Kiến Lửa, dừng chính xác tại chương giải thích Toán học, Vật lý và Sinh học của hành động bạn đang quan sát.
5.  **🎥 Theo Dõi Camera (Tracking Mode):** Nút này khóa tâm Camera 3D tự động trượt mượt (`lerp`) theo cá thể kiến được chọn.

---

## 4. Bộ Điều Chỉnh Môi Trường (Sliders)

Ba thanh trượt ở phần dưới bảng điều khiển cho phép bạn thay đổi điều kiện môi trường theo thời gian thực:

- 🍬 **Tốc độ Mồi ($F \in [0, 10]$):** Tần suất thức ăn tự động rơi xuống bản đồ. Quyết định trực tiếp sức chứa dinh dưỡng $K_{\text{trophic}}$.
- 💧 **Độ Khô/Ẩm ($W \in [0, 10]$):** Điều chỉnh độ thiếu hụt áp suất hơi nước (**VPD — Vapor Pressure Deficit**). Giảm thấp làm tăng tốc độ mất nước qua lớp biểu bì (cuticle) và giảm sức chứa thủy văn $K_{\text{hydro}}$.
- 🕷️ **Sinh Kẻ Thù ($E \in [0, 10]$):** Tần suất thiên địch (nhện độc) xâm nhập lãnh thổ, gây hao hụt quần thể theo hàm đáp ứng chức năng **Holling Type II**.

---

## 5. Nhịp Sinh Học 4 Buổi (Sáng · Trưa · Chiều · Tối) & Quyền Năng Thượng Đế (6 Thảm Họa Thời Tiết)

Trong tự nhiên, loài kiến lửa nhiệt đới *Solenopsis geminata* là sinh vật biến nhiệt (*ectotherm*) có hành vi kiếm ăn lưỡng cực (*bimodal foraging activity*) phụ thuộc chặt chẽ vào bức xạ mặt trời, nhiệt độ mặt đất $T_{\text{soil}}$ và độ thiếu hụt áp suất hơi nước VPD (Porter & Tschinkel, 1987 [2]; Cokendolpher & Francke, 1985 [14]). Người dùng đóng vai trò là **Đấng Sáng Thế (Omnipotent God Mode)**: bạn có thể để chu kỳ ngày–đêm tự động vận hành (`🔄 Tự chuyển 24h`) hoặc **cưỡng chế khóa cứng bất kỳ buổi nào / kích hoạt bất kỳ thảm họa thời tiết nào** ngay lập tức.

### 5.1 Cơ Chế Sinh Lý & Hành Vi Qua 4 Buổi Trong Ngày

| Buổi Sinh Học | Nhiệt Độ Đất $T_{\text{soil}}$ | Cơ Chế Sinh Học & Thích Nghi Của Bầy Kiến (*Solenopsis geminata*) |
| :--- | :---: | :--- |
| **🌅 Buổi Sáng (`morning`)** | $\approx 28^\circ\text{C}$ | **Đỉnh kiếm ăn thứ nhất & Phơi nắng sưởi ấm (`basking`):** Ánh nắng xiên góc ấm áp và sương sớm giúp giảm mất nước biểu bì (`0.65×`), Pheromone bền mùi (`0.75×` tốc độ bay hơi), tốc độ chạy tăng `+15%`. Một nhóm Kiến Thợ tập trung quanh vành gò tổ đón nắng để hấp thụ bức xạ hồng ngoại vào dịch huyết tương (*haemolymph*) rồi truyền nhiệt ấm xuống buồng ấp. |
| **☀️ Buổi Trưa (`noon`)** | $\approx 39^\circ\text{C}$ | **Tránh nắng gắt & Tìm bóng râm (`shade_seeking`):** Mặt trời đứng bóng làm mặt đất nóng sát ngưỡng nhiệt cực đại sinh lý ($CT_{\max} \approx 43.5^\circ\text{C}$). Mất nước tăng vọt `2.3×` và Pheromone bay hơi nhanh `1.8×`. Khoảng $45\%$ Kiến Thợ Nhỏ (`Minor`, $1.0\text{ mg}$) tự động rút lui vào **7 vùng vi khí hậu bóng râm dưới tán bụi cây và hốc đá** (hiển thị vòng tròn mát xanh lá) để tránh sốc nhiệt, trong khi nhóm ngoài nắng chạy nước rút (`+18%` tốc độ) giữa các điểm bóng râm. |
| **🌇 Buổi Chiều (`afternoon`)** | $\approx 31^\circ\text{C}$ | **Đỉnh kiếm ăn thứ hai & Tăng tốc tích trữ:** Nắng dịu dần, kiến từ các hốc bóng râm đồng loạt ùa ra. **Kiến Tướng (`Major`) tăng `+35%` công suất nghiền hạt cứng (`milling`)**, các đội **khiêng mồi hợp tác chạy nhanh thêm `+18%`**, và bán kính phát hiện xác đồng đội để dọn nghĩa địa (**Necrophoresis**) mở rộng thêm `+45%` trước khi trời tối. |
| **🌙 Buổi Tối (`night`)** | $\approx 21^\circ\text{C}$ | **Hạ thân nhiệt đêm, Đom đóm & Cụm giữ nhiệt bảo vệ tổ (`nocturnal_guard`):** Bầu trời đêm xuất hiện Mặt Trăng và 45 đom đóm phát sáng sinh học. Thân nhiệt kiến giảm làm tốc độ di chuyển còn `0.74×`, nhưng tiết kiệm `-40%` năng lượng và `-65%` nước. Tầm nhìn quang học của mắt kép giảm còn `0.55×`, bù lại **độ nhạy khứu giác râu với Pheromone tăng `+45%`**. Kiến Lính và Kiến Thợ co cụm quanh cửa tổ và Kiến Chúa để giữ nhiệt $28\text{–}30^\circ\text{C}$, trong khi thiên địch nhện săn đêm tăng `+30%` tốc độ và sát thương. |

### 5.2 Quyền Năng Thượng Đế: 6 Chế Độ Thời Tiết & Thảm Họa Tự Nhiên

1. **🌤️ Quang Đãng (`clear`):** Điều kiện khí quyển tiêu chuẩn theo đúng nhịp sinh học 4 buổi.
2. **🌧️ Mưa Rào (`rain`):** Mưa lớn (600 hạt mưa GPU) rửa trôi hoàn toàn các vệt Pheromone trên mặt đất (`18.5×` tốc độ suy giảm). Kiến lập tức dừng kiếm ăn, chạy về lỗ tổ (`-70, -70`) để trú ẩn dưới lòng đất (`hiding` / `hidden_inside`).
3. **🌬️ Gió Bão (`windstorm`):** Luồng gió giật và bão cát (160 vệt bụi GPU + cỏ cây nghiêng ngả) thổi trôi lệch tọa độ các phân tử Pheromone theo chiều gió. Đặc biệt, kích hoạt **Phản xạ hướng gió cắn cỏ neo trụ (`wind_anchoring` — Anemotactic Mandibular Anchoring)**: Kiến Thợ Nhỏ ($1.0\text{ mg}$) lập tức hạ thấp trọng tâm và dùng hàm dưới cắn chặt vào gốc cỏ/mặt đất để không bị thổi bay, trong khi Kiến Tướng ($4.0\text{ mg}$) nặng gấp 4 lần vẫn lầm lũi bước đi làm tường chắn gió.
4. **🌪️ Lốc Xoáy (`tornado`):** Siêu vòi rồng 3D đa tầng kèm 85 mảnh vỡ xoáy trôn ốc trên GPU.
   - **Tương tác Thượng Đế:** Khi đang bật `🌪️ Lốc Xoáy`, bạn có thể **nhấp chuột trực tiếp lên bất kỳ vị trí nào trên mặt đất 3D** để chỉ huy tâm vòi rồng di chuyển tới càn quét vị trí đó!
   - **Cơ chế vật lý & sinh học (`airborne_vortex`):** Kiến và thức ăn nằm trong bán kính mắt bão ($r < 15\text{ m}$) bị lực khí động học nhấc bổng lên không trung (tới độ cao $y = 16\text{ m}$) và cuốn xoay tròn 3 chiều theo quỹ đạo xoắn ốc. Nhờ tỷ lệ diện tích bề mặt trên khối lượng lớn và vận tốc rơi giới hạn nhỏ (*low insect terminal velocity* $\approx 1.8\text{ m/s}$), đa số kiến sống sót sau khi văng ra khỏi phễu lốc và đáp xuống đất, dù bị choáng và mất một phần máu va đập!
5. **🔥 Nắng Hạn (`heatwave`):** Sóng nhiệt cực đoan làm nhiệt độ mặt đất tăng thêm $+7^\circ\text{C}$, tốc độ mất nước qua biểu bì tăng `3.8×` và Pheromone bay hơi nhanh `2.6×`. Đàn kiến buộc phải rút vào bóng râm dưới 7 bụi cây hoặc cử đội hình chạy khẩn cấp ra hồ nước ngọt (`60, 40`) uống nước cứu tổ.
6. **🌊 Đại Hồng Thủy (`flood`):** Nước lũ dâng cao nhấn chìm toàn bộ lãnh thổ. Toàn bộ vương quốc kích hoạt cơ chế **Kết bè sống kỵ nước (`rafting` — Cassie–Baxter State)** (Mlot et al., 2011 [15]): dùng móng vuốt *tarsal claws* khóa chặt vào nhau quanh Kiến Chúa để tạo thành chiếc bè nổi không thấm nước.

---

## 6. Mô Hình Ngoại Suy Sinh Thái & Dị Tốc 5 Tầng (5-Layer Biophysical & Allometric Extrapolation Engine)

Thay vì nhân tuyến tính bằng một hằng số cố định (vốn mắc 4 sai lầm sinh thái học nghiêm trọng: nhân cả Kiến Chúa theo diện tích, bỏ qua biến thiên nhiệt–ẩm của tỷ lệ xuất quân bề mặt, đánh đồng tỷ lệ phân tầng của các giai cấp, và cộng tuyến tính trao đổi chất), hệ thống mô phỏng tích hợp **Phòng Lab Ngoại Suy Sinh Thái & Dị Tốc 5 Tầng (`📐 Phòng Lab Ánh Xạ & Ngoại Suy Thực Địa`)** dựa trên các công trình thực nghiệm kinh điển [1]–[12].

### 5.1 Tầng 1: Tích Phân Cực 2D Độ Dốc Suy Giảm Mật Độ Tâm–Biên (2D Polar Radial Integration)

Trên lãnh thổ kiếm ăn hình tròn tương đương có diện tích $A_{\text{terr}} \in [15, 120]\text{ m}^2$ (bán kính $R_{\text{terr}} = \sqrt{A_{\text{terr}}/\pi}$), mật độ kiến thợ kiếm ăn bề mặt giảm theo hàm mũ từ gò tổ ra biên giới lãnh thổ theo lý thuyết **Central-Place Foraging** (Orians & Pearson, 1979 [3]; Adams & Tschinkel, 2001 [4]):

$$D(r) = D_0 \cdot e^{-\lambda r}$$

Hệ số suy giảm $\lambda$ ($\text{m}^{-1}$) biến thiên động theo cấu trúc xã hội (**Monogyne** $\lambda_0 = 0.41\text{ m}^{-1}$ so với **Polygyne** $\lambda_0 = 0.29\text{ m}^{-1}$ do mạng lưới gò tổ đa chúa phân tán [10]) và cường độ đường mòn Pheromone đang hoạt động ($N_{\text{trail}}$):

$$\lambda(F, N_{\text{trail}}) = \max\!\Big(0.18,\ \lambda_0 - 0.007 F - 0.0035 \min(25, N_{\text{trail}})\Big)$$

Tích phân chính xác trong hệ tọa độ cực 2D trên toàn bộ đĩa lãnh thổ $r \in [0, R_{\text{terr}}]$ (được chuẩn hóa tại vị trí đặt khung Quadrat cận tổ $r_{\text{quad}} = 0.72\text{ m}$) cho hệ số hiệu chỉnh không gian giải tích:

$$\eta_{\text{spatial}}(\lambda, R_{\text{terr}}) = \frac{1}{\pi R_{\text{terr}}^2} \int_0^{2\pi}\!\!\int_0^{R_{\text{terr}}} e^{-\lambda(r - r_{\text{quad}})}\,r\,dr\,d\theta = \frac{2}{(\lambda R_{\text{terr}})^2}\Big[1 - (1 + \lambda R_{\text{terr}})e^{-\lambda R_{\text{terr}}}\Big] e^{\lambda r_{\text{quad}}}$$

> [!IMPORTANT]
> **Loại trừ Kiến Chúa khỏi phép nhân không gian:** Chỉ các phân lớp vô sinh kiếm ăn trên bề mặt (`Minor`, `Soldier`, `Major`) mới được nhân với hệ số diện tích hiệu dụng $M_{\text{surface}} = (A_{\text{terr}} / A_{\text{sim}}) \cdot \eta_{\text{spatial}}$. **Kiến Chúa (`Queen`, ID `#0`)** là trung tâm sinh sản tại tâm tổ nên tuyệt đối không nhân theo diện tích mặt đất mà được xác định bởi cấu trúc xã hội (**Đơn chúa Monogyne** = $1$ Chúa; **Đa chúa Polygyne** = $6$ Chúa [10]).

---

### 5.2 Tầng 2: Ma Trận Nghịch Đảo Horvitz–Thompson Phân Tầng Theo Giai Cấp & Vi Khí Hậu

Các nghiên cứu đào tổ toàn phần của Porter & Tschinkel (1987) [2] và Tschinkel (2006) [11] chỉ ra hai quy luật cốt lõi:
1. **Phụ thuộc Nhiệt – Ẩm (Thermal–Hydric Modulation):** Tỷ lệ kiến xuất quân lên mặt đất tuân theo đường cong sinh lý nhiệt Gaussian đạt cực đại quanh $T_{\text{opt}} = 30.0^\circ\text{C}$ ($\sigma_T = 7.5^\circ\text{C}$) kết hợp với độ ẩm chống mất nước biểu bì $W$:
   $$\phi(T_{\text{soil}}, W) = \exp\!\left(-\frac{(T_{\text{soil}} - 30.0)^2}{2 \times 7.5^2}\right) \cdot \left(0.62 + 0.38 \cdot \frac{W}{10}\right)$$
2. **Bất đối xứng Phân tầng theo Giai cấp (Differential Caste Stratification):** Các giai cấp không xuất hiện trên mặt đất với tỷ lệ giống nhau:
   - **Kiến Thợ (`Minor`):** $f_{\text{minor}}(T,W) = 0.19 \cdot \phi(T,W)$ ($\sim 81\%$ ở dưới hầm ngầm chăm sóc ấu trùng và đào đất).
   - **Kiến Lính (`Soldier / Media`):** $f_{\text{soldier}}(T,W) = 0.27 \cdot \phi(T,W)$ (tập trung tuần tra dày đặc ở vành đai cửa tổ và đường mòn).
   - **Kiến Tướng (`Major`):** $f_{\text{major}}(T,W) = 0.14 \cdot \phi(T,W)$ ($\sim 86\%$ ở sâu trong các kho hạt ngầm để nghiền hạt và làm *repletes* dự trữ lipid).

Do đó, quân số thực tế của từng giai cấp trong toàn tổ (Bề mặt + Ngầm) được khôi phục qua phép nghịch đảo xác suất quan sát Horvitz–Thompson:

$$N_{\text{colony},c} = \frac{N_{\text{surface},c}}{f_c(T_{\text{soil}}, W)}, \quad c \in \{\text{minor}, \text{soldier}, \text{major}\}$$

Đồng thời, hệ thống ước lượng **Quần thể Ấu trùng & Nhộng ngầm (Subterranean Brood: Trứng, Ấu trùng tuổi I–IV, Nhộng)** theo tỷ lệ sinh khối ấu trùng của Markin et al. (1973) [1].

---

### 5.3 Tầng 3: Sinh Năng Lượng Học Dị Tốc 2 Cấp Kleiber–Hou ($M^{0.81}$) & Động Học Arrhenius

Hệ thống phân biệt rõ **2 cấp độ dị tốc trao đổi chất**:
1. **Cấp cá thể trên ô mẫu vi mô (Kleiber, 1932 [5]):** $B_i \propto m_i^{0.75}$, quy đổi ra **Đơn vị Trao đổi chất Tương đương (MEU)**:
   - `Minor` ($1.0\text{ mg}$) = $\mathbf{1.00\text{ MEU}}$
   - `Soldier` ($2.2\text{ mg}$) = $(2.2/1.0)^{0.75} \approx \mathbf{1.81\text{ MEU}}$
   - `Major` ($4.0\text{ mg}$) = $(4.0/1.0)^{0.75} \approx \mathbf{2.83\text{ MEU}}$
   - `Queen` ($14.2\text{ mg}$) = $(14.2/1.0)^{0.75} \approx \mathbf{7.32\text{ MEU}}$
2. **Cấp siêu sinh vật toàn vương quốc (Hou et al., 2010 *PNAS* [6]; Gillooly et al., 2001 *Science* [12]):**
   Tổng công suất trao đổi chất của toàn bộ tập đoàn kiến không tăng tuyến tính với tổng khối lượng mà tuân theo **định luật lũy thừa siêu sinh vật bậc $\beta = 0.81$** nhân với thừa số hoạt hóa nhiệt động học Boltzmann–Arrhenius ($E_a = 0.65\text{ eV}$):
   $$P_{\text{colony}}\text{ (mW)} = B_0 \cdot \left(M_{\text{fresh,total}}\right)^{0.81} \cdot \exp\!\left(-\frac{E_a}{k_B}\left(\frac{1}{T_K} - \frac{1}{298.15}\right)\right)$$
   Từ đó suy ra tổng ngân sách năng lượng tiêu thụ mỗi ngày ($\text{kJ/ngày}$) và khối lượng con mồi/carbohydrate tương đương mà vương quốc phải thu thập mỗi ngày ($\text{g/ngày}$).

---

### 5.4 Tầng 4: Định Luật Lũy Thừa Taylor & Khoảng Tin Cậy Thống Kê $95\%$ ($\pm\text{CI}_{95\%}$)

Trong sinh thái học định lượng, các cá thể kiến di chuyển theo đường mòn Pheromone tạo ra phân bố quần tụ không gian (*aggregated spatial distribution*) tuân theo **Định luật Lũy thừa Taylor** (Taylor, 1961 [13]):

$$\sigma^2 = a \cdot \mu^b \quad (a = 0.62,\ b = 1.44 > 1)$$

Hệ thống tính trực tiếp **Sai số chuẩn tương đối ($\text{RSE}$)** có hiệu chỉnh quần thể hữu hạn $\text{FPC} = 1 - A_{\text{sim}}/A_{\text{terr}}$ và xuất ra **Khoảng tin cậy $95\%$ ($\text{CI}_{95\%}$)**:

$$N_{\text{colony}} \pm 1.96 \cdot \text{RSE} \cdot N_{\text{colony}}$$

---

### 5.5 Tầng 5: Sức Chứa Cực Đại Liebig – Holling Type II (Resource-Bounded Carrying Capacity)

Hệ thống xác định ngưỡng sức chứa cực đại dựa trên sự kết hợp giữa **Định luật Tối thiểu Liebig (Liebig's Law of the Minimum)**, **Áp lực Khô hạn VPD** [7] và **Hàm Đáp ứng Chức năng Săn mồi Holling Type II** (Holling, 1959) [8]:

$$K_{\max}^{\text{MEU}} = \min\!\Big(K_{\text{trophic}}(F),\ K_{\text{hydro}}(W),\ K_{\text{space}}\Big) \times \left(1 - \frac{P_{\max} \cdot E}{E_{1/2} + E}\right)$$

---

## 7. Tài Liệu Tham Khảo Khoa Học (References)

1. **[1]** G. P. Markin, J. O'Neal, and J. Dillier, "Foraging tunnels of the red imported fire ant, *Solenopsis invicta*," *Journal of the Kansas Entomological Society*, vol. 48, no. 1, pp. 83–89, 1975.
2. **[2]** S. D. Porter and W. R. Tschinkel, "Foraging in *Solenopsis invicta* (Hymenoptera: Formicidae): effects of weather and season," *Environmental Entomology*, vol. 16, no. 3, pp. 802–808, 1987.
3. **[3]** G. H. Orians and N. E. Pearson, "On the theory of central place foraging," in *Analysis of Ecological Systems*, Columbus, OH: Ohio State Univ. Press, 1979, pp. 155–177.
4. **[4]** E. S. Adams and W. R. Tschinkel, "Spatial density dependence in colonies of the fire ant *Solenopsis invicta*," *Journal of Animal Ecology*, vol. 70, no. 3, pp. 355–369, 2001.
5. **[5]** M. Kleiber, "Body size and metabolism," *Hilgardia*, vol. 6, no. 11, pp. 315–353, 1932.
6. **[6]** C. Hou, M. Kaspari, H. B. Vander Zanden, and J. F. Gillooly, "Energetic basis of colonial living in social insects," *Proceedings of the National Academy of Sciences (PNAS)*, vol. 107, no. 8, pp. 3634–3638, 2010.
7. **[7]** W. G. Hood and W. R. Tschinkel, "Desiccation resistance in arboreal and terrestrial ants," *Physiological Entomology*, vol. 15, no. 1, pp. 23–35, 1990.
8. **[8]** C. S. Holling, "Some characteristics of simple types of predation and parasitism," *The Canadian Entomologist*, vol. 91, no. 7, pp. 385–398, 1959.
9. **[9]** M. Burd, D. Archer, N. Aranwela, and D. J. Stradling, "Traffic dynamics of the leaf-cutting ant, *Atta cephalotes*," *The American Naturalist*, vol. 159, no. 3, pp. 283–293, 2002.
10. **[10]** E. L. Vargo and D. J. C. Fletcher, "On the relationship between queen number and fecundity in polygyne colonies of the fire ant *Solenopsis invicta*," *Physiological Entomology*, vol. 14, no. 2, pp. 223–232, 1989.
11. **[11]** W. R. Tschinkel, *The Fire Ants*. Cambridge, MA: Belknap Press of Harvard University Press, 2006.
12. **[12]** J. F. Gillooly, J. H. Brown, G. B. West, V. M. Savage, and E. L. Charnov, "Effects of size and temperature on metabolic rate," *Science*, vol. 293, no. 5538, pp. 2248–2251, 2001.
13. **[13]** L. R. Taylor, "Aggregation, variance and the mean," *Nature*, vol. 189, pp. 732–735, 1961.
14. **[14]** J. C. Cokendolpher and O. F. Francke, "Temperature preferences of four species of fire ants (Hymenoptera: Formicidae: *Solenopsis*)," *Psyche*, vol. 92, pp. 91–101, 1985.
15. **[15]** N. J. Mlot, C. A. Tovey, and D. L. Hu, "Fire ants self-assemble into waterproof rafts to survive floods," *Proceedings of the National Academy of Sciences (PNAS)*, vol. 108, no. 19, pp. 7669–7674, 2011.
