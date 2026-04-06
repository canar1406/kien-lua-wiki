import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import clsx from 'clsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function HeroSection() {
  return (
    <header className="relative w-full overflow-hidden flex items-center justify-center min-h-[85vh] bg-neutral-50 dark:bg-[#121212]">
      {/* Abstract Animated Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-600/30 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse duration-1000"></div>

      <div className="container relative z-10 px-6 py-12 flex flex-col-reverse md:flex-row items-center gap-12 mx-auto">
        <div className="md:w-1/2 text-center md:text-left flex flex-col justify-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-6 w-max mx-auto md:mx-0 shadow-sm border border-blue-200 dark:border-blue-800">
            Solenopsis invicta
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-neutral-900 dark:text-white mb-6 leading-tight">
            Kẻ Thống Trị <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">Bất Khả Chiến Bại</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-xl leading-relaxed">
            Khám phá 16 chuyên đề khoa học về loài sinh vật có tổ chức xã hội đỉnh cao, tập tính sinh tồn dị biệt và khả năng xâm lấn tàn phai nhất thế giới tự nhiên.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-lg hover:from-blue-500 hover:to-blue-400 hover:text-white hover:no-underline transition-all shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:-translate-y-1"
              to="/docs/nguon-goc-va-lich-su">
              Đọc Bách Khoa Toàn Thư
            </Link>
            <a
              className="px-8 py-4 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold text-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-blue-500 dark:hover:text-blue-400 transition-all border border-neutral-200 dark:border-neutral-700 shadow-sm hover:no-underline cursor-pointer"
              href="#tong-quan">
              Tìm hiểu Tổng quan ↓
            </a>
          </div>
        </div>
        
        <div className="md:w-1/2 relative flex justify-center group perspective-1000">
          <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border border-neutral-200/50 dark:border-white/10 w-full max-w-[500px] transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-2">
            <img 
              src="/img/hero_ant.png" 
              alt="Cận cảnh kiến đỏ" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
              <span className="text-white font-bold text-xl drop-shadow-md">Nọc độc Alkaloid hoại tử</span>
              <span className="text-neutral-300 text-sm">Vết đốt cảm giác như ngọn lửa châm vào da</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function OverviewSection() {
  return (
    <section id="tong-quan" className="py-24 bg-white dark:bg-[#121212] flex justify-center">
      <div className="container px-6 max-w-6xl mx-auto">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-6">Đẳng cấp Xã hội Ngầm</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Hệ thống siêu sinh vật (Superorganism) hoạt động hoàn hảo dựa trên Pheromone mà không cần cá thể đứng đầu điều khiển.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "👑", title: "Kiến Chúa",
              desc: "Tuổi thọ lên tới 7 năm. Sinh sản 1.500-5.000 trứng mỗi ngày. Chỉ huy sự tồn tại của hàng vạn cá thể.",
              color: "from-purple-500 to-fuchsia-600",
              bgColor: "bg-purple-50 dark:bg-purple-900/10"
            },
            {
              icon: "🛠️", title: "Kiến Thợ",
              desc: "Phân công lao động theo độ tuổi. Cá thể già nhất sẽ làm người lính cảm tử đi tìm mồi ngoài ánh sáng.",
              color: "from-orange-500 to-red-600",
              bgColor: "bg-orange-50 dark:bg-orange-900/10"
            },
            {
              icon: "🌊", title: "Khả năng Kết Bè",
              desc: "Khi gặp lũ, 100.000 cá thể đan chéo vào nhau trong 100s. Tạo mạng lưới bọc túi khí vô hại trôi nổi ròng rã trên biển.",
              color: "from-blue-500 to-cyan-500",
              bgColor: "bg-blue-50 dark:bg-blue-900/10"
            }
          ].map((item, id) => (
            <div key={id} className={clsx("p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-neutral-100 dark:border-white/5", item.bgColor)}>
              <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg bg-gradient-to-br text-white", item.color)}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">{item.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed m-0">{item.desc}</p>
            </div>
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
    labels: ['Tháng 1', 'Tháng 3', 'Tháng 6', 'Tháng 9', 'Tháng 12'],
    datasets: [{
      label: 'Dân số bùng nổ (Cá thể)',
      data: [50, 2000, 25000, 100000, 250000],
      borderColor: '#3b82f6',
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      borderWidth: 4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: isDark ? '#121212' : '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#262626' : '#171717',
        titleFont: { family: 'inherit', size: 14 },
        bodyFont: { family: 'inherit', size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', drawBorder: false },
        ticks: { color: isDark ? '#737373' : '#a3a3a3', font: { family: 'inherit'} }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#737373' : '#a3a3a3', font: { family: 'inherit'} }
      }
    },
    interaction: { intersect: false, mode: 'index' },
  };

  return (
    <section className="py-24 bg-neutral-100 dark:bg-[#1a1a1a]">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-5/12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-6">Mối đe dọa từ Tốc độ Phân nhánh</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
              Các quần thể kiến lửa đa hậu (Polygyne) gạt bỏ thù hằn nội bộ, tạo thành các siêu thuộc địa khổng lồ càn quét hệ sinh thái bản địa. Biểu đồ cho thấy sức chứa sinh sản trong một năm.
            </p>
            <div className="flex gap-4 items-center p-6 bg-white dark:bg-[#262626] rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
              <span className="text-5xl">🔥</span>
              <div>
                <span className="text-4xl font-black text-blue-500 block leading-none mb-1">~250,000</span>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Cá thể / 1 Gò đất / Năm</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-7/12 w-full">
            <div className="w-full h-[400px] bg-white dark:bg-[#262626] rounded-3xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800">
               <Line data={chartData} options={chartOptions} />
            </div>
          </div>
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
      <main className="w-full font-sans overflow-x-hidden">
        <HeroSection />
        <OverviewSection />
        <StatsSection />
      </main>
    </Layout>
  );
}
