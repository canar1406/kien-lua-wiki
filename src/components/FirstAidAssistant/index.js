import React, { useState, useMemo } from 'react';

const SYMPTOM_OPTIONS = [
  {
    id: 'local_burn',
    category: 'Tại chỗ (Vết đốt)',
    label: 'Đau bỏng rát như lửa đốt, sưng đỏ nhẹ hoặc nổi mụn mủ trắng vô trùng (sau 12–24h)',
    gradeWeight: 0,
  },
  {
    id: 'large_local',
    category: 'Tại chỗ (Vết đốt)',
    label: 'Sưng nề lan rộng > 10 cm quanh chi bị đốt, nóng đỏ kéo dài',
    gradeWeight: 0.5,
  },
  {
    id: 'urticaria',
    category: 'Da & Niêm mạc (Độ I+)',
    label: 'Nổi mề đay toàn thân, ngứa râm ran, đỏ bừng da hoặc phù mạch (sưng môi, mí mắt)',
    gradeWeight: 1,
  },
  {
    id: 'resp_mild',
    category: 'Hô hấp & Tiêu hóa (Độ II)',
    label: 'Khàn tiếng, tức ngực, khó thở nhẹ, chảy nước mũi hoặc đau quặn bụng, nôn mửa',
    gradeWeight: 2,
  },
  {
    id: 'tachycardia',
    category: 'Hô hấp & Tiêu hóa (Độ II)',
    label: 'Tim đập nhanh bất thường (> 110 nhịp/phút), vã mồ hôi, lo lắng bồn chồn',
    gradeWeight: 2,
  },
  {
    id: 'stridor_shock',
    category: 'Nguy kịch tính mạng (Độ III)',
    label: 'Thở rít thanh quản, tím tái, tụt huyết áp (choáng váng/ngất), mạch nhanh nhỏ khó bắt',
    gradeWeight: 3,
  },
  {
    id: 'arrest',
    category: 'Tối khẩn cấp (Độ IV)',
    label: 'Mất hoàn toàn ý thức, ngừng thở hoặc ngừng tuần hoàn',
    gradeWeight: 4,
  },
];

const GRADE_PROTOCOLS = {
  0: {
    code: 'PHẢN ỨNG TẠI CHỖ (MỤN MỦ SOLENOPSIN)',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
    panelBorder: 'border-emerald-500/40',
    headerBg: 'from-emerald-500/10 to-teal-500/5',
    urgency: 'Chăm sóc tại chỗ & Theo dõi ngoại trú',
    requireAdrenalin: false,
    summary:
      'Độc tố Alkaloid Piperidine (Solenopsin > 95%) gây hoại tử tế bào biểu bì cục bộ, tạo ra mụn mủ trắng vô trùng (sterile pustule). Đây KHÔNG phải là nhiễm trùng vi khuẩn.',
    steps: [
      'Rửa sạch vùng da bị đốt bằng xà phòng dịu nhẹ và nước mát để loại bỏ bụi bẩn.',
      'Chườm lạnh (túi đá bọc khăn) 15 phút mỗi giờ để giảm đau bỏng rát và giảm phù nề.',
      'Có thể bôi kem Hydrocortisone 1% và uống thuốc kháng Histamin H1 (Cetirizine / Loratadine) nếu ngứa nhiều.',
      'TUYỆT ĐỐI KHÔNG nặn, chích hoặc làm vỡ mụn mủ trắng! Lớp biểu bì nguyên vẹn giúp ngăn vi khuẩn tụ cầu (Staphylococcus) xâm nhập gây viêm mô tế bào.',
    ],
  },
  1: {
    code: 'PHẢN VỆ ĐỘ I (MỨC ĐỘ NHẸ - TT 51/2017/TT-BYT)',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40',
    panelBorder: 'border-amber-500/40',
    headerBg: 'from-amber-500/15 to-orange-500/5',
    urgency: 'Cần đưa đến cơ sở y tế theo dõi tối thiểu 24 giờ',
    requireAdrenalin: false,
    summary:
      'Tổn thương mới khu trú ở da và mô dưới da (mề đay toàn thân, phù mạch). Tuy nhiên phản vệ có thể chuyển cấp đột ngột sang Độ II–III hoặc xảy ra phản ứng pha 2 (biphasic).',
    steps: [
      'Ngừng ngay tiếp xúc với kiến lửa; đặt nạn nhân ngồi hoặc nằm nghỉ nơi thoáng mát.',
      'Sử dụng kháng Histamin H1 đường uống hoặc tiêm (Diphenhydramin 10–50mg) và Methylprednisolon (40–80mg) theo chỉ định bác sĩ.',
      'Đưa bệnh nhân tới trạm y tế/bệnh viện gần nhất để theo dõi huyết áp, SpO2 ít nhất 24 giờ.',
      'Chuẩn bị sẵn sàng ống tiêm Adrenalin 1mg/1ml bên cạnh giường bệnh phòng trường hợp xuất hiện khó thở hoặc đau bụng.',
    ],
  },
  2: {
    code: 'PHẢN VỆ ĐỘ II (BÁO ĐỘNG ĐỎ - CẤP CỨU KHẨN CẤP)',
    badgeColor: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/50',
    panelBorder: 'border-orange-500/50',
    headerBg: 'from-orange-500/20 to-red-500/10',
    urgency: 'BÁO ĐỘNG ĐỎ: Chỉ định tiêm bắp Adrenalin NGAY LẬP TỨC & Gọi 115',
    requireAdrenalin: true,
    summary:
      'Đã có từ 2 hệ cơ quan trở lên bị tấn công bởi cơn bão Histamine & Leukotrienes. Không được chờ tụt huyết áp mới tiêm Adrenalin!',
    steps: [
      'GỌI NGAY CẤP CỨU 115 hoặc báo động đỏ nội viện.',
      'Đặt bệnh nhân nằm ngửa, đầu thấp, kê cao hai chân (nếu khó thở nhiều có thể nằm đầu cao 30 độ, tuyệt đối KHÔNG cho bệnh nhân tự đứng dậy đi lại).',
      'TIÊM BẮP NGAY Adrenalin 1mg/1ml (1:1000) vào mặt trước-bên đùi (cơ rộng ngoài). Nếu có bút tiêm tự động EpiPen, đâm thẳng vuông góc 90° vào mặt ngoài đùi.',
      'Thở oxy qua mặt nạ 6–10 lít/phút và thiết lập đường truyền tĩnh mạch NaCl 0.9%.',
    ],
  },
  3: {
    code: 'PHẢN VỆ ĐỘ III (NGUY KỊCH - SỐC PHẢN VỆ THỰC SỰ)',
    badgeColor: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/60',
    panelBorder: 'border-red-500/60',
    headerBg: 'from-red-600/25 to-rose-600/10',
    urgency: 'CẤP CỨU TỐI KHẨN CẤP (ICU): Đe dọa tử vong trong vài phút!',
    requireAdrenalin: true,
    summary:
      'Suy tuần hoàn cấp (giãn mạch toàn thân + thoát huyết tương) kết hợp co thắt phế quản/phù nề thanh quản. Thời gian vàng tính bằng giây!',
    steps: [
      'TIÊM BẮP NGAY LẬP TỨC Adrenalin 1mg/1ml vào mặt trước-bên đùi. Lặp lại mỗi 3–5 phút nếu mạch và huyết áp chưa lên.',
      'Đặt bệnh nhân nằm đầu thấp chân cao để dồn máu nuôi não; khai thông đường thở, thở oxy lưu lượng cao (hoặc mở khí quản cấp cứu nếu phù thanh quản bít tắc hoàn toàn).',
      'Thiết lập 2 đường truyền tĩnh mạch lớn truyền nhanh dung dịch đẳng trương NaCl 0.9% (1,000–2,000 ml ở người lớn trong 30 phút đầu).',
      'Nếu sau 2–3 liều tiêm bắp không đáp ứng, chuyển sang truyền tĩnh mạch Adrenalin liên tục khởi đầu 0.1 µg/kg/phút.',
    ],
  },
  4: {
    code: 'PHẢN VỆ ĐỘ IV (NGỪNG TUẦN HOÀN / NGỪNG HÔ HẤP)',
    badgeColor: 'bg-purple-600/25 text-purple-800 dark:text-purple-200 border-purple-500/70',
    panelBorder: 'border-purple-500/70',
    headerBg: 'from-purple-600/25 to-red-600/15',
    urgency: 'HỒI SỨC TIM PHỔI (CPR) NGAY LẬP TỨC + TIÊM ADRENALIN',
    requireAdrenalin: true,
    summary:
      'Bệnh nhân đã ngừng thở, ngừng tim lâm sàng do thiếu oxy não và trụy mạch hoàn toàn. Phải ép tim ngoài lồng ngực ngay tức khắc!',
    steps: [
      'Tiến hành ép tim ngoài lồng ngực (CPR: 100–120 lần/phút, độ sâu 5–6 cm) và bóp bóng Ambu có oxy ngay lập tức.',
      'Tiêm bắp hoặc tiêm tĩnh mạch Adrenalin 1mg mỗi 3–5 phút trong suốt chu kỳ hồi sức tim phổi.',
      'Truyền dịch tốc độ tối đa qua 2 đường truyền tĩnh mạch lớn và đặt nội khí quản kiểm soát hô hấp.',
    ],
  },
};

export default function FirstAidAssistant() {
  const [selectedIds, setSelectedIds] = useState(['local_burn']);
  const [weightKg, setWeightKg] = useState(55);

  const toggleSymptom = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((x) => x !== id) : prev) : [...prev, id]
    );
  };

  const currentGrade = useMemo(() => {
    let maxW = 0;
    for (const s of SYMPTOM_OPTIONS) {
      if (selectedIds.includes(s.id) && s.gradeWeight > maxW) {
        maxW = s.gradeWeight;
      }
    }
    return Math.floor(maxW);
  }, [selectedIds]);

  const protocol = GRADE_PROTOCOLS[currentGrade] || GRADE_PROTOCOLS[0];

  // Calculate Adrenalin dosage according to Circular 51/2017/TT-BYT (Ministry of Health Vietnam)
  const dosageInfo = useMemo(() => {
    const w = Number(weightKg) || 55;
    let imMl = '0.50';
    let groupLabel = 'Người lớn & Trẻ lớn (> 30 kg)';
    if (w < 10) {
      imMl = '0.20';
      groupLabel = 'Trẻ nhỏ (< 10 kg): ~1/5 ống';
    } else if (w <= 20) {
      imMl = '0.25';
      groupLabel = 'Trẻ em (10 – 20 kg): 1/4 ống';
    } else if (w <= 30) {
      imMl = '0.33';
      groupLabel = 'Trẻ em (20 – 30 kg): 1/3 ống';
    } else {
      imMl = '0.50';
      groupLabel = 'Người lớn (> 30 kg): 1/2 ống (tối đa 0.5 ml/lần)';
    }
    // IV continuous infusion rate at 0.1 mcg/kg/min -> mcg/min & mg/hour
    const ivMcgMin = (w * 0.1).toFixed(1);
    const ivMgHour = ((w * 0.1 * 60) / 1000).toFixed(2);
    const normalSalineBolusMl = Math.round(w * 20);
    return { imMl, groupLabel, ivMcgMin, ivMgHour, normalSalineBolusMl };
  }, [weightKg]);

  return (
    <div className="my-8 rounded-2xl border border-rose-200 dark:border-neutral-800 bg-white dark:bg-[#141418] shadow-xl overflow-hidden text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-black/25 backdrop-blur-sm">
            Công Cụ Lâm Sàng Tương Tác · Thông Tư 51/2017/TT-BYT
          </span>
          <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
            Đường dây cấp cứu: 115
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black m-0 tracking-tight !text-white">
          🩺 Trợ Lý Phân Độ Phản Vệ & Phác Đồ Sơ Cứu Vết Đốt Kiến Lửa
        </h3>
        <p className="text-xs sm:text-sm text-white/90 mt-1 mb-0">
          Đánh dấu các triệu chứng thực tế của nạn nhân để xác định ngay phân độ lâm sàng và liều lượng Adrenalin chuẩn theo Bộ Y Tế.
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Step 1: Select Symptoms */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Bước 1: Đánh Dấu Triệu Chứng Lâm Sàng Đang Xuất Hiện
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(['local_burn'])}
              className="text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 bg-transparent border-none cursor-pointer underline"
            >
              Đặt lại mặc định
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {SYMPTOM_OPTIONS.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleSymptom(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer border ${
                    checked
                      ? 'bg-rose-50/90 dark:bg-rose-950/35 border-rose-500 dark:border-rose-500/80 shadow-sm'
                      : 'bg-neutral-50 dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 hover:border-rose-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                      checked
                        ? 'bg-rose-600 text-white'
                        : 'bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <div className="flex-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-0.5">
                      {item.category}
                    </div>
                    <div className="text-xs sm:text-[13px] font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
                      {item.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Diagnosis Output */}
        <div className={`rounded-2xl border-2 ${protocol.panelBorder} bg-gradient-to-br ${protocol.headerBg} p-4 sm:p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${protocol.badgeColor}`}>
              {protocol.code}
            </span>
            <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
              ⚡ {protocol.urgency}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
            {protocol.summary}
          </p>

          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              Phác Đồ Xử Trí Từng Bước:
            </div>
            {protocol.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-200/80 dark:border-neutral-800"
              >
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-[13px] text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Adrenalin Dosage Calculator */}
        <div className="rounded-2xl border border-rose-200/80 dark:border-neutral-800 bg-rose-50/40 dark:bg-neutral-900/60 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Bước 2: Máy Tính Liều Cấp Cứu Adrenalin (1mg/1ml - 1:1000)
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                Áp dụng cho Phản vệ Độ II, Độ III và Độ IV theo Phụ lục III - Thông tư 51/2017/TT-BYT
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-neutral-700">
              <label htmlFor="patient-weight-slider" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                Cân nặng: <span className="text-rose-600 dark:text-rose-400 font-black text-sm">{weightKg} kg</span>
              </label>
              <input
                id="patient-weight-slider"
                type="range"
                min="5"
                max="100"
                step="1"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-28 sm:w-36 accent-rose-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200/70 dark:border-neutral-800">
              <div className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Liều Tiêm Bắp (IM - Mặt trước đùi)
              </div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {dosageInfo.imMl} ml <span className="text-xs font-semibold text-neutral-500">(ống 1mg/1ml)</span>
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                {dosageInfo.groupLabel}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200/70 dark:border-neutral-800">
              <div className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Truyền TM Liên Tục (Nếu kháng trị)
              </div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {dosageInfo.ivMcgMin} µg/phút
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                Tương đương ~{dosageInfo.ivMgHour} mg/giờ (khởi đầu 0.1 µg/kg/phút)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200/70 dark:border-neutral-800">
              <div className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Bù Dịch Đẳng Trương (NaCl 0.9%)
              </div>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
                ~{dosageInfo.normalSalineBolusMl} ml
              </div>
              <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                Truyền nhanh (20 ml/kg) khi có tụt huyết áp / thoát huyết tương
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
