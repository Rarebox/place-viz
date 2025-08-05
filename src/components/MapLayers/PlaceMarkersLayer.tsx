import { IconLayer } from 'deck.gl';

export const PlaceMarkersLayer = (myPlace: any, competitors: any[]) => {
  const allPlaces = [
    { ...myPlace, icon: '/pin-icon.png' },
    ...competitors.map((c) => ({ ...c, icon: '/pin-icon-others.png' })),
  ];

  return new IconLayer({
    id: 'place-markers-layer',
    data: allPlaces,
    pickable: true,
    iconAtlas: '/pin-icon.png',
    getIcon: (d: any) => ({ url: d.icon, width: 128, height: 128, anchorY: 128 }),
    sizeScale: 15,
    getPosition: (d: any) => [d.longitude, d.latitude],
    getSize: 4,
    getColor: [255, 255, 255],
  });
};