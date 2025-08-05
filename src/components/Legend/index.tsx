// src/components/Legend/index.tsx
import React from 'react';

interface LegendProps {
  customerDataType: 'Trade Area' | 'Home Zipcodes';
  customerPercentiles: string[];
}

const Legend: React.FC<LegendProps> = ({ customerDataType }) => {
  const homeZipLegend = [
    { range: '0-20', value: '0–4.5%', color: '#EDF8FB' },
    { range: '20-40', value: '4.5–25%', color: '#B3CDE3' },
    { range: '40-60', value: '25–29%', color: '#8C96C6' },
    { range: '60-80', value: '29–32.6%', color: '#8856A7' },
    { range: '80-100', value: '32.6–45%', color: '#810F7C' }
  ];

  const tradeAreaLegend = [
    { label: '%30 (Smallest)', color: '#FFA07A' },
    { label: '%50 (Medium)', color: '#FF4500' },
    { label: '%70 (Largest)', color: '#B22222' }
  ];

  return (
    <div style={{ width: '260px', padding: '16px', background: '#f9f9f9', height: '100vh' }}>
      <h3>Legend</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {customerDataType === 'Home Zipcodes'
          ? homeZipLegend.map((item) => (
              <li key={item.range} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    backgroundColor: item.color,
                    marginRight: '8px',
                    borderRadius: 2,
                    border: '1px solid #ccc'
                  }}
                ></span>
                <strong>{item.range}</strong>: {item.value}
              </li>
            ))
          : tradeAreaLegend.map((item) => (
              <li key={item.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    backgroundColor: item.color,
                    marginRight: '8px',
                    borderRadius: 2,
                    border: '1px solid #ccc'
                  }}
                ></span>
                {item.label}
              </li>
            ))}
      </ul>
    </div>
  );
};

export default Legend;
