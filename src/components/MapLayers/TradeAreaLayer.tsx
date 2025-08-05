// ✅ TradeAreaLayer.tsx
import { GeoJsonLayer } from 'deck.gl';

export const TradeAreaLayer = (features: any[]) => {
  return new GeoJsonLayer({
    id: 'trade-area-layer',
    data: {
      type: 'FeatureCollection',
      features,
    },
    stroked: true,
    filled: false,
    getLineColor: [255, 0, 0],
    lineWidthMinPixels: 2,
    pickable: false,
  });
};