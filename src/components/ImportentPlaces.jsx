import React, { useEffect, useRef, useState } from 'react';

const ImportantPlaces = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [watchingLocation, setWatchingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());
  const userMarkerRef = useRef(null);
  const locationWatchRef = useRef(null);

  // Fetch places data from API
  const fetchPlacesData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const response = await fetch('https://beautyme.lk:4599/json/public', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate that data is an array
      if (!Array.isArray(data)) {
        throw new Error('API response is not an array');
      }

      // Filter active places and validate required fields
      const validPlaces = data.filter(place => 
        place && 
        typeof place.latitude === 'number' && 
        typeof place.longitude === 'number' &&
        place.place_name &&
        place.status === 1 // Only show active places
      );

      setPlaces(validPlaces);
      console.log(`Loaded ${validPlaces.length} places from API`);
      
    } catch (error) {
      console.error('Error fetching places data:', error);
      setApiError(error.message);
      // Fallback to empty array
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Get place icon URL from API data or fallback
  const getPlaceIconUrl = (place) => {
    // Use place_icon from API data if available
    if (place && place.place_icon && place.place_icon.trim()) {
      return place.place_icon.trim();
    }
    
    // Fallback icon mapping for different place types if place_icon is not available
    const placeType = place?.place_type?.trim();
    const iconMap = {
      'Lavatory': 'https://maps.google.com/mapfiles/kml/shapes/toilets.png',
      'First Aid': 'https://maps.google.com/mapfiles/kml/shapes/hospitals.png',
      'Hospital': 'https://maps.google.com/mapfiles/kml/shapes/hospitals.png',
      'Fire Station': 'https://maps.google.com/mapfiles/kml/shapes/firedept.png',
      'Police': 'https://maps.google.com/mapfiles/kml/shapes/police.png',
      'Government': 'https://maps.google.com/mapfiles/kml/shapes/government.png',
      'Library': 'https://maps.google.com/mapfiles/kml/shapes/library.png',
      'Post Office': 'https://maps.google.com/mapfiles/kml/shapes/post_office.png',
      'Lodging': 'https://maps.google.com/mapfiles/kml/shapes/lodging.png',
      'Restaurant': 'https://maps.google.com/mapfiles/kml/shapes/dining.png',
      'Gas Station': 'https://maps.google.com/mapfiles/kml/shapes/gas_stations.png',
      'ATM': 'https://maps.google.com/mapfiles/kml/shapes/atm.png',
      'Pharmacy': 'https://maps.google.com/mapfiles/kml/shapes/pharmacy.png',
      'School': 'https://maps.google.com/mapfiles/kml/shapes/schools.png',
      'Shopping': 'https://maps.google.com/mapfiles/kml/shapes/shopping.png',
      'Parking': 'https://maps.google.com/mapfiles/kml/shapes/parking_lot.png',
      'Airport': 'https://maps.google.com/mapfiles/kml/shapes/airports.png',
      'Bank': 'https://maps.google.com/mapfiles/kml/shapes/banks.png'
    };
    
    return iconMap[placeType] || 'https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png';
  };

  // Calculate center point of all places
  const getCenterCoordinates = () => {
    if (places.length === 0) {
      // Default to Kandy, Sri Lanka if no places
      return { lat: 7.2906, lng: 80.6337 };
    }
    
    const centerLat = places.reduce((sum, place) => sum + place.latitude, 0) / places.length;
    const centerLng = places.reduce((sum, place) => sum + place.longitude, 0) / places.length;
    
    return { lat: centerLat, lng: centerLng };
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
          mapInstance.current.setView([userPos.lat, userPos.lng], 18, {
            animate: true,
            duration: 1.5
          });
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
      mapInstance.current.setView([userLocation.lat, userLocation.lng], 18, {
        animate: true,
        duration: 1.5
      });
    } else {
      getUserLocation();
    }
  };

  // Center on places
  const centerOnPlaces = () => {
    if (mapInstance.current && places.length > 0 && window.L) {
      const bounds = window.L.latLngBounds(
        places.map(place => [place.latitude, place.longitude])
      );
      mapInstance.current.fitBounds(bounds, { 
        padding: [20, 20],
        maxZoom: 18
      });
    }
  };

  // Refresh places data
  const refreshPlaces = () => {
    fetchPlacesData();
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

  // Fetch places data on component mount
  useEffect(() => {
    fetchPlacesData();
  }, []);

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
        
        // Get center coordinates
        const center = getCenterCoordinates();
        
        // Initialize the map centered on your places
        mapInstance.current = window.L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: true
        }).setView([center.lat, center.lng], 16);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(mapInstance.current);

        // Add zoom control to bottom right
        window.L.control.zoom({
          position: 'bottomright'
        }).addTo(mapInstance.current);

        // Remove map click handler that closes the info box - let users interact with both map and info box
        // mapInstance.current.on('click', () => {
        //   setSelectedPlace(null);
        // });

        setMapLoaded(true);

      } catch (error) {
        console.error('Error loading Leaflet:', error);
        if (isComponentMounted) {
          setMapLoaded(false);
        }
      }
    };

    initializeMap();

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

  // Update markers when places data changes
  useEffect(() => {
    if (mapLoaded && places.length > 0) {
      updateMapMarkers();
    }
  }, [places, mapLoaded]);

  const updateMapMarkers = () => {
    if (!window.L || !mapInstance.current) {
      console.log('Leaflet or map instance not ready');
      return;
    }
    
    const L = window.L;
    
    try {
      // Clear existing markers safely
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

      // Create markers for each place using Google KML icons
      places.forEach((place, index) => {
        try {
          // Validate coordinates
          if (!place.latitude || !place.longitude || 
              isNaN(place.latitude) || isNaN(place.longitude)) {
            console.warn('Invalid coordinates for place:', place);
            return;
          }

          // Use place_icon from API data
          const iconUrl = getPlaceIconUrl(place);
          
          const customIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
            shadowUrl: 'https://maps.google.com/mapfiles/kml/shapes/placemark_circle_highlight.png',
            shadowSize: [32, 32],
            shadowAnchor: [16, 32]
          });

          const marker = L.marker([place.latitude, place.longitude], { 
            icon: customIcon 
          }).addTo(mapInstance.current);

          // Add click event to show modal
          marker.on('click', (e) => {
            e.originalEvent.stopPropagation();
            setSelectedPlace(place);
          });

          // Add hover tooltip for quick info
          marker.bindTooltip(`
            <div style="font-family: system-ui, -apple-system, sans-serif;">
              <strong style="font-size: 12px;">${place.place_name}</strong><br>
              <span style="font-size: 11px; color: #666;">${place.place_type || 'Unknown'}</span>
            </div>
          `, {
            permanent: false,
            direction: 'top',
            offset: [0, -10]
          });
          
          markersRef.current.set(place.id, marker);
        } catch (e) {
          console.warn('Error creating marker for place:', place, e);
        }
      });
    } catch (error) {
      console.error('Error updating map markers:', error);
    }
  };

  const getStatusColor = (status) => {
    return status === 1 ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = (status) => {
    return status === 1 ? 'Active' : 'Inactive';
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

      {/* Loading overlay */}
      {(loading || !mapLoaded) && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-[999]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {loading ? 'Loading places data...' : 'Loading OpenStreetMap...'}
            </p>
          </div>
        </div>
      )}

      {/* API Error notification */}
      {apiError && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-[999]">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold">API Error</p>
              <p className="text-sm">{apiError}</p>
            </div>
            <button
              onClick={refreshPlaces}
              className="ml-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Location Error notification */}
      {locationError && (
        <div className="absolute top-20 left-4 right-4 bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded z-[999]">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-orange-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">Location Error</p>
              <p className="text-sm">{locationError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute top-1/2 right-2 sm:right-4 z-[1000] flex flex-col space-y-2 transform -translate-y-1/2">
        {/* Refresh Places Button */}
        <button
          onClick={refreshPlaces}
          disabled={loading}
          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 touch-manipulation disabled:opacity-50"
          title="Refresh Places"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={loading ? 'animate-spin' : ''}>
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>

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

        {/* Center on Places Button */}
        <button
          onClick={centerOnPlaces}
          disabled={places.length === 0}
          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 touch-manipulation disabled:opacity-50"
          title="Fit to All Places"
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

      {/* Place details information box */}
      {selectedPlace && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl max-w-sm w-80 z-[1001] transform transition-all duration-300 ease-in-out">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <h2 className="text-lg font-bold truncate">{selectedPlace.place_name}</h2>
            <button
              onClick={() => setSelectedPlace(null)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors flex-shrink-0 ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {/* Place Icon Display */}
            <div className="flex items-center justify-center">
              <img 
                src={getPlaceIconUrl(selectedPlace)} 
                alt={selectedPlace.place_type || 'Place'}
                className="w-12 h-12"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              />
            </div>
            
            {selectedPlace.place_type && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                <span className="font-medium text-gray-700 mr-2">Type:</span>
                <span className="px-2 py-1 bg-gray-700 text-white rounded text-sm">{selectedPlace.place_type.trim()}</span>
              </div>
            )}
            
            {selectedPlace.description && (
              <div>
                <div className="flex items-start mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  <span className="font-medium text-gray-700">Description:</span>
                </div>
                <p className="text-gray-600 bg-gray-50 p-3 rounded text-sm leading-relaxed">{selectedPlace.description}</p>
              </div>
            )}
            
            <div className="flex items-center">
              <div className={`w-2 h-2 ${selectedPlace.status === 1 ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-3 flex-shrink-0`}></div>
              <span className="font-medium text-gray-700 mr-2">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedPlace.status)} ${selectedPlace.status === 1 ? 'bg-green-100' : 'bg-red-100'}`}>
                {getStatusText(selectedPlace.status)}
              </span>
            </div>
            
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-1">Coordinates:</p>
              <p className="font-mono text-xs break-all">{selectedPlace.latitude.toFixed(6)}, {selectedPlace.longitude.toFixed(6)}</p>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  if (mapInstance.current) {
                    mapInstance.current.setView([selectedPlace.latitude, selectedPlace.longitude], 19, {
                      animate: true,
                      duration: 1.5
                    });
                  }
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Center on Map
              </button>
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`;
                  window.open(url, '_blank');
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Get Directions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend/Place Types Panel */}
      {places.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[999] max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-800">Available Services</h3>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {places.length} places
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Array.from(new Set(places.map(p => p.place_type).filter(Boolean))).map(type => {
              // Find a place with this type to get its icon
              const placeWithType = places.find(p => p.place_type === type);
              return (
                <div key={type} className="flex items-center space-x-1">
                  <img 
                    src={getPlaceIconUrl(placeWithType)} 
                    alt={type}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 truncate">{type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No places message */}
      {!loading && places.length === 0 && !apiError && (
        <div className="absolute bottom-4 left-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-3 z-[999] max-w-xs">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-yellow-600 mr-2" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <div>
              <p className="font-medium text-yellow-800 text-sm">No places found</p>
              <p className="text-yellow-700 text-xs">Try refreshing to load places</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
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
        
        .custom-place-icon {
          background: none !important;
          border: none !important;
        }
        
        .custom-user-icon {
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
        
        /* Scrollbar styling for sidebar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default ImportantPlaces;