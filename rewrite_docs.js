const fs = require('fs');

const content = fs.readFileSync('C:/Users/Heavietnam/Desktop/Dự án kiến lửa/Kiến Lửa_ Phát Triển Nội Dung Siêu Chuyên Sâu.md', 'utf8');

// Trích xuất phần Nguồn trích dẫn và các ảnh base64
let mainContent = content;
let references = "";
if (content.includes("#### **Nguồn trích dẫn**")) {
    const splitRef = content.split("#### **Nguồn trích dẫn**");
    mainContent = splitRef[0];
    references = "\n\n#### **Nguồn trích dẫn**" + splitRef[1];
}

// Cắt theo vạch phân cách
const parts = mainContent.split(/## ---\s+/);

const frontmatters = [
  "---\nid: nguon-goc-va-lich-su\ntitle: Nguồn Gốc và Lịch Sử\nsidebar_position: 1\n---\n\n",
  "---\nid: he-thong-phan-loai\ntitle: Hệ Thống Phân Loại\nsidebar_position: 2\n---\n\n",
  "---\nid: dac-diem-hinh-thai\ntitle: Đặc Điểm Hình Thái\nsidebar_position: 3\n---\n\n",
  "---\nid: vong-doi-va-tuoi-tho\ntitle: Vòng Đời và Tuổi Thọ\nsidebar_position: 4\n---\n\n"
];

const paths = [
  'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docs/01-nguon-goc-va-lich-su.md',
  'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docs/02-he-thong-phan-loai.md',
  'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docs/03-dac-diem-hinh-thai.md',
  'C:/Users/Heavietnam/Desktop/Dự án kiến lửa/wiki/docs/04-vong-doi-va-tuoi-tho.md'
];

for(let i=0; i<4; i++) {
   if (!parts[i]) continue;
   let text = parts[i].trim();
   
   // Format lại tiêu đề file 1
   if (i === 0) {
       text = text.replace(/^# \*\*Báo Cáo Nghiên Cứu[\s\S]*?## \*\*1/, '# **1');
   }
   
   // Format lại các tiêu đề H2 khác thành H1 để hợp với giao diện tài liệu
   if (text.startsWith('**2')) text = '# ' + text;
   if (text.startsWith('**3')) text = '# ' + text;
   if (text.startsWith('**4')) text = '# ' + text;
   
   // Ghi đè file với frontmatter + nội dung + nguồn trích dẫn
   fs.writeFileSync(paths[i], frontmatters[i] + text + references, 'utf8');
}
console.log("Rewrote 4 markdown files successfully!");
