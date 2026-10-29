import React, { useState } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './about.module.css';

const teamMembers = [
  {
    name: 'Nguyễn Quốc Gia Huy',
    role: 'Leader, Thuyết trình',
    nickname: 'Jerry Theintrovert',
    image: 'gia-huy.jpg',
  },
  {
    name: 'Phan Lê Ánh Ngọc',
    role: 'Chăm sóc mẫu vật',
    nickname: 'mynuantinh',
    image: 'anh-ngoc.jpg',
  },
  {
    name: 'Võ Nguyễn Hoàng Long',
    role: 'Nghiên cứu thực địa, Developer',
    nickname: 'HeaVN',
    image: 'hoang-long.jpg',
  },
  {
    name: 'Trương Minh Khoa',
    role: 'Nghiên cứu thực địa',
    nickname: 'chaien',
    image: 'minh-khoa.jpg',
  },
  {
    name: 'Đặng Trần Diễm Phúc',
    role: 'Soạn nội dung',
    nickname: 'Dancing và picaso',
    image: 'diem-phuc.jpg',
  },
  {
    name: 'Lê Viết Triết',
    role: 'Thuyết trình',
    nickname: 'ốc cái gì đó',
    image: 'viet-triet.jpg',
  },
  {
    name: 'Nguyễn Trọng Nhân',
    role: 'Chăm sóc mẫu vật',
    nickname: 'nick_ngayther',
    image: 'trong-nhan.jpg',
  },
  {
    name: 'Uyên Phạm',
    role: 'Chăm sóc mẫu vật',
    nickname: 'Cô nàng rmit',
    image: 'nha-uyen.jpg',
  },
  {
    name: 'Thanh Ngọc',
    role: 'Xây dựng môi trường nuôi',
    nickname: 'Hoạ sĩ',
    image: 'thanh-ngoc.jpg',
  },
  {
    name: 'Đặng Quang Minh',
    role: 'Soạn nội dung',
    nickname: 'anh Minh',
    image: 'minh.png',
  },
];

function InitialsPlaceholder({ name }) {
  const names = name.split(' ');
  const initials = names.length > 1 
    ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}` 
    : names[0].charAt(0);

  return (
    <div className="w-full h-full flex items-center justify-center bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-4xl rounded-full">
      {initials}
    </div>
  );
}

function TeamCard({ member }) {
  const imageUrl = useBaseUrl(`/img/members/${member.image}`);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.teamCard}>
        <div className="flex flex-col items-center p-8 h-full">
          {/* Avatar Circular */}
          <div 
            className="w-44 h-44 rounded-full overflow-hidden border-4 border-rose-100 dark:border-neutral-800 shadow-lg mb-6 flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 hover:border-rose-400 dark:hover:border-rose-500"
            onClick={() => member.image && setIsModalOpen(true)}
            title={member.image ? "Xem ảnh lớn" : ""}
          >
            {member.image ? (
              <img 
                src={imageUrl} 
                alt={member.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <InitialsPlaceholder name={member.name} />
            )}
          </div>

          {/* Info */}
          <div className="text-center flex-grow flex flex-col justify-end">
            <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white uppercase tracking-wide mb-2 m-0">
              {member.name}
            </h3>
            <div className="mb-3">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50">
                {member.role}
              </span>
            </div>
            
            <div className="mt-1 text-neutral-500 dark:text-neutral-400 italic max-w-[220px] mx-auto text-sm">
              <span className="font-semibold text-neutral-400 dark:text-neutral-500 not-italic">Biệt danh: </span>"{member.nickname}"
            </div>
          </div>
          
        </div>
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && member.image && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={imageUrl} 
              alt={member.name} 
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border-2 border-white/20" 
            />
            <button 
              className="fixed top-6 right-6 md:top-10 md:right-10 text-white bg-rose-600 hover:bg-rose-700 rounded-full w-11 h-11 flex items-center justify-center border-none cursor-pointer transition-colors shadow-lg z-[10000]"
              onClick={() => setIsModalOpen(false)}
              aria-label="Đóng"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-4 bg-white dark:bg-neutral-900 border border-rose-200 dark:border-neutral-700 px-6 py-2 rounded-full text-rose-600 dark:text-rose-400 text-lg font-bold shadow-xl">
              {member.name} — <span className="text-neutral-600 dark:text-neutral-300 font-medium text-sm">{member.role}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AboutUs() {
  return (
    <Layout
      title="Về Chúng Tôi"
      description="Gặp gỡ đội ngũ nghiên cứu và phát triển dự án Bách Khoa Toàn Thư Kiến Lửa."
    >
      <main className="min-h-screen py-20 px-6 lg:px-12 bg-gradient-to-b from-rose-50/60 via-white to-rose-50/30 dark:from-[#0d0d10] dark:via-[#121216] dark:to-[#09090b] transition-colors duration-500">
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block py-1 px-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-widest uppercase">
              Nhóm Nghiên Cứu & Phát Triển
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white m-0">
              Đội Ngũ <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-400 dark:to-rose-400">Thực Hiện Dự Án</span>
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-base md:text-lg m-0">
              Tập thể các thành viên thực hiện nghiên cứu thực địa, chăm sóc mẫu vật, biên soạn học thuật và phát triển mô phỏng 3D cho loài Kiến lửa nhiệt đới (<em>Solenopsis geminata</em>).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, idx) => (
              <TeamCard key={idx} member={member} />
            ))}
          </div>
          
        </div>
      </main>
    </Layout>
  );
}
