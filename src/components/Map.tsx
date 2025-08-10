import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  accessToken: string;
  center?: [number, number];
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ accessToken, center = [30, 15], zoom = 1.5 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'globe',
      zoom,
      center,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.current.scrollZoom.disable();

    map.current.on('style.load', () => {
      map.current?.setFog({ color: 'rgb(255, 255, 255)', 'high-color': 'rgb(200, 200, 225)', 'horizon-blend': 0.2 });
    });

    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
      if (!map.current) return;
      const z = map.current.getZoom();
      if (spinEnabled && !userInteracting && z < maxSpinZoom) {
        let dps = 360 / secondsPerRevolution;
        if (z > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - z) / (maxSpinZoom - slowSpinZoom);
          dps *= zoomDif;
        }
        const c = map.current.getCenter();
        c.lng -= dps;
        map.current.easeTo({ center: c, duration: 1000, easing: (n) => n });
      }
    }

    map.current.on('mousedown', () => { userInteracting = true; });
    map.current.on('dragstart', () => { userInteracting = true; });
    map.current.on('mouseup', () => { userInteracting = false; spinGlobe(); });
    map.current.on('touchend', () => { userInteracting = false; spinGlobe(); });
    map.current.on('moveend', () => { spinGlobe(); });
    spinGlobe();

    return () => { map.current?.remove(); };
  }, [accessToken, center.toString(), zoom]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
    </div>
  );
};

export default Map;
