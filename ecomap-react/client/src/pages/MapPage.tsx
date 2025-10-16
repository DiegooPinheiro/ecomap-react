import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapPage() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      const defaultCoords: [number, number] = [-3.7, -38.5];
      const map = L.map(mapContainerRef.current).setView(defaultCoords, 12);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Geolocalização
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 13);
            markerRef.current = L.marker([latitude, longitude])
              .addTo(map)
              .bindPopup('Você está aqui')
              .openPopup();
          },
          () => {},
          { enableHighAccuracy: false, timeout: 5000 }
        );
      }

      const onResize = () => map.invalidateSize();
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    }
  }, []);

  return <div ref={mapContainerRef} style={{ height: '90vh', width: '100%' }} />;
}
