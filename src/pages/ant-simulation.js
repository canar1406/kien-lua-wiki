import React, { Suspense, lazy } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

const AntSimulation = lazy(() => import('@site/src/components/AntSimulation'));

export default function AntSimulationPage() {
  return (
    <Layout title="Mô phỏng Giao tiếp Kiến 3D" description="Mô phỏng tương tác bầy đàn 3D thời gian thực của kiến lửa nhiệt đới Solenopsis geminata">
      <main className="bg-rose-50/40 dark:bg-[#0d0d10] min-h-[80vh]">
        <BrowserOnly fallback={
          <div className="flex flex-col items-center justify-center min-h-[75vh] gap-3 text-neutral-700 dark:text-neutral-300 font-semibold">
            <span className="text-4xl animate-bounce">🐜</span>
            <span>Đang khởi tạo môi trường mô phỏng 3D...</span>
          </div>
        }>
          {() => (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center min-h-[75vh] gap-3 text-neutral-700 dark:text-neutral-300 font-semibold">
                <span className="text-4xl animate-pulse">🐜</span>
                <span>Đang nạp shader GPU & hình học WebGL...</span>
              </div>
            }>
              <AntSimulation />
            </Suspense>
          )}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
