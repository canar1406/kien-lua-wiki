import React, { Suspense, lazy } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

const AntSimulation = lazy(() => import('@site/src/components/AntSimulation'));

export default function AntSimulationPage() {
  return (
    <Layout title="Mô phỏng Giao tiếp Kiến" description="Mô phỏng tương tác 3D của kiến lửa">
      <main>
        <BrowserOnly fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải mô phỏng 3D...</div>}>
          {() => (
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải WebGL...</div>}>
              <AntSimulation />
            </Suspense>
          )}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
