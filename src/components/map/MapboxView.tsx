import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Site } from '../../types';

interface MapboxViewProps {
  sites?: Site[];
  selectedSiteId?: string | null;
  onSelectSite?: (site: Site) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export const MapboxView: React.FC<MapboxViewProps> = ({
  sites = [],
  selectedSiteId,
  onSelectSite,
  center = [-54.90, -3.25],
  zoom = 6,
  height = 'h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGFydWthYSIsImEiOiJjbHNlYnZqMTAwMDAwMmlwOHp6Z3ZqZ3ZqIn0.demo_mapbox_token';
    mapboxgl.accessToken = token;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center,
        zoom,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      mapRef.current = map;

      map.on('load', () => {
        // Render sites as GeoJSON layer
        if (sites.length > 0) {
          const featureCollection = {
            type: 'FeatureCollection',
            features: sites.map((s) => ({
              type: 'Feature',
              id: s.id,
              properties: {
                id: s.id,
                name: s.name,
                area: s.area_hectares,
                status: s.status,
              },
              geometry: s.geometry,
            })),
          };

          map.addSource('sites-source', {
            type: 'geojson',
            data: featureCollection as any,
          });

          // Polygon Fill Layer
          map.addLayer({
            id: 'sites-fill',
            type: 'fill',
            source: 'sites-source',
            paint: {
              'fill-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#34d399',
                '#10b981',
              ],
              'fill-opacity': 0.45,
            },
          });

          // Polygon Outline Layer
          map.addLayer({
            id: 'sites-outline',
            type: 'line',
            source: 'sites-source',
            paint: {
              'line-color': '#34d399',
              'line-width': 2.5,
            },
          });

          // Click Site Handler
          map.on('click', 'sites-fill', (e) => {
            if (e.features && e.features.length > 0) {
              const clickedId = e.features[0].properties?.id;
              const matchedSite = sites.find((s) => s.id === clickedId);
              if (matchedSite && onSelectSite) {
                onSelectSite(matchedSite);
              }
            }
          });

          // Cursor Change on Hover
          map.on('mouseenter', 'sites-fill', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'sites-fill', () => {
            map.getCanvas().style.cursor = '';
          });
        }
      });
    } catch (e) {
      console.warn('Mapbox initialization fallback:', e);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [sites]);

  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Overlay Badge */}
      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>PostGIS Vector Tiles</span>
      </div>
    </div>
  );
};
