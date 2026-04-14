import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import AntViewer from '../components/AntViewer';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler );

function HeroSection() {
  return (
    <header className="relative w-full overflow-hidden flex items-center justify-center min-h-[90vh] bg-gradient-to-b from-rose-100/90 via-rose-50/80 to-rose-100/40 dark:bg-black dark:from-black dark:via-transparent dark:to-black">
      {/* Cụm sáng tản dịu dàng nhưng nổi bật */}
      <div className="absolute top-10 right-[5%] w-[600px] h-[600px] bg-rose-500/30 dark:bg-rose-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse duration-[3000ms]"></div>
      <div className="absolute bottom-0 left-[-5%] w-[500px] h-[500px] bg-red-500/25 dark:bg-red-800/25 blur-[100px] rounded-full pointer-events-none animate-pulse duration-[4000ms]"></div>

      <div className="container relative z-10 px-6 py-16 flex flex-col md:flex-row items-center gap-16 mx-auto max-w-7xl pt-20">
        <div className="md:w-1/2 text-center md:text-left flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/80 dark:bg-white/5 text-rose-700 dark:text-rose-400 font-bold text-sm mb-8 w-max mx-auto md:mx-0 shadow-sm border border-rose-200 dark:border-white/10 backdrop-blur-md hover:bg-rose-200 dark:hover:bg-white/10 transition-colors cursor-default">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            Loài bản địa Solenopsis geminata
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-neutral-900 dark:text-white mb-6 leading-[1.05]">
            Đế Chế Ngầm <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 dark:from-orange-500 dark:to-rose-400">
              Nhiệt Đới
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-400 mb-10 max-w-xl leading-relaxed font-medium">
            Khám phá kiến trúc sinh học, tổ chức xã hội đỉnh cao và sức sống mãnh liệt của loài kiến bản địa quen thuộc nhưng đầy bí ẩn tại Việt Nam.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <Link
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-lg hover:from-red-500 hover:to-rose-500 hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-[0_10px_30px_rgba(225,29,72,0.3)] hover:shadow-[0_20px_40px_rgba(225,29,72,0.5)] relative overflow-hidden group hover:no-underline"
              to="/docs/nguon-goc-va-lich-su">
              Sách Bách Khoa Toàn Thư
            </Link>
            <a
              className="px-8 py-4 rounded-xl bg-white dark:bg-neutral-900 text-rose-700 dark:text-rose-300 font-bold text-lg hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-neutral-800 transition-all duration-300 border border-rose-200 dark:border-neutral-800 shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_30px_rgba(225,29,72,0.15)] cursor-pointer flex items-center justify-center hover:no-underline hover:scale-105 hover:-translate-y-2 group"
              href="#kham-pha">
              Giải Phẫu & Thông Số
            </a>
          </div>
        </div>
        
        <div className="md:w-1/2 relative flex justify-center group perspective-1000 mt-8 md:mt-0">
          <div className="relative z-10 w-full max-w-[550px] aspect-square rounded-[3rem] p-3 bg-white/60 dark:bg-white/5 shadow-[0_20px_60px_-15px_rgba(225,29,72,0.2)] dark:shadow-2xl backdrop-blur-xl border border-white/80 dark:border-white/10 transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-[0_30px_80px_-15px_rgba(225,29,72,0.4)]">
            <div className="w-full h-full rounded-[2.2rem] overflow-hidden relative bg-rose-50 dark:bg-neutral-900 border border-white/60 dark:border-none shadow-inner">
               <img 
                src={useBaseUrl('/img/hero_ant.png')} 
                alt="Kiến lửa" 
                className="w-full h-full object-cover scale-[1.02] group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/90 via-rose-950/20 dark:from-black/90 dark:via-black/30 to-transparent flex flex-col justify-end p-8 md:p-10 pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100">
                <div className="translate-y-8 opacity-50 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
                  <span className="inline-block px-3 py-1 bg-red-600/90 text-white font-black text-[10px] uppercase tracking-[0.2em] mb-4 rounded-full backdrop-blur-md shadow-lg border border-red-400 group-hover:animate-pulse">
                    Cơ Chế Phòng Vệ
                  </span>
                  <h3 className="text-white font-black text-3xl md:text-4xl mb-3 drop-shadow-md">Nọc Độc Alkaloid</h3>
                  <p className="text-rose-100 dark:text-neutral-300 text-sm md:text-lg font-medium mb-0 line-clamp-2 drop-shadow-md">
                    Vết đốt gây sưng tấy, ngứa ngáy và mang lại cảm giác bỏng rát tức thời đặc trưng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function AnatomySection() {
  const features = [
    { title: "Đầu Lớn - Ngàm Thép", desc: "Lực cắn vượt trội từ kiến lính đầu to (major worker), vũ khí tuyệt đối để nghiền nát hạt cứng và cắn xé kẻ thù.", icon: "✂️", link: "/docs/dac-diem-hinh-thai" },
    { title: "Mạng Phân Tán", desc: "Định tuyến hóa học kết nối hàng trăm ngàn cá thể, thiết lập siêu tổ chức linh hoạt trong môi trường nhiệt đới.", icon: "🧬", link: "/docs/mo-hinh-to-chuc" },
    { title: "Túi Lọc Sinh Học", desc: "Xử lý trực tiếp con mồi, lọc tách thành dịch protein nguyên chất để san sẻ cho cả đế chế.", icon: "🧪", link: "/docs/dac-diem-hinh-thai" },
    { title: "Vỏ Kitin Sừng", desc: "Cấu trúc vỏ đa lớp cường lực. Giúp chống chịu tốt với khí hậu nhiệt đới khắc nghiệt của Việt Nam.", icon: "🛡️", link: "/docs/dac-diem-hinh-thai" }
  ];

  return (
    <section id="kham-pha" className="py-24 bg-white dark:bg-neutral-950 relative border-t border-rose-100 dark:border-neutral-900">
      <div className="container px-6 max-w-7xl mx-auto z-10 relative">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-extrabold text-xs tracking-widest uppercase mb-6 border border-rose-200 dark:border-transparent transition-all hover:bg-rose-100 hover:scale-105 cursor-default">
            Cấu Trúc Vi Phẫu
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-6">Giải Phẫu Thể Cấu Trúc</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">
            Thiết kế sinh học mang tính hủy diệt hoàn mĩ nhất trải qua hàng triệu năm tiến hóa thích nghi kiên cường.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((item, idx) => (
            <Link key={idx} to={item.link} className="block group p-8 rounded-[2rem] hover:no-underline bg-rose-50/50 dark:bg-neutral-900 border border-rose-100 dark:border-neutral-800 transition-all duration-300 hover:-translate-y-4 hover:scale-[1.03] shadow-[0_5px_20px_rgba(225,29,72,0.03)] hover:shadow-[0_25px_50px_rgba(225,29,72,0.2)] hover:bg-white dark:hover:bg-neutral-800 hover:border-rose-400 dark:hover:border-rose-600">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-black/50 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mb-8 border border-rose-200/60 dark:border-neutral-700 shadow-sm group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 group-hover:bg-rose-600 group-hover:text-white group-hover:border-red-500 group-hover:shadow-[0_10px_20px_rgba(225,29,72,0.4)]">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{item.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-[15px] font-medium leading-relaxed mb-6 group-hover:text-neutral-900 dark:group-hover:text-neutral-300 transition-colors">{item.desc}</p>
              <div className="font-black text-xs tracking-wider text-rose-300 dark:text-neutral-600 transition-all duration-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-2">
                XEM CHI TIẾT &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedWikiSection() {
  const articles = [
    { title: "Nguồn Gốc & Phân Bố", desc: "Hành trình bám rễ và sinh tồn ở mọi ngóc ngách của đồng bằng và rừng rậm nhiệt đới.", link: "/docs/nguon-goc-va-lich-su" },
    { title: "Vị Trí Phân Loại", desc: "Đại diện ưu việt của dòng họ Solenopsis tại môi trường sinh thái bản địa.", link: "/docs/he-thong-phan-loai" },
    { title: "Vòng Đời Bền Bỉ", desc: "Sự hi sinh của kiến thợ phục vụ chu kỳ vô tận của Nữ Hoàng.", link: "/docs/vong-doi-va-tuoi-tho" },
    { title: "Kỷ Luật Thép", desc: "Hệ thống chuyên chế đa cấp bậc kiên cố, không thể phá vỡ.", link: "/docs/giai-cap-xa-hoi" }
  ];

  return (
    <section className="py-24 bg-rose-50 dark:bg-black border-y border-rose-100 dark:border-neutral-900 transition-colors duration-500">
      <div className="container px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-4">Các Trang Cốt Lõi</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 font-medium">Bơm thẳng kiến thức về hệ thống phân tích bậc cao của sự bành trướng sinh học loài Kiến lửa.</p>
          </div>
          <Link to="/docs/nguon-goc-va-lich-su" className="px-8 py-4 rounded-xl bg-white dark:bg-white/10 border border-rose-200 dark:border-white/20 text-rose-700 dark:text-white font-bold hover:bg-rose-600 hover:border-rose-600 hover:text-white dark:hover:bg-white dark:hover:text-black hover:-translate-y-2 hover:scale-105 transition-all duration-300 hover:no-underline shadow-sm hover:shadow-[0_15px_30px_rgba(225,29,72,0.3)] md:mx-0 mx-auto">
            Khám Phá Toàn Bộ &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art, idx) => (
            <Link key={idx} to={art.link} className="relative group p-8 md:p-10 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:no-underline bg-white dark:bg-neutral-900 border border-rose-100 dark:border-neutral-800 shadow-[0_5px_20px_rgba(225,29,72,0.03)] hover:shadow-[0_25px_60px_rgba(225,29,72,0.25)] hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4 group-hover:translate-x-2 transition-transform duration-300">
                  <div className="w-[4px] h-10 bg-rose-200 dark:bg-neutral-800 group-hover:bg-rose-600 group-hover:h-12 group-hover:shadow-[0_0_10px_rgba(225,29,72,0.5)] rounded-full transition-all duration-300"></div>
                  <span className="font-bold text-sm tracking-widest uppercase text-rose-300 dark:text-neutral-600 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Hồ Sơ Đoạn 0{idx + 1}</span>
                </div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center border border-rose-100 dark:border-neutral-800 bg-rose-50 dark:bg-neutral-900 text-rose-300 dark:text-neutral-500 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-500 transition-all duration-300 font-black text-2xl shadow-sm group-hover:shadow-[0_10px_20px_rgba(225,29,72,0.4)] group-hover:scale-110 group-hover:rotate-12 group-hover:-translate-y-2">
                  ↗
                </div>
              </div>
              <div className="transition-transform duration-300 group-hover:translate-x-2">
                <h3 className="text-[28px] font-black text-neutral-900 dark:text-white mb-3 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors drop-shadow-sm">{art.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium text-lg mb-0 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">{art.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const chartData = {
    labels: ['Giai đoạn 1', 'Giai đoạn 2', 'Bùng nổ', 'Càn quét'],
    datasets: [{
      label: 'Cá thể kiến thợ',
      data: [15000, 45000, 120000, 250000],
      borderColor: '#e11d48', 
      backgroundColor: isDark ? 'rgba(225, 29, 72, 0.15)' : 'rgba(225, 29, 72, 0.1)',
      borderWidth: 4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#e11d48',
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 10,
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(225,29,72,0.05)', drawBorder: false}, ticks: { color: isDark ? '#737373' : '#be123c', font: { weight: 'bold' } } },
      x: { grid: { display: false }, ticks: { color: isDark ? '#737373' : '#be123c', font: { weight: 'bold' } } }
    }, interaction: { intersect: false, mode: 'index' }
  };

  return (
    <section className="py-24 bg-white dark:bg-neutral-950">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-xs font-black tracking-widest uppercase rounded-full border border-rose-200 dark:border-rose-900/50 shadow-sm transition-all hover:scale-105 hover:bg-rose-100 cursor-default">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              Biểu Đồ Sinh Sản Bất Thường
            </div>
            <h2 className="text-4xl md:text-[3.5rem] font-black text-neutral-900 dark:text-white mb-6 leading-tight hover:text-rose-600 dark:hover:text-rose-500 transition-colors duration-300">Gia Tốc <br className="hidden lg:block"/> Mật Độ Chống Chịu</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed font-medium">
              Thích ứng hoàn hảo với khí hậu nhiệt đới phân mùa khắc nghiệt. Các tổ kiến lửa luôn có năng lực sinh sản và bùng nổ dân số duy trì liên tục và dai dẳng.
            </p>
            <div className="flex gap-6 items-center p-6 bg-rose-50/80 dark:bg-neutral-900 rounded-[2rem] border border-rose-100 dark:border-neutral-800 shadow-sm hover:shadow-[0_15px_40px_rgba(225,29,72,0.15)] hover:-translate-y-2 hover:border-rose-300 transition-all duration-300 cursor-default group">
              <div className="w-[80px] h-[80px] rounded-[1.5rem] bg-white dark:bg-neutral-800 text-rose-600 flex items-center justify-center text-4xl shrink-0 border border-rose-100 dark:border-neutral-800 shadow-sm group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(225,29,72,0.3)] transition-all duration-300">
                📈
              </div>
              <div className="group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-[3rem] font-black text-neutral-900 dark:text-white block leading-none mb-2">250,000<span className="text-rose-600 group-hover:text-rose-400 transition-colors">++</span></span>
                <span className="text-xs font-black text-rose-600/80 dark:text-rose-500 uppercase tracking-widest group-hover:text-rose-600 transition-colors">Đơn vị / Năm / Tổ</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="w-full h-[500px] bg-white dark:bg-neutral-900 rounded-[3rem] p-8 shadow-[0_15px_40px_rgba(225,29,72,0.06)] dark:shadow-none border border-rose-100 dark:border-neutral-800 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_30px_60px_-15px_rgba(225,29,72,0.3)] hover:border-rose-300 transition-all duration-500 cursor-crosshair">
               <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AntViewerSection() {
  return (
    <section id="mo-hinh-3d" className="py-16 md:py-24 bg-rose-50/50 dark:bg-neutral-950 border-y border-rose-100 dark:border-neutral-900 overflow-hidden transition-colors duration-500">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="mb-8 md:mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-extrabold text-xs tracking-widest uppercase mb-4 md:mb-6 border border-rose-200 dark:border-rose-900/50 transition-colors drop-shadow-sm dark:drop-shadow-none shadow-sm dark:shadow-none">
            Phòng Giải Phẫu Đương Đại
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white mb-4 md:mb-6 transition-colors duration-500">Mô Hình 3D Tương Tác</h2>
          <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-medium transition-colors duration-500 mb-8">
            Xoay, phóng to, khám phá từng bộ phận của kiến lửa để hiểu rõ hơn về sinh học của chúng.
          </p>
          <Link
            to="/ant-simulation"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-[0_10px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_20px_40px_rgba(244,63,94,0.4)] hover:no-underline group">
            <span className="text-2xl group-hover:animate-bounce">🐜</span>
            Chuyển Sang Mô Phỏng Đàn Kiến 3D
          </Link>
        </div>
        <div className="w-full">
          <AntViewer />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Bách Khoa Toàn Thư"
      description="Trang bách khoa toàn thư vi phẫu về hệ sinh thái loài Kiến lửa.">
      <main className="w-full font-sans overflow-x-hidden antialiased bg-white dark:bg-black text-neutral-900">
        <HeroSection />
        <AnatomySection />
        <AntViewerSection />
        <FeaturedWikiSection />
        <StatsSection />
      </main>
    </Layout>
  );
}
