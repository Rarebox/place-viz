// components/MapView.tsx
import { useEffect, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import DeckGL from '@deck.gl/react';
import { Map as ReactMap } from 'react-map-gl';
import { GeoJsonLayer, IconLayer } from '@deck.gl/layers';
import worker from 'mapbox-gl/dist/mapbox-gl-csp-worker';
import type { MapViewState } from '@deck.gl/core';
import Sidebar from './Sidebar';
import myPlaceData from '../data/my_place.json';
import competitorsData from '../data/competitors.json';
import homeZipcodes from '../data/home_zipcodes.json';
import zipcodesRaw from '../data/zipcodes.json';
import { SolidPolygonLayer } from '@deck.gl/layers';
import bbox from '@turf/bbox';
import { distance } from '@turf/turf';
import Legend from './Legend';

mapboxgl.workerClass = worker;

const INITIAL_VIEW_STATE = {
  longitude: -98.5,
  latitude: 39.8,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

const TOTAL_PAGES = 48;
const SUBPARTS = ['a', 'b'];

const MapView = () => {
  const [tooltip, setTooltip] = useState<any | null>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [loadedPages, setLoadedPages] = useState<Set<string>>(new Set());
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [visibleTooltip, setVisibleTooltip] = useState<any | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState<number>(INITIAL_VIEW_STATE.zoom);
  const [shownTradeAreas, setShownTradeAreas] = useState<Set<string>>(new Set());
  const [shownHomeZipcodes, setShownHomeZipcodes] = useState<Set<string>>(new Set());
  const [showZipcodes, setShowZipcodes] = useState<Set<string>>(new Set());
   const [placeFilterRadius, setPlaceFilterRadius] = useState<number>(5);
  const [placeFilterIndustries, setPlaceFilterIndustries] = useState<string[]>([]);
  const [showPlaces, setShowPlaces] = useState<boolean>(true);
  const [customerDataType, setCustomerDataType] = useState<'Trade Area' | 'Home Zipcodes'>('Trade Area');
  const [customerPercentiles, setCustomerPercentiles] = useState<string[]>([]);
  const [showCustomerAreas, setShowCustomerAreas] = useState<boolean>(true);

  const zipcodes = zipcodesRaw as any[];

  useEffect(() => {
  console.log("Trade area features:", features);
  console.log("Shown trade area PIDs:", Array.from(shownTradeAreas));
  console.log("Filtered Trade Area features:",
    features.filter((f) => f.properties && shownTradeAreas.has(f.properties.pid))
  );
}, [features, shownTradeAreas]);

useEffect(() => {
  console.log("Home zipcodes data:", homeZipcodes);
  console.log("Shown home zipcodes PIDs:", Array.from(shownHomeZipcodes));
  console.log("Filtered Home Zipcode features:",
    homeZipcodes.filter((f) => shownHomeZipcodes.has(f.properties?.pid))
  );
}, [shownHomeZipcodes]);


 useEffect(() => {
    const myPlace = { ...myPlaceData, isMyPlace: true, id: myPlaceData.id || 'my-place' };

    const competitors = competitorsData.map((p: any, i: number) => ({
      ...p,
      isMyPlace: false,
      id: p.id || `competitor-${i}`,
    }));

    setPlaces([myPlace, ...competitors]);
  }, []);

  useEffect(() => {
  if (customerDataType === 'Home Zipcodes' && showCustomerAreas) {
    setShownHomeZipcodes(new Set([myPlaceData.id]));
    setShowZipcodes(new Set([myPlaceData.id]));
  }
}, [customerDataType, showCustomerAreas]);
  
  const generatePageKeys = (zoom: number): string[] => {
    const pages: string[] = [];
    let pagesToLoad = 0;

    if (zoom < 5) pagesToLoad = 4;
    else if (zoom < 6) pagesToLoad = 12;
    else if (zoom < 7) pagesToLoad = 24;
    else pagesToLoad = TOTAL_PAGES;

    for (let i = 1; i <= pagesToLoad; i++) {
      for (const part of SUBPARTS) {
pages.push(`${i}${part}`);
      }
    }

    return pages;
  };

  const loadPagesInChunks = (pageKeys: string[]) => {
    setFeatures([]);
    const chunkSize = 4;
    const delay = 1000;

    for (let i = 0; i < pageKeys.length; i += chunkSize) {
      const chunk = pageKeys.slice(i, i + chunkSize);
      setTimeout(() => {
        chunk.forEach(async (pageKey) => {
          if (!loadedPages.has(pageKey)) {
            try {
const res = await fetch(`/api/trade_areas?page=${pageKey}`, {
                headers: { 'Cache-Control': 'no-cache' },
              });
              const json = await res.json();
              if (Array.isArray(json.features)) {
                setFeatures((prev) => [...prev, ...json.features]);
                setLoadedPages((prev) => new Set(prev).add(pageKey));
              }
            } catch (err) {
console.warn(`Failed to load page ${pageKey}`);
            }
          }
        });
      }, i * delay);
    }
  };

  useEffect(() => {
    if (features.length === 0) {
      const keys = generatePageKeys(currentZoom).slice(0, 12);
      loadPagesInChunks(keys);
    }
  }, [currentZoom]);

  const filteredTradeAreas = features.filter(
    (f) => shownTradeAreas.has(f.properties?.pid)
  );

  const filteredZipcodes = homeZipcodes.filter(
    (f) => showZipcodes.has(f.properties?.zip)
  );

  const homeZipcodeFeatures = useMemo(() => {
  const zipPolygonMap = new Map<string, any>();
  for (const z of zipcodes) {
    try {
      const polygon = JSON.parse(z.polygon);
      zipPolygonMap.set(z.id.padStart(5, '0'), polygon); // normalize ZIP
    } catch {
      console.warn('Invalid polygon for zip:', z.id);
    }
  }


 const validZipGeometry = (f: any) => {
  try {
    const coords = f.geometry.coordinates;

    const isValidPoint = (point: any) =>
      Array.isArray(point) &&
      point.length === 2 &&
      isFinite(point[0]) &&
      isFinite(point[1]) &&
      Math.abs(point[0]) <= 180 &&
      Math.abs(point[1]) <= 90;

    if (f.geometry.type === 'Polygon') {
      return coords.length <= 10 && coords.every(
        (ring: any) => ring.length <= 200 && ring.every(isValidPoint)
      );
    }

    if (f.geometry.type === 'MultiPolygon') {
      return coords.length <= 10 && coords.every(
        (polygon: any) =>
          polygon.length <= 10 &&
          polygon.every(
            (ring: any) => ring.length <= 200 && ring.every(isValidPoint)
          )
      );
    }

    return false;
  } catch {
    return false;
  }
};

  const features: any[] = [];
  for (const item of homeZipcodes) {
  const pid = item.pid;
  for (const loc of item.locations) {
    const zipRaw = Object.keys(loc)[0];
    const score = Object.values(loc)[0]; // 👈 score değeri
    const zip = zipRaw.toString().padStart(5, '0');
    const geometry = zipPolygonMap.get(zip);
    if (geometry) {
      features.push({
        type: 'Feature',
        geometry,
        properties: { pid, zip, percentile: score }, // 👈 burada ekle
      });
    } else {
      console.warn('❌ Skipping unknown ZIP:', zip);
    }
  }
}

  return features.filter((f) => validZipGeometry(f));
}, [homeZipcodes, zipcodes]);

const limitedFeatures = homeZipcodeFeatures.slice(0, 500);

console.log("zipcodes.json ids:", zipcodes.map(z => z.id));
console.log("first 5 home_zipcodes locations:", homeZipcodes.slice(0, 5).map(z => Object.keys(z.locations)));

const validFeatures = homeZipcodeFeatures.filter((f) => {
  try {
    if (!f.geometry) return false;
    const coords = f.geometry.coordinates;

    if (f.geometry.type === 'Polygon') {
      return (
        Array.isArray(coords) &&
        coords.length > 0 &&
        coords.every((ring: any) =>
          Array.isArray(ring) &&
          ring.length >= 4 &&
          ring.every(
            (point: any) =>
              Array.isArray(point) &&
              point.length === 2 &&
              isFinite(point[0]) &&
              isFinite(point[1])
          )
        )
      );
    }

    if (f.geometry.type === 'MultiPolygon') {
      return coords.every((polygon: any) =>
        Array.isArray(polygon) &&
        polygon.every((ring: any) =>
          Array.isArray(ring) &&
          ring.length >= 4 &&
          ring.every(
            (point: any) =>
              Array.isArray(point) &&
              point.length === 2 &&
              isFinite(point[0]) &&
              isFinite(point[1])
          )
        )
      );
    }

    return false;
  } catch {
    return false;
  }
});

const limitedValidFeatures = validFeatures.slice(0, 1000); // ⚠️ Kritik

const homeZipcodeFillLayer = new SolidPolygonLayer({
    id: `home-zipcodes-layer-polygons-fill-${shownHomeZipcodes.size}`,
  data: limitedValidFeatures,
  pickable: false,
  filled: true,
  getPolygon: (d: any) => {
  if (!d.geometry) return [];

  if (d.geometry.type === 'Polygon') {
    return d.geometry.coordinates;
  }

  if (d.geometry.type === 'MultiPolygon') {
    // MultiPolygon -> merge all rings
    return d.geometry.coordinates.flat();
  }

  return [];
},
  getFillColor: (d) => {
  const value = d.properties.percentile;

  if (value < 20) return [237, 248, 251];
  if (value < 40) return [179, 205, 227];
  if (value < 60) return [140, 150, 198];
  if (value < 80) return [136, 86, 167];
  return [129, 15, 124];
},
  opacity: 0.5,
});

const parsedZipcodePolygons = (zipcodesRaw as any[]).map((item: any) => {
  try {
    const parsed = JSON.parse(item.polygon);
    return {
      type: 'Feature',
      geometry: parsed,
      properties: { zip: item.id }
    };
  } catch (e) {
    console.warn("Invalid GeoJSON polygon for zipcode:", item.id);
    return null;
  }
}).filter(Boolean);



  const tradeAreasLayer = new GeoJsonLayer({
    id: 'trade-areas-layer',
    data: {
    type: 'FeatureCollection',
    features: features.filter(
      (f) => f.properties?.pid && shownTradeAreas.has(f.properties.pid)
    ),
  },
    pickable: true,
    stroked: true,
    filled: false,
    getLineColor: [255, 0, 0],
    getLineWidth: 2,
    lineWidthScale: 2,
    lineWidthMinPixels: 1,
    onHover: (info) => setTooltip(info.object?.properties?.pid || null),
    onClick: (info) => {
        console.log("🔍 Place clicked:", info);
      if (info.object) {
        const { pid, trade_area } = info.object.properties;
        setSelectedArea({ pid, trade_area });
      }
    },
  });


  console.log("homeZipcodeFeatures length", homeZipcodeFeatures.length);
console.log("First geometry", homeZipcodeFeatures[0]?.geometry);

  console.log("Current features count:", features.length);
console.log("Filtered trade area features:", features.filter((f) => f.properties && shownTradeAreas.has(f.properties.pid)));


  console.log("Trade Area Layer features", features.map(f => f.properties?.pid));

  console.log("Currently shownHomeZipcodes:", Array.from(shownHomeZipcodes));
  

  const homeZipcodeBorderLayer = new GeoJsonLayer({
  id: 'home-zipcodes-layer',
  data: {
    type: 'FeatureCollection',
    features: homeZipcodeFeatures.filter((f) =>
      showZipcodes.has(f.properties?.zip)
    ),
  },
  pickable: false,
  stroked: false,
  filled: true,
  getFillColor: [0, 0, 255, 160],
  getPolygon: (d: any) =>
    d.geometry.type === 'Polygon'
      ? d.geometry.coordinates
      : d.geometry.coordinates[0],
});



useEffect(() => {
  // Başlangıçta hiçbir alan gösterilmesin
  setShownHomeZipcodes(new Set());
  setShowZipcodes(new Set());
  console.log("🔁 Reset shownHomeZipcodes at init");
}, []);

console.log("Home zipcodes data:", homeZipcodes);
console.log("Set shownHomeZipcodes:", shownHomeZipcodes);


useEffect(() => {
  const debugZips = new Set<string>();
  for (const f of homeZipcodeFeatures) {
    debugZips.add(f.properties?.zip);
  }
  console.log("DEBUG: Unique ZIPs with polygons:", Array.from(debugZips));
}, [homeZipcodeFeatures]);



  console.log("Filtered home zipcodes:", homeZipcodes.filter((f) => shownHomeZipcodes.has(f.properties?.pid)));
  console.log("Home zipcode feature count:", homeZipcodeFeatures.length);
console.log("First zipcode feature:", homeZipcodeFeatures[0]);



  const myPlaceLayer = new IconLayer({
    id: 'my-place',
    data: showPlaces
    ? places.filter((p) =>
        p.isMyPlace &&
        (placeFilterIndustries.length === 0 || placeFilterIndustries.includes(p.industry)) &&
        (
          placeFilterRadius <= 0 ||
          distance(
            [myPlaceData.longitude, myPlaceData.latitude],
            [p.longitude, p.latitude],
            { units: 'kilometers' }
          ) <= placeFilterRadius
      ))
    : [],
    pickable: true,
    iconAtlas: '/pin-icon-home.png',
    iconMapping: {
  myPlaceIcon: { x: 0, y: 0, width: 128, height: 128, anchorY: 64 }
    },
    getIcon: () => 'myPlaceIcon',
    sizeScale: 6,
    getPosition: (d: any) => [d.longitude, d.latitude],
    getSize: () => 18,
    onClick: (info: any) => {
        console.log("🔍 Place clicked:", info);
  if (info.object) {
    const objWithPID = {
      ...info.object,
      pid: info.object.id // 👈 burada ekle
    };
    setVisibleTooltip(objWithPID);
  }
},
  });
console.log("Places", places);

  const competitorLayer = new IconLayer({
    id: 'competitors',
    data: showPlaces
    ? places.filter((p) =>
        !p.isMyPlace &&
        (placeFilterIndustries.length === 0 || placeFilterIndustries.includes(p.industry)) &&
        (
          placeFilterRadius <= 0 ||
          distance(
            [myPlaceData.longitude, myPlaceData.latitude],
            [p.longitude, p.latitude],
            { units: 'kilometers' }
          ) <= placeFilterRadius
      ))
    : [],
    pickable: true,
    iconAtlas: '/pin-icon-others.png',
    iconMapping: {
        competitorIcon: { x: 0, y: 0, width: 128, height: 128, anchorY: 64 }
    },
    getIcon: () => 'competitorIcon',
    sizeScale: 6,
    getPosition: (d: any) => [d.longitude, d.latitude],
    getSize: () => 8,
    onClick: (info: any) => {
  if (info.object) {
    const objWithPID = {
      ...info.object,
      pid: info.object.id // 👈 burada ekle
    };
    setVisibleTooltip(objWithPID);
  }
},
  });

  const toggleTradeArea = (pid: string) => {
  setShownTradeAreas((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(pid)) {
      newSet.delete(pid);
      console.log(`Hiding trade area for PID: ${pid}`);
    } else {
      newSet.add(pid);
      console.log(`Showing trade area for PID: ${pid}`);
    }
    return newSet;
  });
};


const toggleHomeZipcodes = (pid: string) => {
  setShownHomeZipcodes((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(pid)) {
      newSet.delete(pid);
      console.log(`❌ Hiding home zipcodes for PID: ${pid}`);
    } else {
      newSet.add(pid);
      console.log(`✅ Showing home zipcodes for PID: ${pid}`);
    }

    const visibleZips = new Set<string>();
    for (const item of homeZipcodes) {
      if (newSet.has(item.pid)) {
        for (const loc of item.locations) {
          const zip = Object.keys(loc)[0].padStart(5, '0');
          visibleZips.add(zip);
        }
      }
    }

    console.log("🟦 Final visible ZIPs:", Array.from(visibleZips));
    setShowZipcodes(visibleZips);
    return newSet;
  });
};


// Show all home zipcodes by default once features are loaded
useEffect(() => {
  if (homeZipcodeFeatures.length > 0 && shownHomeZipcodes.size === 0) {
    const allZipcodes = new Set(homeZipcodeFeatures.map(f => f.properties.zip));
    setShownHomeZipcodes(allZipcodes);
    setShowZipcodes(allZipcodes);
    console.log("✅ Initialized shownHomeZipcodes with all ZIPs");
  }
}, [homeZipcodeFeatures, shownHomeZipcodes]);

// Show all trade areas by default once features are loaded
useEffect(() => {
  if (features.length > 0 && shownTradeAreas.size === 0) {
    const allPIDs = new Set(features.map(f => f.properties.pid));
    setShownTradeAreas(allPIDs);
    console.log("✅ Initialized shownTradeAreas with all PIDs");
  }
}, [features, shownTradeAreas]);


  return (
  <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
    {sidebarVisible && (
      <div style={{ width: '320px', height: '100vh', overflowY: 'auto', borderRight: '1px solid #eee' }}>
        <Sidebar
          selectedArea={selectedArea}
          placeFilterRadius={placeFilterRadius}
          setPlaceFilterRadius={setPlaceFilterRadius}
          placeFilterIndustries={placeFilterIndustries}
          setPlaceFilterIndustries={setPlaceFilterIndustries}
          showPlaces={showPlaces}
          setShowPlaces={setShowPlaces}
          customerDataType={customerDataType}
          setCustomerDataType={setCustomerDataType}
          customerPercentiles={customerPercentiles}
          setCustomerPercentiles={setCustomerPercentiles}
          showCustomerAreas={showCustomerAreas}
          setShowCustomerAreas={setShowCustomerAreas}
        />
      </div>
    )}

    <div style={{ flex: 1, position: 'relative' }}>
      <button
        onClick={() => setSidebarVisible((prev) => !prev)}
        style={{
          position: 'absolute',
          zIndex: 3,
          top: 10,
          left: 10,
          background: '#fff',
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
      >
        {sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
      </button>

      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[
        showCustomerAreas && homeZipcodeFillLayer,
          showCustomerAreas && homeZipcodeBorderLayer,
        tradeAreasLayer,
         myPlaceLayer,
           competitorLayer
        ].filter(Boolean)}
        onViewStateChange={({ viewState }) => {
          const zoom = Math.floor((viewState as MapViewState).zoom);
          if (zoom !== currentZoom) {
            setCurrentZoom(zoom);
          }
        }}
      >
        <ReactMap
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/caglarusta/cl6qmjtrd002p14p37mnr37zg"
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>

      {visibleTooltip && visibleTooltip.pid && (
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            background: '#fff',
            padding: '10px',
            borderRadius: 8,
            top: 60,
            left: 20,
            maxWidth: 300,
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <strong>{visibleTooltip.name}</strong>
          <p>
            {visibleTooltip.street_address}, {visibleTooltip.city},{' '}
            {visibleTooltip.state}
          </p>
              <button onClick={() => toggleTradeArea(visibleTooltip.pid)}>Toggle Trade Area</button>
          <p>
            <em>{visibleTooltip.industry}</em>
          </p>
          <button
  onClick={() => {
    console.log('Clicked Trade Area button for PID:', visibleTooltip.pid);
    if (visibleTooltip?.pid) {
      toggleTradeArea(visibleTooltip.pid);
    } else {
      console.warn('Trade Area button clicked but PID not found in tooltip');
    }
  }}
>
  {shownTradeAreas.has(visibleTooltip.pid)
    ? 'Hide Trade Area'
    : 'Show Trade Area'}
</button>

          <button
            onClick={() => {
              console.log('Clicked Home Zipcode button for PID:', visibleTooltip.pid);
              if (visibleTooltip?.pid) {
                toggleHomeZipcodes(visibleTooltip.pid);
              } else {
                console.warn('Home Zipcode button clicked but PID not found in tooltip');
              }
            }}
          >
            {shownHomeZipcodes.has(visibleTooltip.pid)
              ? 'Hide Home Zipcodes'
              : 'Show Home Zipcodes'}
          </button>
        </div>
      )}
    </div>

    {/* ✅ Sağ Sidebar: Legend bileşeni */}
    <div style={{ width: '250px', height: '100vh', overflowY: 'auto', borderLeft: '1px solid #eee' }}>
      <Legend
        customerDataType={customerDataType}
        customerPercentiles={customerPercentiles}
      />
    </div>
  </div>
);

};

export default MapView;