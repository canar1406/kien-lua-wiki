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
    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-4xl rounded-full">
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
            className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-md mb-6 flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
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
            <h3 className="text-xl font-bold !text-[#ef4444] uppercase tracking-wide mb-1 m-0">
              {member.name}
            </h3>
            <p className="text-sm font-semibold !text-[#ef4444] uppercase tracking-widest mb-3 m-0">
              {member.role}
            </p>
            
            <div className="mt-2 text-gray-500 italic max-w-[200px] mx-auto text-sm">
              <span className="font-semibold text-gray-400 not-italic">Biệt danh: </span>"{member.nickname}"
            </div>
          </div>
          
        </div>
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && member.image && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={imageUrl} 
              alt={member.name} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border-4 border-white" 
            />
            <button 
              className="fixed top-6 right-6 md:top-10 md:right-10 text-white bg-red-600 hover:bg-red-700 rounded-full w-12 h-12 flex items-center justify-center border-none cursor-pointer transition-colors shadow-lg z-[10000]"
              onClick={() => setIsModalOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mt-4 bg-white px-6 py-2 rounded-full !text-[#ef4444] text-xl font-bold shadow-lg">
              {member.name}
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
      description="Gặp gỡ đội ngũ đứng sau dự án Kiến Lửa."
    >
      <main className="min-h-screen py-20 px-6 lg:px-12 bg-[#f8faff] dark:bg-[#1f1f1f]">
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight !text-[#ef4444] m-0">
              About us
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {teamMembers.map((member, idx) => (
              <TeamCard key={idx} member={member} />
            ))}
          </div>
          
        </div>
      </main>
    </Layout>
  );
}
