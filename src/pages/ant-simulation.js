import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function AntSimulationPage() {
  return (
    <Layout title="Mô phỏng Giao tiếp Kiến" description="Mô phỏng tương tác 3D của kiến lửa">
      <main>
        <BrowserOnly fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải mô phỏng 3D...</div>}>
          {() => {
            const AntSimulation = require('@site/src/components/AntSimulation').default;
            return <AntSimulation />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
