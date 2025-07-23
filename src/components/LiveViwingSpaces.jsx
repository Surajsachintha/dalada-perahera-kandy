import React, { useEffect, useRef, useState } from 'react';

const LiveViwingSpaces = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveData, setLiveData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [watchingLocation, setWatchingLocation] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const userMarkerRef = useRef(null);
  const locationWatchRef = useRef(null);

  // Crowd data for Nuwara Perahera viewing spots
  const [crowdData, setCrowdData] = useState([
    {
      id: 1,
      name: "දලදා වීදිය",
      nameEn: "Dalada Veediya",
      capacity: 5000,
      current: 4200,
      coordinates: { lat: 7.2935, lng: 80.6350 },
      lastUpdated: "2 mins ago"
    },
    {
      id: 2,
      name: "රජ වීදිය", 
      nameEn: "Raja Veediya",
      capacity: 3500,
      current: 2100,
      coordinates: { lat: 7.2928, lng: 80.6342 },
      lastUpdated: "1 min ago"
    },
    {
      id: 3,
      name: "කෝටුව පරිශ්‍රය",
      nameEn: "Kotuwegoda Area",
      capacity: 2800,
      current: 1400,
      coordinates: { lat: 7.2945, lng: 80.6338 },
      lastUpdated: "3 mins ago"
    },
    {
      id: 4,
      name: "බොහෝමංගල වීදිය",
      nameEn: "Bahomagala Road",
      capacity: 4200,
      current: 3800,
      coordinates: { lat: 7.2920, lng: 80.6355 },
      lastUpdated: "1 min ago"
    },
    {
      id: 5,
      name: "ප්‍රධාන හන්දිය",
      nameEn: "Peradeniya Junction",
      capacity: 3000,
      current: 1200,
      coordinates: { lat: 7.2938, lng: 80.6330 },
      lastUpdated: "4 mins ago"
    },
    {
      id: 6,
      name: "විල්ලියම් ගෝපල්ලාව",
      nameEn: "William Gopallawa Street",
      capacity: 2500,
      current: 800,
      coordinates: { lat: 7.2925, lng: 80.6345 },
      lastUpdated: "2 mins ago"
    }
  ]);

  // Simulate crowd data updates
  const fetchLiveData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update crowd data with random changes
      setCrowdData(prev => prev.map(street => ({
        ...street,
        current: Math.max(0, Math.min(street.capacity, 
          street.current + Math.floor(Math.random() * 400 - 200)
        )),
        lastUpdated: Math.random() > 0.7 ? "Just now" : street.lastUpdated
      })));
      
      setLastUpdated(new Date());
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching live data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Function to center map on selected location
  const centerOnLocation = (coordinates, zoom = 18) => {
    if (!mapInstance.current || !coordinates) return;

    mapInstance.current.setView([coordinates.lat, coordinates.lng], zoom, {
      animate: true,
      duration: 1.5
    });
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(userPos);
        updateUserLocationMarker(userPos);
        
        // Center map on user location
        if (mapInstance.current) {
          centerOnLocation(userPos, 18);
        }
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Watch user's location for continuous updates
  const toggleLocationWatch = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    if (watchingLocation) {
      // Stop watching
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
      setWatchingLocation(false);
    } else {
      // Start watching
      setLocationError(null);
      locationWatchRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setUserLocation(userPos);
          updateUserLocationMarker(userPos);
        },
        (error) => {
          let errorMessage = 'Unable to watch your location';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setLocationError(errorMessage);
          setWatchingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
      setWatchingLocation(true);
    }
  };

  // Update user location marker on map
  const updateUserLocationMarker = (userPos) => {
    if (!mapInstance.current || !window.L) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      mapInstance.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    // Create user location icon
    const userIconHtml = `
      <div style="
        width: 16px; 
        height: 16px; 
        background: #3b82f6; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -8px;
          left: -8px;
          width: 32px;
          height: 32px;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          animation: userLocationPulse 2s infinite;
        "></div>
      </div>
    `;

    const userIcon = window.L.divIcon({
      html: userIconHtml,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: 'custom-user-icon'
    });

    // Create user marker
    userMarkerRef.current = window.L.marker([userPos.lat, userPos.lng], { 
      icon: userIcon 
    }).addTo(mapInstance.current);

    // Add popup with user location info
    const popupContent = `
      <div style="font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: #3b82f6;">📍 Your Location</h4>
        <p style="margin: 4px 0;"><strong>Coordinates:</strong><br>
          ${userPos.lat.toFixed(6)}, ${userPos.lng.toFixed(6)}
        </p>
        <p style="margin: 4px 0;"><strong>Accuracy:</strong> ±${Math.round(userPos.accuracy)}m</p>
        <p style="margin: 4px 0; color: #3b82f6;"><strong>🔵 You are here</strong></p>
      </div>
    `;

    userMarkerRef.current.bindPopup(popupContent);
  };

  // Center map on user's location
  const centerOnUserLocation = () => {
    if (userLocation && mapInstance.current) {
      centerOnLocation(userLocation, 18);
    } else {
      getUserLocation();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    let isComponentMounted = true;
    
    const initializeMap = async () => {
      // Load Leaflet CSS and JS
      const loadLeaflet = () => {
        return new Promise((resolve, reject) => {
          // Check if Leaflet is already loaded
          if (window.L) {
            resolve();
            return;
          }

          // Load CSS
          const css = document.createElement('link');
          css.rel = 'stylesheet';
          css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
          document.head.appendChild(css);

          // Load JS
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
          script.onload = () => {
            // Fix for default marker icons
            delete window.L.Icon.Default.prototype._getIconUrl;
            window.L.Icon.Default.mergeOptions({
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });
            resolve();
          };
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      try {
        await loadLeaflet();
        
        if (!isComponentMounted || !mapRef.current) return;
        
        // Clear any existing map instance
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
        
        // Clear the container
        mapRef.current.innerHTML = '';
        
        // Initialize the map centered on Kandy, Sri Lanka
        mapInstance.current = window.L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: true
        }).setView([7.2936, 80.6396], 15);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(mapInstance.current);

        // Add zoom control to bottom right
        window.L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstance.current);

        // Load initial crowd markers
        updateMapMarkers();

      } catch (error) {
        console.error('Error loading Leaflet:', error);
        if (isComponentMounted) {
          setError('Failed to load map');
        }
      }
    };

    initializeMap();
    
    // Fetch initial data
    fetchLiveData();

    // Set up polling interval
    const interval = setInterval(fetchLiveData, 60000);

    // Fullscreen change handler
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (mapInstance.current) {
        setTimeout(() => {
          mapInstance.current.invalidateSize();
        }, 300);
      }
    };

    // Resize handler for responsive map
    const handleResize = () => {
      if (mapInstance.current) {
        setTimeout(() => {
          mapInstance.current.invalidateSize();
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      isComponentMounted = false;
      clearInterval(interval);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      
      // Stop location watching
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
        locationWatchRef.current = null;
      }
      
      // Clear markers
      if (markersRef.current) {
        markersRef.current.clear();
      }
      
      // Remove user marker
      if (userMarkerRef.current && mapInstance.current) {
        mapInstance.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      
      // Remove map instance
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update map markers when crowd data changes
  useEffect(() => {
    if (crowdData.length > 0 && mapInstance.current && window.L) {
      updateMapMarkers();
    }
  }, [crowdData]);

  const getCrowdLevel = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return { level: 'critical', color: '#EF4444', text: 'ඉතා ගැහැනුණු' };
    if (percentage >= 70) return { level: 'high', color: '#F97316', text: 'ගැහැනුණු' };
    if (percentage >= 40) return { level: 'moderate', color: '#EAB308', text: 'මධ්‍යම' };
    return { level: 'low', color: '#22C55E', text: 'හිස්' };
  };

  const getFacilityIcon = (facility) => {
    const icons = {
      toilets: '🚻',
      food: '🍽️',
      parking: '🅿️',
      medical: '🏥'
    };
    return icons[facility] || '📍';
  };

  const updateMapMarkers = () => {
    if (!window.L || !mapInstance.current) {
      return;
    }
    
    const L = window.L;
    
    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (mapInstance.current && marker) {
          try {
            mapInstance.current.removeLayer(marker);
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        }
      });
      markersRef.current.clear();

      // Create markers for each crowd location
      crowdData.forEach((street) => {
        try {
          const crowdLevel = getCrowdLevel(street.current, street.capacity);
          const availableSpaces = street.capacity - street.current;
          const percentage = ((street.current / street.capacity) * 100).toFixed(1);

          // Create custom icon based on crowd level
          const iconHtml = `
            <div style="
              width: 32px; 
              height: 32px; 
              background: ${crowdLevel.color}; 
              border: 3px solid white; 
              border-radius: 50%; 
              box-shadow: 0 3px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: 10px;
              position: relative;
            ">
              ${availableSpaces > 999 ? `${(availableSpaces/1000).toFixed(1)}k` : availableSpaces}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            className: 'custom-crowd-icon'
          });

          const marker = L.marker([street.coordinates.lat, street.coordinates.lng], { 
            icon: customIcon 
          }).addTo(mapInstance.current);

          // Add popup with crowd information
          const popupContent = `
            <div style="font-family: Arial, sans-serif; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: ${crowdLevel.color};">🏮 ${street.name}</h4>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">${street.nameEn}</p>
              
              <div style="margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 6px;">
                <div style="font-size: 18px; font-weight: bold; color: ${crowdLevel.color};">
                  ${availableSpaces.toLocaleString()} Available
                </div>
                <div style="font-size: 12px; color: #666;">
                  ${percentage}% occupied (${street.current.toLocaleString()} / ${street.capacity.toLocaleString()})
                </div>
              </div>
              
              <div style="font-size: 11px; color: #888; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                📍 ${street.coordinates.lat.toFixed(6)}, ${street.coordinates.lng.toFixed(6)}<br>
                🕒 Updated ${street.lastUpdated}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          
          // Add click handler to center map and select street
          marker.on('click', () => {
            setSelectedStreet(street);
            centerOnLocation(street.coordinates, 18);
          });
          
          markersRef.current.set(street.id, marker);
        } catch (e) {
          console.warn('Error creating marker for street:', street, e);
        }
      });
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return '';
    const seconds = Math.floor((new Date() - lastUpdated) / 1000);
    return `${seconds}s ago`;
  };

  const fitToAllLocations = () => {
    if (mapInstance.current && crowdData.length > 0 && window.L) {
      try {
        const bounds = window.L.latLngBounds(
          crowdData.map(street => [street.coordinates.lat, street.coordinates.lng])
        );
        if (bounds.isValid()) {
          mapInstance.current.fitBounds(bounds, { 
            padding: [20, 20],
            maxZoom: 16
          });
        }
      } catch (e) {
        console.warn('Error fitting to locations:', e);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-screen"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
      ></div>

      {/* Controls Overlay */}
      <div className="absolute top-1/2 right-2 sm:right-4 z-[1000] flex flex-col space-y-2 transform -translate-y-1/2">
        <button
          onClick={toggleFullscreen}
          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
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
          onClick={fetchLiveData}
          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
          title="Refresh Data"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>

        {/* Fit to All Locations Button */}
        <button
          onClick={fitToAllLocations}
          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
          title="Show All Locations"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
          </svg>
        </button>

        {/* My Location Button */}
        <button
          onClick={centerOnUserLocation}
          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 touch-manipulation"
          title="Go to My Location"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16a6 6 0 0 0 6-6c0-1.655-1.122-2.904-2.432-4.362C10.254 4.176 8.75 2.503 8 0c0 0-1.507 1.546-3.025 3.19C3.593 4.81 2 6.576 2 10a6 6 0 0 0 6 6z"/>
            <circle cx="8" cy="10" r="3"/>
          </svg>
        </button>

        {/* Location Watch Toggle Button */}
        <button
          onClick={toggleLocationWatch}
          className={`p-2 rounded-full shadow-lg transition-all duration-200 touch-manipulation ${
            watchingLocation 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-white/90 hover:bg-white text-gray-800'
          }`}
          title={watchingLocation ? 'Stop Tracking Location' : 'Track My Location'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            {watchingLocation ? (
              <path d="M8 1a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3zM6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H9a.5.5 0 0 1 0 1v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 0-1H6.5a.5.5 0 0 1-.5-.5z"/>
            ) : (
              <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
            )}
          </svg>
        </button>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000] flex flex-col space-y-2">
        <div className={`flex items-center space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm ${
          error ? 'bg-red-100 text-red-800' : 
          loading ? 'bg-yellow-100 text-yellow-800' : 
          'bg-green-100 text-green-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            error ? 'bg-red-500' : 
            loading ? 'bg-yellow-500 animate-pulse' : 
            'bg-green-500 animate-pulse'
          }`}></div>
          <span className="font-medium">
            {error ? 'Connection Error' : 
             loading ? 'Loading...' : 
             'Live'}
          </span>
          {lastUpdated && !loading && (
            <span className="opacity-70 hidden sm:inline">
              {getTimeSinceUpdate()}
            </span>
          )}
        </div>
        
        {/* Location Status */}
        {locationError && (
          <div className="flex items-center space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm bg-orange-100 text-orange-800">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="font-medium">Location Error</span>
          </div>
        )}
        
        {userLocation && !locationError && (
          <div className="flex items-center space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm bg-blue-100 text-blue-800">
            <div className={`w-2 h-2 rounded-full ${watchingLocation ? 'bg-blue-500 animate-pulse' : 'bg-blue-500'}`}></div>
            <span className="font-medium">
              {watchingLocation ? 'Tracking' : 'Located'}
            </span>
          </div>
        )}
      </div>

      {/* Selected Street Info Panel */}
      {selectedStreet && (
        <div className="absolute bottom-20 right-2 sm:bottom-4 sm:right-20 z-[1000] bg-white rounded-lg shadow-xl p-4 max-w-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-800">{selectedStreet.name}</h3>
            <button 
              onClick={() => setSelectedStreet(null)}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600">{selectedStreet.nameEn}</div>
            
            <div className="bg-green-50 p-3 rounded">
              <div className="font-bold text-green-700 text-xl">
                {(selectedStreet.capacity - selectedStreet.current).toLocaleString()}
              </div>
              <div className="text-green-600 text-sm">Available Spaces</div>
              <div className="text-green-500 text-xs">
                {(((selectedStreet.capacity - selectedStreet.current) / selectedStreet.capacity) * 100).toFixed(1)}% available
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Updated {selectedStreet.lastUpdated}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes userLocationPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.1;
          }
        }
        
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
        
        .custom-user-icon {
          background: none !important;
          border: none !important;
        }
        
        .custom-crowd-icon {
          background: none !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        
        .leaflet-popup-tip {
          background: white;
        }
        
        /* Responsive map controls */
        .leaflet-control-zoom {
          margin-bottom: 10px !important;
        }
        
        @media (max-width: 640px) {
          .leaflet-control-zoom a {
            width: 32px !important;
            height: 32px !important;
            line-height: 32px !important;
            font-size: 14px !important;
          }
          
          .leaflet-popup-content-wrapper {
            font-size: 12px;
          }
          
          .leaflet-control-attribution {
            font-size: 10px !important;
            padding: 2px 4px !important;
          }
        }
        
        /* Touch-friendly controls */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Ensure map takes full height */
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
        
        /* Prevent zoom on double tap for iOS */
        .leaflet-container {
          -webkit-tap-highlight-color: transparent;
          tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default LiveViwingSpaces;