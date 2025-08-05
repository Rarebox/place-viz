// src/components/MapLayers/HomeZipcodeLayer.tsx
import { SolidPolygonLayer } from '@deck.gl/layers';

export const HomeZipcodeLayer = (features: any[]) =>
  new SolidPolygonLayer({
    id: 'home-zipcodes-layer-polygons-fill',
    data: features,
    filled: true,
    pickable: false,
    getPolygon: (d: any) => {
      if (!d.geometry) return [];
      if (d.geometry.type === 'Polygon') return d.geometry.coordinates;
      if (d.geometry.type === 'MultiPolygon') return d.geometry.coordinates.flat();
      return [];
    },
    getFillColor: [0, 100, 255, 100],
    opacity: 0.5,
  });