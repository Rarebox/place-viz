// types/mapbox-gl-csp.d.ts
declare module 'mapbox-gl/dist/mapbox-gl-csp' {
  import mapboxgl from 'mapbox-gl';
  const mapboxglWithWorker: typeof mapboxgl & {
    workerClass: typeof Worker;
  };
  export default mapboxglWithWorker;
}
