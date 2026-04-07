const fs = require('fs');

const rawContent = fs.readFileSync('C:/Users/Heavietnam/Desktop/Dự án kiến lửa/Kiến Lửa_ Phát Triển Nội Dung Siêu Chuyên Sâu.md', 'utf8');

// Extract images
const image1 = rawContent.match(/\[image1\]: <data:image\/png;base64,.*?>/)[0];
const image2 = rawContent.match(/\[image2\]: <data:image\/png;base64,.*?>/)[0];
const image3 = rawContent.match(/\[image3\]: <data:image\/png;base64,.*?>/)[0];
const image4 = rawContent.match(/\[image4\]: <data:image\/png;base64,.*?>/)[0];
const image5 = rawContent.match(/\[image5\]: <data:image\/png;base64,.*?>/)[0];
const image6 = rawContent.match(/\[image6\]: <data:image\/png;base64,.*?>/)[0];
const image7 = rawContent.match(/\[image7\]: <data:image\/png;base64,.*?>/)[0];

const imgRefs3 = `\n\n` + image1;
const imgRefs4 = `\n\n` + image2 + `\n` + image3 + `\n` + image4 + `\n` + image5 + `\n` + image6 + `\n` + image7;

const file1 = `---
id: nguon-goc-va-lich-su
title: Nguồn Gốc & Sự Xâm Lấn
sidebar_position: 1
---

# Nguồn Gốc Tiến Hóa, Phân Sinh Địa Lý Và Hành Trình Xâm Lấn Toàn Cầu

:::tip Lời Cáo Chung Sinh Thái Học
Hành trình của loài kiến lửa đỏ ngoại lai (*Solenopsis invicta*) từ những vùng đất ngập nước hoang dã, khắc nghiệt ở Nam Mỹ trở thành một trong những đế chế xâm lấn sinh thái thành công và tàn khốc nhất hành tinh là một minh chứng sống động cho quy luật sinh tồn và sự thích nghi tiến hóa vượt xa mọi trí tưởng tượng. Sự xuất hiện của chúng ở bất cứ lục địa nào không chỉ làm thay đổi vĩnh viễn cấu trúc hệ sinh thái mà còn tiêu tốn hàng chục tỷ đô la Mỹ mỗi năm chỉ để kìm hãm đà bành trướng bạo lực của chúng.
:::

## 1. Nôi Tiến Hóa Tại Tân Nhiệt Đới Và Bối Cảnh Sinh Thái Học

Loài kiến lửa đỏ nhập khẩu, danh pháp khoa học là *Solenopsis invicta* (Buren, 1972), là một trong những sinh vật xâm lấn nguy hiểm nhất lịch sử tự nhiên học đương đại. 

Gốc rễ tiến hóa của loài côn trùng mang tính xã hội siêu cấp này được neo chặt tại các khu vực nhiệt đới và cận nhiệt đới của lục địa Nam Mỹ. Trọng tâm của sự đa dạng hóa sinh thái định vị tại **vùng đầm lầy Pantanal** — dải lãnh thổ ngập nước khổng lồ tọa lạc ở khu vực thượng nguồn lưu vực sông Paraguay.

Bối cảnh cổ địa lý vi mô tại Pantanal đã đóng vai trò như một **rào cản chọn lọc tự nhiên vô cùng khắc nghiệt**, định hình nên những đặc tính sinh học kiệt xuất. 

:::info Chiến lược sinh tồn vĩ đại (Rafting)
Khu vực Pantanal đặc trưng bởi chu kỳ thủy văn dao động mãnh liệt, xen kẽ mùa lũ lụt nhấn chìm toàn bộ cảnh quan và thời kỳ hạn hán khô cằn. Dưới sức ép đó, quần thể kiến bản địa đã tiến hóa **tập tính kiến tạo "bè mảng sinh học" (rafting behavior)**. Hàng ngàn cá thể kiến thợ móc nối hàm vào nhau thành hệ khối lập phương sinh học, bảo vệ kiến chúa ở lõi trung tâm. Chúng có khả năng trôi dạt lềnh bềnh trên mặt nước lũ sục bùn suốt nhiều tháng khốc liệt, mở rộng biên giới mượn sức nước xiết di cư.
:::

Chính áp lực đó đã rèn giũa cho *S. invicta* tinh hoa bành trướng lãnh thổ cực kỳ hung hãn và chiến lược sử dụng tài nguyên với độ linh hoạt đỉnh điểm. Dữ liệu từ các phân tích trình tự gen cho thấy sự phân ly cấu trúc biến thể di truyền tổ chức xã hội tốn tới khoảng **1,1 triệu năm trước**. Lịch sử này khẳng định kiến trúc di truyền của kiến lửa là kết tinh của một quá trình tinh chỉnh tiến hóa đẫm máu.

## 2. Mô Hình Xâm Lấn Toàn Cầu & Hiệu Ứng Cổ Chai Di Truyền

Bước nhảy vọt tự nhiên của *S. invicta* trở thành đại dịch là hệ quả bàng hoàng của mạng lưới thương mại và chuỗi logistics toàn cầu hóa.

Đã có ít nhất **chín làn sóng du nhập tách biệt** của *S. invicta* toàn cầu, trong đó quần thể tại miền Nam Hoa Kỳ được xác định là "quần thể nguồn" (source population) cho hầu hết các cuộc xâm lấn thứ cấp. Hệ thống chuỗi di cư lan truyền:

### 2.1. Thâm nhập Mỹ và Nút thắt cổ chai (Những năm 1930)
Giai đoạn sơ kỳ thâm nhập bằng quá trình vô tình "quá giang" trên các tàu chở hàng vận chuyển nông sản khởi hành từ Đông Bắc Argentina cập bến cảng Mobile, tiểu bang Alabama. Là một ví dụ kinh điển của mô hình **"nút thắt cổ chai di truyền"**, dù chỉ một phần rất nhỏ cá thể cập bến thành công nhưng nhờ được giải phóng hoàn toàn do thiếu vắng nhóm dịch bệnh thú ăn thịt (chim sẻ, nhện, nấm), quần thể Mỹ bùng cháy hàm mũ tột bậc.

### 2.2. Bành trướng nội địa định hình bản đồ
- **Tại Nam Mỹ:** Xâm lấn từ hải cảng Santos (Brazil) gây áp lực lớn đối với Vùng sinh học đại ngàn Rừng Atlantic.
- **Tại Hoa Kỳ:** Thúc đẩy sự thống trị lan rộng dọc về phương Bắc đến tận sát biên giới Virginia, đâm thủng cõi khô miền Tây qua New Mexico đến rốn nông sản California hoang hóa.

### 2.3. Cuộc xâm nhập chuỗi (Serial Invasion) vượt Thái Bình Dương
Sự di truyền đã vạch trần con đường quỷ xé duyên Thái Bình Dương. Trạm trung chuyển California cho phép loài này lén lút đổ bộ thâm phễu vào lãnh thổ đảo Đài Loan. Từ Đài Loan, luồng gió sinh học thối nát xâm nhập các khu vực ven biển phía Nam Trung Quốc.

### 2.4. Bản Mệnh Tại Âu Châu (Triển vọng 2023 - 2024)
:::danger Lục địa Châu Âu sụp đổ
Khí hậu khắc nghiệt luôn luôn che lấp rào cản ngăn *S. invicta*. Tuy nhiên, bức màn tiến hóa phòng hộ mong manh cuối cùng đã bung vỡ lở loét. Dữ kiện khủng hoảng của tháng 12 năm 2023 chỉ đạo cảnh báo khi **sự sinh tồn khổng lồ thứ cấp đầu tiên đổ bộ chiếm ngự thành công đảo Sicily xinh đẹp của vùng miền Nam Ý Đại Lợi**. Không có rào cản nào của con người là đủ để khuất phục những cư dân "Invicta - Bất Khả Chiến Bại".
:::
`;

const file2 = `---
id: he-thong-phan-loai
title: Hệ Thống Phân Loại & Lịch Sử Tự Nhiên
sidebar_position: 2
---

# Hệ Thống Phân Loại, Cổ Sinh Vật Học Và Quần Thể Lai Theo Thời Gian Thực

## 1. Vị Trí Phân Loại Học Và Đặc Trưng Sinh Học

Trong bức tranh tổng thể nền sinh vật học đương đại, loài **Kiến lửa đỏ nhập khẩu** (*Solenopsis invicta*) là một mốc chói lòa đại diện cho đỉnh cao của quá trình tiến hóa chức năng nhóm tổ (Eusociality). 

Danh pháp kết cấu bộ sinh thái chia thứ bậc phản ánh phân mảng giải phẫu học chi tiết:

| Bậc Phân Loại | Khung Danh Pháp Khoa Học | Ý Nghĩa Chủng Loại Học |
| :---- | :---- | :---- |
| **Ngành (Phylum)** | Arthropoda | Nhóm động vật chân khớp với cấu trúc bộ xương ngoài trang bị áo giáp vảy sừng chitin. |
| **Bộ (Order)** | Hymenoptera | Bộ Cánh màng (chứa các hệ ong, tò vò, kiến). Lọc hóa và quy hoạch cấu trúc giới tính cơ thể qua hệ thống đặc dị vô tính-đơn-lưỡng bội (haplodiploidy). |
| **Phân họ (Subfamily)** | Myrmicinae | Sự phân cắt bụng vô cùng chuyên sâu mang nét riêng: một vùng eo hẹp vạn nẻo phân mảnh gồm hai đốt nhô cao (*petiole* và *postpetiole*). |
| **Tông (Tribe)** | Solenopsidini | Tập hợp ngầm nhóm kiến đi ăn trộm vi hình, hoặc rải rác những binh đoàn lửa đánh chiếm kích thước hung hãn lớn lao. |
| **Chi (Genus)** | *Solenopsis* | Quần đảo phân loại gồm hàng trăm chủng loài dị biệt phát tiết. Khác biệt với toàn vũ trụ Formicidae. |
| **Loài Đặc Chủng** | *Solenopsis invicta* | Danh hiệu đặc lập vinh quang và cay đắng của "Loài kiến Bất Khả Chống Đỡ" (William Buren định danh dứt khoát vào một ngày nhức nhối năm 1972). |

## 2. Truy Lung Hồ Sơ Hóa Thạch Kỷ Oligocene

Chi *Solenopsis* có hệ gen sinh học phát tán địa cầu mang tính thử thách với 215 loài sinh tồn thức chính. Sinh trưởng tập trung mạnh mẽ tại hai luồng tiến hóa trái chiếu: nhóm *công cụ "ăn trộm" siêu nhí* (thief ants) chuyên móc cắp phôi ruột ổ sinh mạng của hàng vạn loài giun nhện ngầm sâu; và băng nhóm kiến thợ sát chiến sinh khối kích thước cường bạo dẫm đạp sinh cảnh mặt đất (fire ants).

Dấu vết hóa thạch khai thác (Temporal range) từ chi vực Châu Âu cổ hé mở dòng thời gian khởi đầu nguyên bản của chi này trải dài từ thời điểm vắng bóng con người: ngay từ đầu **Kỷ nguyên Oligocene (33,9 triệu năm trước)** với những tàn dư khai quật như *S. blanda* tại bờ đá của Pháp. Tuy cội nguồn hóa thạch mọc dày ở cựu lục địa, các dòng phả hệ học vạch rõ nguồn cơn đột phá di truyền vĩ đại của riêng dải Solenopsis lại chính là nền bùn rễ Nam Mỹ nảy lộc phát chồi đẫm huyết.

## 3. Cú Lừa Hình Thái Ngoạn Mục Cửa Thân Tộc Hệ Gen (Polyphyly)

:::warning Khủng Hoảng Định Danh Xuyên Thế Kỷ
Phức hệ lai tạp Nam Mỹ *Solenopsis saevissima species-group* là một cú tát sâu thẳm đối với nhân loại sinh thái học. Loài người từng quá ngu ngốc gạt gẫm quy chụp kiến lửa đỏ chỉ là một *"Màu nhũ đỏ suy yếu"* của băng kiến Đen Nam Mỹ trong vòng lặp ảo não 50 năm ròng, kéo theo thất bại thầm khóc do rắc thả nhầm thuốc sát sinh!
:::

Chỉ đến lúc mổ xẻ nội tạng, giải phẫu **hệ gen ty thể (mtDNA)**, các giáo sư học thuật hàng đầu đã mở toang cánh cửa định nghĩa về trạng thái đơn chúa đa chúa mấp mé tại các gen phái sinh cấu trúc siêu nhỏ. Tính đặc hóa dung nạp 10,000 bà hoàng (Polygyny) chỉ có một cơ hội phất cờ duy nhất trong kỷ nguyên tiến hóa. 

## 4. Khu Vực Tranh Đấu Ngầm: Vùng Lai Cận Địa Khảm Động Học

Một phép màu vi mô tiến hóa (Micro-evolution) còn sinh động tái diện trong lãnh thổ Hoa Kỳ giữa 2 thế lực cắn xé nội tộc: Kiến Lửa Đỏ (*S. invicta*) ngự đỉnh chuỗi thực ăn đâm nhừ nhuyễn kiến anh cả thân gồ ghề Đen mốc *Solenopsis richteri* ép chặt phế bỏ miền hoang ở Tây Bắc tiểu bang Alabama.

Hai loài tương tàn đã vô thức ấp ôm chìm đắm trong các cuộc "lai giống" giao hòa điên cuồng trổ hoa mọc lên một "Dải Khảm Khổng Lồ Lai Tạp" (*mosaic hybrid zone*). Lực lượng thợ hậu duệ ngập dòng máu lai đột biến loạn sắc (DNA pha trộn phi tuyến tính) rẽ ngõ mất dần ưu thế sinh lời cấu gen kháng thủ, nhưng lại nâng vị thế nhạy bén hệ thần kinh nhận diện đồng chủng thính mũi siêu đẳng lên tầm vĩ mô của Đáng Sáng Tạo.
`;

const file3 = `---
id: dac-diem-hinh-thai
title: Hình Thái Đẳng Cấp & Sinh Lý Hóa Sinh
sidebar_position: 3
---

# Hình Thái Đẳng Cấp, Giải Phẫu Sinh Lý Và Hóa Sinh Thái Cảm Giác

## 1. Đa Hình Liên Tục Học Bất Đối Xứng (Allometry)

Quy chuẩn đẳng cấp của loài kiến lửa đỏ từ chối cơ chế thân hình cắt khúc khối hộp mà hòa tan cấu hình uyển chuyển thông qua hiện tượng **Đa hình thức liên tục**. Công nhân kiến chạy rải tỷ lệ thân tạng ngẫu biến độ dày dài dao động sóng trượt từ chú thợ mảy siêu vi nhí nhẹ (1.5mm) trải tới các xe tăng công thành cơ bắp (4.0mm).

Sức phát triển ngầm biến đổi trượt pha được điều chỉnh vĩ mô từ tiến hóa thần tốc của hệ **Dị Tương Xứng Động Lực (Allometric growth)**: 
*   **Kiến thợ trưởng (Major workers):** Mọi xương xẩu dồn lực đắp tụ cho bộ phận đầu sọ to lớn và đôi ngàm khóa lưỡi dao *mandibles* ngoạm nát sinh thiết thịt. Trong khi cái đít (*gaster*) bụng chương lên trương phình để gom góp bể nước si-ro hóa lỏng dồn tích chứa ứ. Hạng cơ bắp thuần túy.
*   **Kiến thợ non (Minor workers):** Nhanh nhẹn thon thả làm phận sự cẩu nhiếp nhũ thai vệ sinh rác rưởi dưới đáy âm u thầm thĩ.
*   **Nữ Vương Tổ (Gyne Queen):** Một con quái thai vĩ đại kích cỡ 8mm mập mạp bọc thép được đính tạc con *mắt đơn (ocellus)* chính giữa thính không gian bắt ánh sáng chói chang cho cú lún vỗ cất cánh tình tự giữa mây xanh.

## 2. Hệ Ngầm Liên Lưới Cảm Giác Radar Thần Kinh

Hệ siêu tổ chức tập trung một nhúm còi sừng radar ngự trị cặp đôi ăng-ten (Antennae), thiết lập nên trạm phát sóng điện rung, mùi vị sương từ hương thơm vi thể, xúc giác vật liệu đất cứng của tổ chìm tối tắm.

:::info Bí Mật Cửa Nơ-ron Xúc Giác
Phát quang ảnh của kính hiển vi đo tử điện năng sâu đỉnh nhọn râu kiến tóm tỉa bảy phân hệ **lông cảm giác (Sensilla)** vĩ đại. Hàng chục lỗ ống thông Nơ-ron khuếch đại tiếp sóng thần tốc tới 62 hỗn hợp dung môi khí phát tán nội sinh trong bầu trời tĩnh.
:::

## 3. Hệ Thống Nọc Độc Sát Thủy Bào (Solenopsin)

Biến một chú kiến nhỏ nhắn trở thành gã đồ tể sát nhát cắn độc không mỏi nghỉ là buồng ống ngầm khóa van tiết nhầy bên rìa thân đuôi ngực. Dường như chọc nọc độc chích mòn mỏi ngòi ống là thứ độc duy cớ cho sự tàn độc kinh sợ.

Không phải chuỗi bọ cạp protein tự thân. **95% chất tủy độc vắt chảy của kiến lửa đỏ là dung môi dầu Alkaloid piperidine gốc dị vòng hóa học: Được ấn định ám ảnh tên gọi SOLENOPSIN.**

Solenopsin tàn phá sự trao đổi nguyên tử tế bào cơ người, phá vỡ cấu sinh màng da gây ra chuỗi viêm kết tủa nước hoại tử vĩnh viễn u mủ. Phẫu thạch không gian của chúng thặng dư khả năng khử khuẩn siêu hạn (vắt 1 giọt tưới rải sương xua sạch nấm men mục rữa hang).

## 4. Bảng Mạch Liên Thông Hóa Học (Pheromone)

*S. invicta* hoạt động không cần phát ngôn rỉ tai thanh đới, chỉ nhả những luồng mùi hương điều lệnh cưỡng ép quy nạp tự động tới muôn thân:

*   **Lệnh Sát Phạt Báo Động (2-Ethyl-3,6-dimethylpyrazine):** Từ đôi hàm dưới. Khi có kẻ vạch tổ, cỗ máy bay bốc chấn động khiến bầy thỏ nhỏ chuyển chế độ máu cuồng phát điên nôn nóng chạy thẳng đến nơi xâm lược.
*   **Trái Lựu Tuyến Dufour Hành Quân:** Tranh rải các giọt hóa chất *Z,E-α-farnesene* kéo dính bước đường hành trình cho một chuỗi kiến thợ đánh mùi đu bám lết hàng cây dọc lối ngõ dài.
*   **Nội Tiết Giam Lỏng Triệt Sinh Sản:** Bà chúa phát tán hạt phân mùi kềm chân hãm buồng tiêu hủy sự nảy nở buồng xám trứng của kiến hầu, ép chùn sự nữ quyền xuống làm kiếp lao đao dọn cứt vô thức.
`;

const file4 = `---
id: vong-doi-va-tuoi-tho
title: Khoa Học Bức Xạ Vòng Đời & Siêu Gen
sidebar_position: 4
---

# Lộ Trình Phát Triển Lột Lớp, Di Truyền Biểu Sinh Và Kiến Trúc Siêu Gen Định Lãnh Thổ

## 1. Dạ Dày Ngầm Xuyên Sinh Thái & Vòng Đời Biến Tướng

Kéo dài đời biến thái khép kín từ phôi trắng (Trứng $\\rightarrow$ Ấu $\\rightarrow$ Nhộng $\\rightarrow$ Công Trưởng), mọi sinh hoạt được điều tiết từ bụng no nê. Tượng đài Nữ vương Kiến rặn ép rụng lả tới 1,500 túi nang trứng dẻo mỗi ngày nhả tung liên tiếp không nghỉ. Trải qua vài chục ngày u hóa, bí mật sống chết nhức đầu mới thực sự hiển diện lộ nguyên hình hài.

:::info Nghịch Lý Chiếc Eo Khát Sữa Trương Phình
Toàn bộ binh thư dũng mãnh, ngay cả cái dáng béo ngậy của Nữ tổ hay ranh mãnh cắn rách thịt của công nhân kiến trưởng thành, đều bị khóa siết **eo thắt cổ chai thân ngực** vô cùng nghiệt ngã khiến màng hệ miệng hoàn toàn móm bất lực để nuốt bất cứ xíu vật rắn sừng gai. 
:::

Cả Đế quốc Kiến Đỏ phục lụy trước một bộ máy cơ lỏng háu đói: **Bé Ấu Trùng Tuổi Thứ 4 (4th instar larval).** 
Chúng sinh khối như một "Dạ Dày Thần Hóa". Các chị thợ khênh thịt ném vào lún giữa rãnh sọ ngực lông chụm của Nhi Ấu Tạng Đồng Đỏ này. Từ đó nước miếng *Enzyme mạnh Serine Endopeptidases* nhả ào ói sương, phân giải lớp thịt dính bết hóa thạch lỏng thẩu. Bào non húp chất lỏng nhớp nhúa và ói mớm từ trong túi nhã vào miệng nhũ mẫu chị gái, cung cấp xăng đường huyết truyền tuần hoàn nuôi sống muôn tỷ binh.

## 2. Thác Sinh Phồn Dục: Chuyến Bay Giao Hoan

Thoát vỏ đời mỏng dọn tổ tăm tối chết sớm đứt nọc ở 5 tuần, Giòng Nữ Hậu vươn tới cái thọ bất khả cưỡng dài mút chỉ **7 Tuổi thọ trường vĩnh vinh quang**. Khi tiết xuân đến hạn kì độ chín sinh học đạt ngưỡng sương tinh túy, cuộc hỗn vũ sinh lý bùng nảy.

Mọi bản chỉ lệnh cất cánh bay vút phải khóa khống bởi chỉ số cực độ thiên căn khí tượng học: Phập phù đệm 24-32°C, độ ẩm ngậm giọt >80%, và gió dưới trướng tĩnh thanh 8 km/h. Vài hôm sau bãi mưa đổ mầm phù nê ẩm, những ranh binh trinh nữ hậu bay ươm vào cụm nam tinh đực làm tắc nghẽn khoảng không cao 300 mét. Bắn vào bụng túi tinh duy nhất, Kiến Chúa hạ thân rơi phịch tiếp đất và nhai cấu đứt đôi cánh tay rụng nát làm bữa trưa nhai chống điếc bụng trong căn hầm cách biệt tăm hơi *Claustral* nhằm thắp lứa thợ binh non rực sáng tân thế giới.

## 3. Kiến Trúc Gen Siêu Điểm Xã Hội Hội Tụ Lãnh Thổ Nhiễm Sắc Thể Số 16

Mã thiết lập biến sinh vật xâm lược này thành một khối ung thư chết yểu hệ thái sinh lý nằm ở **Tổ cấu siêu gen số 16 (16th Chromosome Social Supergene)**. Cụm liên hiệp các Haplotype di truyền bóp xé vận bản kiến thành 2 rẽ hình thể vĩnh hằng: Cõi độc địa Nhất Hậu (Monogyne) và Trận Cuồng sát Vạn Hậu Đồng Sinh (Polygyne).

*   **Thuộc Địa Chống Cự Đơn Thần (![][image2] / ![][image4]):** Dòng máu đơn chúa bóp tắt tình hữu ban. Kẻ sống với ranh biên phân cắt bằng hàng xác chết tha lôi nếu ngoại lai dạt vào sân vườn. Kiến hậu thắp bay tít đường hầm lên đến hàng Km.
*   **Vương Đô Hủy Hoại Đa Tượng (![][image3] / ![][image5]):** Bản đồ đan xiết mạng địa cầu khi Đột biến hóa vách thụ thể ngửi *Gen Gp-9* vô thần chức. Các chị em thợ làm tê liệt trí nhớ phả hệ mùi hương, bỏ quên việc truy lùng tiêu diệt bà chúa mới dạt nhầm tổ, từ đó ấp ôm hàng ngàn Chúa Tộc ở cùng 1 xó. Gây kết tỏa siêu lãnh địa vặn kiệt mọi tầng nước cạn kiệt tài nguyên rễ thú trọc hoang phế cả bầu diện. Sự suy dinh biến tướng điên thảm nhưng thắng sừng sững di truyền học tiến hóa.

## 4. Cuộc Thảm Sát Di Truyền Giao Phối: Nghiệt Súc Nam Đực Nửa Mùa Lưỡng Bội

Cuộc chiến mưu cấu giao sinh ở nhánh vương hệ sinh học Haplodiploidy tàn sát giới tính vô thức tột độ. Đỉnh nhịp "thắt cổ chai" thiếu nguồn gien ép nam nữ cùng huyết thanh ôm sấp châm đuôi sinh sản, nở ra thứ con quái hình: **Con đực mang bộ màng Lưỡng Bội Vô Dụng (Diploid males).**

Thứ nam tính suy phế thoái trào này khoác giáp dỏm, tịt vĩnh viễn nang khả năng sinh nở tinh tủy ròng. Cả mẹ chúa lầm lầm chết khô nơi tối vì không đủ một lượng chị thợ xuất nắn bóc cám. Cùng điểm yếu vắt sức nhũ hóa mạn thù với bầy Vi nấm tế bào nội sinh *Thelohania* ăn ngầm cắn phôi rã làm Nữ hậu thoi thóp nhạt nhoà trong cõi rễ âm. Bức tranh kiến ngầm đen đặc và kinh rợn vươn xích lan rộng bao kín Châu Lục.
`;

fs.writeFileSync('C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docs/01-nguon-goc-va-lich-su.md', file1, 'utf8');
fs.writeFileSync('C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docs/02-he-thong-phan-loai.md', file2, 'utf8');
fs.writeFileSync('C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docs/03-dac-diem-hinh-thai.md', file3 + imgRefs3, 'utf8');
fs.writeFileSync('C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docs/04-vong-doi-va-tuoi-tho.md', file4 + imgRefs4, 'utf8');

console.log("Rewrote gracefully formatted contents to the 4 files!");
