# MÔ HÌNH TOÁN SINH THÁI HỌC 3 TẦNG & SINH NĂNG LƯỢNG DỊ TỐC (MULTI-TIER ECOLOGICAL & ALLOMETRIC SCALING)

## 🎯 1. Nền Tảng Khoa Học Thực Nghiệm
Thay vì phép nhân diện tích tuyến tính ngây thơ ($50\text{ m}^2 / 0.1\text{ m}^2 = 500\times$ — vốn giả định sai lệch rằng kiến phân bố đồng đều trên toàn lãnh thổ và $100\%$ quân số đều nằm trên mặt đất), mô hình ánh xạ bầy đàn sang quy mô tự nhiên của *Solenopsis geminata* được xây dựng chặt chẽ trên 4 trụ cột sinh thái học và sinh năng lượng học:

1. **Lý thuyết Kiếm ăn Trung tâm (Central-Place Foraging Theory — Orians & Pearson, 1979; Adams & Tschinkel, 2001):**
   - Mật độ kiến kiếm ăn trên mặt đất suy giảm theo hàm mũ từ tâm tổ ra biên giới lãnh thổ ($A_{\text{terr}} = 50\text{ m}^2$): $D(r) = D_0 \cdot e^{-\lambda r}$.
   - Ô lấy mẫu chuẩn Quadrat ($A_{\text{sim}} = 0.25\text{ m}^2$, kích thước $50\text{ cm} \times 50\text{ cm}$ vùng cận tổ) khi tích phân ra toàn lãnh thổ $50\text{ m}^2$ có hệ số hiệu chỉnh phân bố không gian $\eta_{\text{spatial}} = 0.45$.
   - Hệ số quy đổi quần thể kiếm ăn bề mặt:
     $$M_{\text{surface}} = \frac{A_{\text{terr}}}{A_{\text{sim}}} \times \eta_{\text{spatial}} = \frac{50}{0.25} \times 0.45 = 90\times$$

2. **Tỷ lệ Phân tầng Tổ ngầm – Bề mặt (Subterranean vs. Surface Stratification — Markin et al., 1975; Porter & Tschinkel, 1987; Tschinkel, 2006):**
   - Thực nghiệm đào tổ định lượng chứng minh chỉ có $f_{\text{forage}} = 18\%$ (dao động $15\%\text{–}22\%$) tổng dân số kiến lửa hoạt động trên bề mặt đất tại một thời điểm; $82\%$ còn lại nằm trong hệ thống buồng ngầm chăm sóc ấu trùng, kiến chúa và dự trữ lương thực (*repletes*).
   - Hệ số quy đổi toàn bộ vương quốc (Bề mặt + Tổ ngầm):
     $$M_{\text{colony}} = \frac{M_{\text{surface}}}{f_{\text{forage}}} = \frac{90}{0.18} = 500\times$$

3. **Định luật Dị tốc Trao đổi chất Kleiber (Kleiber's $3/4$ Allometric Scaling Law — Kleiber, 1932; Hou et al., 2010 PNAS):**
   - Kiến thợ nhỏ (Minor Worker, $\text{HW} < 0.924\text{ mm}$) có khối lượng tươi trung bình $m_{\text{minor}} \approx 1.0\text{ mg}$; Kiến tướng (Major Worker, $\text{HW} \ge 0.924\text{ mm}$) có khối lượng tươi $m_{\text{major}} \approx 4.0\text{ mg}$.
   - Tốc độ trao đổi chất cơ bản tỷ lệ với $m^{0.75}$, do đó 1 cá thể Major tiêu thụ năng lượng tương đương:
     $$\alpha_{\text{major}} = \left(\frac{4.0}{1.0}\right)^{0.75} \approx 2.83\text{ MEU (Metabolic Equivalent Units)}$$
   - Tải trọng trao đổi chất của quần thể vi mô:
     $$N_{\text{eq}}\text{ (MEU)} = N_{\text{minor}} + 2.83 \cdot N_{\text{major}}$$

4. **Sức chứa Cực đại theo Định luật Liebig & Đáp ứng Chức năng Holling Type II (Liebig, 1840; Holling, 1959; Hood & Tschinkel, 1990; Burd et al., 2002):**
   - Sức chứa cực đại theo đơn vị trao đổi chất ($\text{MEU}$):
     $$K_{\max}^{\text{MEU}} = \min\!\Big(K_{\text{trophic}}(F),\ K_{\text{hydro}}(W),\ K_{\text{space}}\Big) \times \left(1 - \frac{P_{\max} \cdot E}{E_{1/2} + E}\right)$$
   - Trong đó:
     - $K_{\text{trophic}}(F) = \lfloor 6 + 14.5 \cdot F^{0.95} \rfloor\text{ MEU}$
     - $K_{\text{hydro}}(W) = \lfloor 8 + 18.0 \cdot W^{0.90} \rfloor\text{ MEU}$
     - $K_{\text{space}} = 65\text{ MEU}$
     - $P(E) = \frac{0.85 \cdot E}{6.0 + E}$ ($P_{\max} = 0.85, E_{1/2} = 6.0$)
   - Quy đổi ra số lượng cá thể vật lý theo cấu trúc giai cấp hiện tại ($\bar{\alpha} = N_{\text{eq}} / N_{\text{sim}}$):
     $$K_{\max} = \left\lfloor \frac{K_{\max}^{\text{MEU}}}{\bar{\alpha}} \right\rfloor$$
