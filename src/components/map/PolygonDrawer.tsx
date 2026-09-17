import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PolygonDrawerProps {
  onPolygonCreated: (geojson: any) => void;
  center?: [number, number];
  zoom?: number;
}

export const PolygonDrawer: React.FC<PolygonDrawerProps> = ({
  onPolygonCreated,
  center = [-54.90, -3.25],
  zoom = 6,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGFydWthYSIsImEiOiJjbHNlYnZqMTAwMDAwMmlwOHp6Z3ZqZ3ZqIn0.demo_mapbox_token';
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    });

    drawRef.current = draw;
    map.addControl(draw);
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const updateGeometry = () => {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const latestFeature = data.features[data.features.length - 1];
        onPolygonCreated(latestFeature.geometry);
      }
    };

    map.on('draw.create', updateGeometry);
    map.on('draw.update', updateGeometry);
    map.on('draw.delete', updateGeometry);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
        Click polygon icon on top-right to draw boundary
      </div>
    </div>
  );
};
