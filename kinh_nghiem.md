# 🐜 Nhật Ký Kinh Nghiệm Phát Triển (Lessons Learned)

Đây là tài liệu tổng hợp toàn bộ những bài học kỹ thuật, những lỗi "xương máu" và các giải pháp đã được áp dụng trong quá trình xây dựng dự án **Kiến Lửa Wiki** và **Phòng Mô Phỏng Đàn Kiến 3D (Ant Simulation)**. Tài liệu này đóng vai trò như một "kinh thánh" để bảo trì dự án và nâng cấp về sau.

---

## 1. Vấn đề "Infinite Render Loop" trong React Three Fiber
**📝 Tình trạng:** Toàn bộ bản vẽ WebGL bị đứng máy, sập GPU (Lỗi `THREE.WebGLRenderer: Context Lost`) khi người dùng bấm nút ép tương tác (Ép uống nước / Ép giao tiếp).
**🔍 Nguyên nhân:** 
Hành động click gọi các hàm cập nhật State (`setState` của React) ngay trong lõi vòng lặp vô tận `useFrame` (vốn chạy 60 FPS). Điều này khiến cơ chế render của React liên tục đá nhau với cơ chế vẽ WebGL, tạo ra vòng lặp vô hạn. Hơn nữa, việc callback gọi ngược lên component cha (`onForceDrinkDone`) ngay bên trong một microtask cũng góp phần xóa sổ queue update của React.
**💡 Giải pháp rút ra:**
- Tuyệt đối KHÔNG gán/thay đổi trạng thái liên quan đến Component Cha-Con từ bên trong `useFrame`.
- Các nút bấm ngoại vi muốn can thiệp vào mô phỏng phải thông qua các biến trung gian (`forceDrink`, `forceComm`).
- Sử dụng `useEffect` kẹp phía trên để lắng nghe khi biến `force` thay đổi, cập nhật `state` một lần duy nhất, sau đó để `useFrame` tự động nương theo `state` mới.
- Chỉ kích hoạt hàm callback báo ngược lại cho Cha (`onForceDrinkDone`) khi hành động đã **hoàn tất**, tránh gọi đồng thời với lúc khởi tạo State.

---

## 2. Lỗi "Lú Lẫn Mục Tiêu" Của AI (Target Locking vs Retargeting)
**📝 Tình trạng:** Hai con kiến kiên quyết băng qua một đống đường ngay trước mặt để đi lấy cục đường ở "tít mù khơi" (hoặc rớt giữa hồ nước). Khi đang kéo mồi lại đi giật ngược lại.
**🔍 Nguyên nhân:**
Cỗ máy trạng thái (State Machine) của kiến được lập trình theo kiểu "khoá mục tiêu" (Target Lock). Ngay khi phát hiện mồi đầu tiên, nó ưu tiên hoàn thành kịch bản Trophallaxis (Gọi bầy) nên lờ đi mọi đồ ăn gần hơn. Và khi đang thực hiện việc đi cùng nhau (`food_both_approach`), nếu ta dùng thước đo để đo lại khoảng cách và phát hiện có vật ở quá xa (ví dụ hụt chân vì vướng tảng đá), hàm điều kiện cũ đã bắt nó quay lại giai đoạn "Đi tìm đường".
**💡 Giải pháp rút ra:**
- Áp dụng **Dynamic Retargeting**: Liên tục kiểm tra lại vật thể gần nhất ngay cả khi đang trong hành trình (trạng thái `finder_approach`, `both_approach`).
- Bảo vệ State (State Guard): Một khi trạng thái đã lọt vào bước cuối cùng `food_both_approach` (2 con đã xác nhận đang cùng đi tới đồ ăn), nghiêm cấm reset lùi lại trạng thái `food_finder_approach` cho dù phép đo khoảng cách có bị thay đổi đột ngột vì ngoại cảnh (tránh UI chữ nhấp nháy, ant flicker).

---

## 3. Quy Tắc Ảo Giác Không Gian Khi Tránh Vật Cản (NavMesh)
**📝 Tình trạng:**
1. Kiến rớt luôn món đồ ăn, cố tìm viên đường mà người dùng rớt thẳng VÀO giữa lòng hồ.
2. Cái đầu kiến khi uống nước lại quá xa mép hồ.
**🔍 Nguyên nhân:** 
Thuật toán `resolvePhysics` luôn tạo ra một màng bảo vệ vòng ngoài bằng công thức `r + 2`. Màng này cản không cho tâm (vị trí gốc) của kiến lọt vào khu vực cấm. Nhưng vì thế, viên đồ ăn lọt vào trong hồ sẽ không bao giờ được với tới (vì kiến chỉ đi được tới biên màng). Khoảng cách dừng cũng bị hụt vì bán kính hồ + bán kính kiến đá nhau.
**💡 Giải pháp rút ra:**
- Khi user thả đồ ăn (`handleClick`), ngay lập tức thiết lập hàm tính toán kiểm tra nếu click vào Vùng OOB (Out-of-bound / Chướng ngại vật), thì phải đẩy toạ độ viên đường DẠT vào bờ (`r + 2.5`). Đảm bảo mọi vật phẩm sinh ra đều có thể tiếp cận bằng vật lý.
- Tinh chỉnh mặt nước phân tách (Visual vs Physics Radius): Mô hình nước có thẻ `r=20`, nhưng Physics của nó tôi hạ xuống `r=18`. Do đó màng chặn sẽ đẩy tâm của kiến dừng lại ở mức cách tâm kích thước `18 + 2 = 20.0`. Lúc này, hai chân trước và râu kiến sẽ chạm ngay sát mặt line nước, tạo hiện tượng uống nước cực kỳ chân thực.

---

## 4. Xung Đột React UI & Procedural Animation (Animation Overloading)
**📝 Tình trạng:**
Kiến uống nước hay gọi bầy xong thì bị... trượt patin (gliding) không động đậy chân.
**🔍 Nguyên nhân:**
Hoạt ảnh từ tệp xương mô hình (Skeleton) đang được gán trộn lẫn vào với quy trình điều khiển khung (Frame). Khi kiến đi tới nơi và bẻ góc người, kích hoạt hoạt ảnh `Idle` (Cong râu và cúi đầu, cắn hàm liên tục), khi kết thúc `stateTimer` nó lại bị trả về lệnh di chuyển TỌA ĐỘ nhưng không ai nhớ gọi lại hàm `setAnim('walk_1')`.
**💡 Giải pháp rút ra:**
Mọi sự chuyển đổi trạng thái (Transition State) phải khai báo đầy đủ 4 thứ:
1. `setState` (Lõi kịch bản chính).
2. `setBioState` (Xử lý hiệu ứng sinh học thủ công như đầu, hàm, râu).
3. `setAnim` (Chuyển lệnh xương nội suy Mixamo đi bộ hay đứng yên).
4. `setStatusText` (Ngoại vi UI báo cáo cho con người).

---

## 5. Ác Mộng Của "GitHub Actions" (Lỗi Legacy Peer Deps)
**📝 Tình trạng:** `npm run build` trên máy local bao đẹp, nhưng đưa lên máy chủ GitHub để build Github Pages (CI/CD) lại liên tục Lỗi vỡ mặt (Failed x5 lần).
**🔍 Nguyên nhân:**
CI của Github dùng lệnh `npm ci`. Lệnh này mang tính soi mói tàn bạo, nó phân tích tất cả các gói vệ tinh. Ở dự án này, `@google/model-viewer` (3D tĩnh) cần `Three.js` phiên bản `^0.182.0`, trong khi bộ sandbox `@react-three/fiber` lại xài bản ThreeJS mới khác. GitHub nhận định đây là "Xung đột phe phái" (Peer Dependency Conflict) nên huỷ luôn.
**💡 Giải pháp rút ra:**
Sửa file `deploy.yml` từ `run: npm ci` thành `run: npm ci --legacy-peer-deps` để ra lệnh cho Node: "Cứ gom tất cả vào mà chạy, đừng xét nét về họ hàng họ hàng phụ thuộc".

---

## 6. Giao Diện Đáp Ứng Trên Mobile (Mobile Tailwind UX)
**📝 Tình trạng:** Màn hình ngang của Máy tính rất trống trải, nhưng lên điện thoại, bản vẽ Canvas WebGL nuốt trọn màn hình, các bảng hiển thị văn bản lấn át, không che nhỏ lại, thanh kéo làm vỡ bề ngang làm rớt thẻ (horizontal overflow).
**💡 Giải pháp rút ra:**
- Loại bỏ hoàn toàn slider zoom cổ điển, thay bằng D-Pad điều hướng mượt.
- Nhỏ hoá Bảng Thông Tin (Info Panel) lại và gắn nó xuống góc Trái-Dưới của Mobile để thuận tay cái. (Dùng `bottom-4` cho `md:` và `top-4` cho desktop).
- Ở các nút Click Tức thời (Action Button), không nên tráng màu cứng (Hardcode Color) mà phải dùng biến điều kiện động theo `simState`. Để khi người dùng click vào mới nháy sáng, không gây hiểu lầm với các nút Kích hoạt Chế độ (Mode Toggles).

---

## 7. Bài Toán Căn Chỉnh Hướng 3D Gốc (Auto Calibration)
**📝 Tình trạng:** Khi đưa model `gltf` từ Blender hoặc Sketchfab vào React Three Fiber, con kiến thường bị lộn ngược, nghiêng 90 độ, hoặc đâm đầu xuống đất quay vòng tròn ảo diệu. Dùng lệnh thủ công `rotation={[-Math.PI/2, 0, 0]}` không bao giờ chính xác tuyệt đối, mỗi khi kiến quay đầu nó lại lảo đảo nghiêng đổ.
**🔍 Nguyên nhân:** 
Hệ trục toạ độ gốc (Root Node) của các file nguồn (gltf) do nghệ sĩ tạo ra thường không đồng nhất (Z-Up so với Y-Up). Các khớp xương (Bones) cũng nằm ở mọi hướng toạ độ kỳ quái, làm cho lệnh tính hàm `Math.atan2(dir.x, dir.z)` để hướng đầu con kiến đi về mục tiêu bị sai lệch hoàn toàn so với mặt đất.
**💡 Giải pháp rút ra:**
Thay vì đoán mò góc xoay, ta **tính toán hình học giải tích 3 chiều tự động 100% bằng Ma trận (Basis Matrix):**
1. Giải nén toàn bộ khung xương con kiến, lấy chính xác toạ độ Tuyệt đối (World Position) của 4 chân bám đất xa nhất: 2 chân trước (`FL, FR`) và 2 chân sau (`HL, HR`).
2. Tính trung điểm của 2 chân trước và 2 chân sau để vẽ ra một đường thẳng "Xương sống gầm" -> Khẳng định đây là hướng **Tới (Forward)**.
3. Kéo 3 điểm (Tâm chân trước, chân sau trái, chân sau phải) để tạo thành một Mặt phẳng toạ độ (Plane). Dùng tích có hướng (Cross Product) để tính ra vector Vuông góc hướng thẳng lên trời -> Khẳng định đây là chân lý cho hướng **Nóc (Up)**.
4. Lấy Tới x Nóc = Hướng **Phải (Right)**.
5. Setup `Matrix4().makeBasis(right, up, forward)`, dùng `.invert()` lật ngược cờ lại, trích xuất ra một viên nén `.setFromRotationMatrix`. Đưa góc bù trừ ảo diệu này tiêm thẳng vào thẻ `group` bọc ngoài con kiến. Kết quả: Con kiến luôn nằm bò song song tuyệt hảo với mặt cỏ, bất chấp hệ trục toạ độ của file nguồn gltf thảm họa tới cỡ nào!

---

## 8. Giải Mã Bản Đồ Xương Kiến (Bone Mapping & Identification)
**📝 Tình trạng:** File GLTF chứa hơn **140 bones** với tên đặt tự do (ví dụ `HeadMaxillarypulpL006_041`, `Abdomen003_07`, `ForelegL010_059`). Không có tài liệu nào giải thích bone nào ứng với bộ phận nào. Cần xác định chính xác bone nào là râu, hàm, đầu, và 6 đầu chân để lập trình procedural animation.
**🔍 Nguyên nhân:**
Mô hình côn trùng từ Sketchfab được rig bởi nghệ sĩ, đặt tên bone theo quy ước riêng (không chuẩn Mixamo). Muốn điều khiển cử chỉ phải đọc từng cái tên rồi suy luận từ ngữ cảnh sinh học.
**💡 Giải pháp rút ra:**
- Log toàn bộ skeleton ra console bằng `cloned.traverse(child => { if (child.isBone) ... })` rồi dump tên + toạ độ vào file `poistion.txt` để phân tích offline.
- Phân loại bone theo quy tắc ngôn ngữ:
  - `MaxillarypulpL/R` → **Râu (Antennae)** — 6 đốt mỗi bên, push vào mảng để tạo sóng vẫy.
  - `MaxillaL/R` → **Hàm (Mandible)** — Xoay trục Y để mở/đóng.
  - `Head001` → **Đầu** — Xoay trục X để cúi/ngửa.
  - `ForelegL/R010`, `MidlegL/R010`, `HindlegL/R010` → **6 đầu chân bám đất** — Dùng cho thuật toán Auto Calibration.
  - `Abdomen001-006` → **Bụng** — Dành cho hoạt ảnh co giãn bụng (chưa dùng).

---

## 9. Nhân Bản Mô Hình Skeleton An Toàn (SkeletonUtils.clone)
**📝 Tình trạng:** Khi dùng 2 con kiến trong cùng 1 scene, chúng bị "dính nhau" — điều khiển con A thì con B cũng nhúc nhích theo y hệt.
**🔍 Nguyên nhân:**
`useGLTF` trả về 1 instance duy nhất của scene. Nếu gán `<primitive object={scene} />` cho 2 component khác nhau, chúng đang chia sẻ chung 1 bộ xương (Skeleton). Mọi thay đổi rotation/position trên bone của con A sẽ tự động phản chiếu sang con B.
**💡 Giải pháp rút ra:**
- Dùng `SkeletonUtils.clone(scene)` từ thư viện `three-stdlib` thay vì clone thông thường. Hàm này tạo ra một bản sao **deep clone** hoàn chỉnh bao gồm cả skeleton, bind matrices, và bone references riêng biệt.
- Wrap trong `useMemo` để chỉ clone 1 lần duy nhất, tránh clone liên tục mỗi frame.
- Sau khi clone, phải traverse lại để tìm bones mới (vì bộ bones cũ đã bị thay thế bằng bản sao).

---

## 10. Lọc Animation Track — "Đứng Yên Mà Chạy" (In-Place Animation)
**📝 Tình trạng:** Khi play animation `walk_1`, con kiến vừa bước chân vừa trôi tuột ra xa khỏi vị trí gốc. Hoặc ngược lại, con kiến bị teo nhỏ lại / phình to bất thường khi chuyển animation.
**🔍 Nguyên nhân:**
File animation gốc từ Sketchfab chứa đủ 3 loại track: `.position`, `.quaternion`, và `.scale` cho MỌI bone. Track `.position` trên bone `Root` hoặc `Center` sẽ dịch chuyển toàn bộ mô hình theo hướng đi (root motion). Track `.scale` đôi khi chứa keyframe scale lỗi.
**💡 Giải pháp rút ra:**
- Clone từng animation clip và lọc bỏ các track không mong muốn:
  ```javascript
  newClip.tracks = newClip.tracks.filter(track => {
    if (track.name.includes('.scale')) return false;    // Xoá scale → tránh teo/phình
    if (track.name.includes('.position')) return false;  // Xoá position → tránh trôi tuột
    if (track.name.includes('Maxillarypulp')) return false; // Xoá → ta tự điều khiển râu
    if (track.name.includes('Maxilla')) return false;       // Xoá → ta tự điều khiển hàm
    if (track.name.includes('Head001')) return false;        // Xoá → ta tự điều khiển đầu
    return true; // Giữ lại quaternion tracks cho chân/thân → hoạt ảnh đi bộ
  });
  ```
- Kết quả: Chỉ giữ lại phần xoay khớp chân (quaternion) để tạo dáng bước, còn vị trí + scale thì do State Machine điều khiển hoàn toàn. Các bộ phận muốn procedural animation (râu, hàm, đầu) cũng bị xoá track gốc để không bị animation file ghi đè.

---

## 11. Vấn Đề Tỉ Lệ Model (Scale Factor Madness)
**📝 Tình trạng:** Import model GLTF vào scene thì con kiến bé tí xíu như hạt bụi, hoặc to bằng cả bản đồ. Dùng `scale={[1000, 1000, 1000]}` thì chạy được nhưng khi thay model khác lại phải đoán lại con số.
**🔍 Nguyên nhân:**
Mỗi nghệ sĩ 3D dùng đơn vị khác nhau khi modelling. File Sketchfab này export ở tỉ lệ rất nhỏ (`0.01` trên Root Node). Nếu dùng `root.scale.set(x,y,z)` sẽ ghi đè mất tỉ lệ gốc, làm biến dạng model.
**💡 Giải pháp rút ra:**
- Dùng `root.scale.multiplyScalar(scaleFactor)` thay vì `root.scale.set()`. Điều này **nhân** tỉ lệ gốc lên thay vì ghi đè, giữ nguyên tỉ lệ chiều dài/rộng/cao của nghệ sĩ.
- Truyền `scaleFactor` qua props để dễ dàng điều chỉnh từ bên ngoài mà không sửa code bên trong component.
- Reset `root.position.set(0, 0, 0)` sau khi scale để xoá offset gốc của nghệ sĩ (file `poistion.txt` cho thấy gốc bị dịch `-0.0534` trên trục Z).

---
**Kiến Lửa Wiki** không chỉ là một dự án Docusaurus tĩnh bình thường. Nó là sự lắp ráp nghệ thuật giữa: 
1. React (DOM UI).
2. Three.js / R3F (WebGL Canvas). 
3. State Machine (AI & Vòng lặp vật lý Custom).
Với dự án này, việc hòa nhịp khung **60fps** của hệ mô phỏng 3D cùng hệ quản lý DOM UI chậm rãi của React chính là chén thánh lớn nhất mà đội ngũ đã chinh phục! Vẫn câu nói cũ: Ném gì thì ném, đừng ném state vào giữa hàm Frame.
