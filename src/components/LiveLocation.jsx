import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const PeraheraMap = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const routePoints = [
    { lat: 7.2933824227337505, lng: 80.63849965297347 },
    { lat: 7.294172327840355, lng: 80.63826833966137 },
    { lat: 7.294257463932886, lng: 80.63775603774107 },
    { lat: 7.29438782853149, lng: 80.63696746829095 },
    { lat: 7.295106163369321, lng: 80.63686017993075 },
    { lat: 7.2951992807639, lng: 80.6373000622076 }
  ];

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    // Initialize map
    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([routePoints[0].lat, routePoints[0].lng], 16);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    // Add route polyline
    const polyline = L.polyline(
      routePoints.map(point => [point.lat, point.lng]),
      { color: 'red', weight: 5 }
    ).addTo(mapInstance.current);

    // Add markers
    routePoints.forEach((point, index) => {
      const markerColor = index === 0 ? 'green' : 
                         index === routePoints.length - 1 ? 'red' : 'orange';
      
      const icon = L.divIcon({
        className: `custom-marker marker-${markerColor}`,
        html: `<div>${index === 0 ? 'S' : index === routePoints.length - 1 ? 'E' : index + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24]
      });

      L.marker([point.lat, point.lng], { icon })
        .addTo(mapInstance.current)
        .bindPopup(`Point ${index + 1}<br>Lat: ${point.lat.toFixed(6)}<br>Lng: ${point.lng.toFixed(6)}`);
    });

    // Fit bounds to route
    mapInstance.current.fitBounds(polyline.getBounds());

    // Fullscreen change handler
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (mapInstance.current) {
        setTimeout(() => {
          mapInstance.current.invalidateSize();
        }, 300);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* Fullscreen Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full fixed"
      ></div>

      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={toggleFullscreen}
          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
            </svg>
          )}
        </button>

        <button
          onClick={() => {
            if (mapInstance.current) {
              mapInstance.current.setView(
                [routePoints[0].lat, routePoints[0].lng],
                16
              );
            }
          }}
          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg"
          title="Reset View"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>
      </div>

      {/* Route Info Box */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 p-3 rounded-lg shadow-lg max-w-xs">
        <h3 className="font-bold text-lg mb-1">Perahera Route</h3>
        <p className="text-sm mb-2">{routePoints.length} points | ~1.2km</p>
        <div className="flex space-x-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs">Start</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-xs">End</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
            <span className="text-xs">Stops</span>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        .custom-marker {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
        }
        .marker-green {
          background-color: #22c55e;
          border: 2px solid #166534;
        }
        .marker-red {
          background-color: #ef4444;
          border: 2px solid #991b1b;
        }
        .marker-orange {
          background-color: #f97316;
          border: 2px solid #9a3412;
        }
        body {
          margin: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PeraheraMap;