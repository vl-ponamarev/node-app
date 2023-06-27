import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Инициализация карты при монтировании компонента
    const map = L.map(mapContainerRef.current).setView([37.44, -122.14], 13);

    // Добавление слоя тайлов OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Добавление маркера на карту
    L.marker([37.44, -122.14]).addTo(map).bindPopup('A marker.');

    // Уничтожение карты при размонтировании компонента
    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapContainerRef} style={{ height: '400px' }}></div>;
};

export default Map;
