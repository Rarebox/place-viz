// src/pages/index.tsx
import dynamic from 'next/dynamic';
import React from 'react';

// ✅ DOĞRU: SSR kapalı şekilde MapView'i göreli yolla import et
const MapView = dynamic(() => import('../components/MapView'), { ssr: false });

const Home = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MapView />
    </div>
  );
};

export default Home;
