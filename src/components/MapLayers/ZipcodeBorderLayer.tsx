import { GeoJsonLayer } from 'deck.gl';

export const ZipcodeBorderLayer = (features: any[]) => {
  return new GeoJsonLayer({
    id: 'zipcode-border-layer',
    data: {
      type: 'FeatureCollection',
      features,
    },
    stroked: true,
    filled: false,
    getLineColor: [0, 0, 0],
    lineWidthMinPixels: 1,
    pickable: false,
  });
};