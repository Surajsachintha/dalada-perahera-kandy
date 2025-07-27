import React, { useEffect, useRef, useState } from 'react';

const LiveViewingSpaces = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [crowdData, setCrowdData] = useState([]);
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
  const linesRef = useRef(new Map()); // New ref for storing line polylines
  const userMarkerRef = useRef(null);
  const locationWatchRef = useRef(null);

  // API endpoint
  const API_URL = 'https://beautyme.lk:4599/json/spaces';

  // Fetch live data from API
  const fetchLiveData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URL, {
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
      
      // Transform API data to match component structure with start/end coordinates
      const transformedData = data.map(item => {
        // Validate and parse coordinates
        const parseCoordinate = (coord) => {
          const parsed = parseFloat(coord);
          return isNaN(parsed) ? null : parsed;
        };

        // Parse start coordinates
        const start = item.start ? {
          lat: parseCoordinate(item.start.latitude),
          lng: parseCoordinate(item.start.longitude)
        } : null;

        // Parse end coordinates  
        const end = item.end ? {
          lat: parseCoordinate(item.end.latitude),
          lng: parseCoordinate(item.end.longitude)
        } : null;

        // Validate that start and end coordinates are valid
        const hasValidStart = start && start.lat !== null && start.lng !== null;
        const hasValidEnd = end && end.lat !== null && end.lng !== null;

        // Parse main coordinates with fallbacks
        let mainLat = parseCoordinate(item.latitude);
        let mainLng = parseCoordinate(item.longitude);

        // If main coordinates are invalid, try to use start coordinates
        if ((mainLat === null || mainLng === null) && hasValidStart) {
          mainLat = start.lat;
          mainLng = start.lng;
        }

        return {
          id: item.id,
          name: item.name_si || 'Unknown',
          nameEn: item.name_en || 'Unknown',
          rangeNumber: item.range_number,
          capacity: parseInt(item.capacity) || 0,
          current: parseInt(item.current) || 0,
          coordinates: { 
            lat: mainLat || 7.2936, // Default to Kandy if invalid
            lng: mainLng || 80.6396
          },
          // Only include start/end if both are valid
          start: hasValidStart ? start : null,
          end: hasValidEnd ? end : null,
          lastUpdated: formatLastUpdated(item.last_updated)
        };
      }).filter(item => 
        // Filter out items with invalid main coordinates
        item.coordinates.lat !== null && 
        item.coordinates.lng !== null &&
        !isNaN(item.coordinates.lat) && 
        !isNaN(item.coordinates.lng)
      );

      setCrowdData(transformedData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching live data:', err);
      setError(`Failed to fetch data: ${err.message}`);
      setLoading(false);
    }
  };

  // Format last updated time to relative time
  const formatLastUpdated = (timestamp) => {
    try {
      const updateTime = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - updateTime) / 1000);
      
      if (diffInSeconds < 60) {
        return diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds}s ago`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
      }
    } catch (error) {
      return 'Unknown';
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

    // Set up polling interval for live updates (every 30 seconds)
    const interval = setInterval(fetchLiveData, 30000);

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
      
      // Clear markers and lines
      if (markersRef.current) {
        markersRef.current.clear();
      }
      
      if (linesRef.current) {
        linesRef.current.clear();
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

  // Update map markers and lines when crowd data changes
  useEffect(() => {
    if (crowdData.length > 0 && mapInstance.current && window.L) {
      updateMapMarkersAndLines();
    }
  }, [crowdData]);

  const getCrowdLevel = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return { level: 'critical', color: '#EF4444', text: 'ඉතා ගැහැනුණු' };
    if (percentage >= 70) return { level: 'high', color: '#F97316', text: 'ගැහැනුණු' };
    if (percentage >= 40) return { level: 'moderate', color: '#EAB308', text: 'මධ්‍යම' };
    return { level: 'low', color: '#22C55E', text: 'හිස්' };
  };

  // New function to get color based on available space percentage
  const getAvailabilityColor = (available, capacity) => {
    const availablePercentage = (available / capacity) * 100;
    if (availablePercentage >= 70) return { 
      color: '#22C55E', // Green - plenty of space
      bgColor: '#22C55E',
      fillColor: '#22C55E',
      fillOpacity: 0.2,
      text: 'Plenty Available'
    };
    if (availablePercentage >= 50) return { 
      color: '#84CC16', // Light green - good availability
      bgColor: '#84CC16',
      fillColor: '#84CC16', 
      fillOpacity: 0.25,
      text: 'Good Availability'
    };
    if (availablePercentage >= 30) return { 
      color: '#EAB308', // Yellow - moderate availability
      bgColor: '#EAB308',
      fillColor: '#EAB308',
      fillOpacity: 0.3,
      text: 'Moderate Availability'
    };
    if (availablePercentage >= 15) return { 
      color: '#F97316', // Orange - limited availability
      bgColor: '#F97316',
      fillColor: '#F97316',
      fillOpacity: 0.35,
      text: 'Limited Availability'
    };
    return { 
      color: '#EF4444', // Red - very limited availability
      bgColor: '#EF4444',
      fillColor: '#EF4444',
      fillOpacity: 0.4,
      text: 'Very Limited'
    };
  };

  const updateMapMarkersAndLines = () => {
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

      // Clear existing lines
      linesRef.current.forEach(line => {
        if (mapInstance.current && line) {
          try {
            mapInstance.current.removeLayer(line);
          } catch (e) {
            console.warn('Error removing line:', e);
          }
        }
      });
      linesRef.current.clear();

      // Create markers and lines for each crowd location
      crowdData.forEach((street) => {
        try {
          // Validate street data
          if (!street || !street.coordinates || isNaN(street.coordinates.lat) || isNaN(street.coordinates.lng)) {
            console.warn('Invalid street coordinates:', street);
            return;
          }

          const crowdLevel = getCrowdLevel(street.current, street.capacity);
          const availableSpaces = street.capacity - street.current;
          const percentage = ((street.current / street.capacity) * 100).toFixed(1);
          const availabilityColor = getAvailabilityColor(availableSpaces, street.capacity);

          // Draw line if start and end coordinates are available and valid
          if (street.start && street.end && 
              !isNaN(street.start.lat) && !isNaN(street.start.lng) &&
              !isNaN(street.end.lat) && !isNaN(street.end.lng)) {
            
            const lineCoordinates = [
              [street.start.lat, street.start.lng],
              [street.end.lat, street.end.lng]
            ];

            // Validate line coordinates
            const isValidLine = lineCoordinates.every(coord => 
              Array.isArray(coord) && 
              coord.length === 2 && 
              !isNaN(coord[0]) && 
              !isNaN(coord[1]) &&
              Math.abs(coord[0]) <= 90 && // Valid latitude range
              Math.abs(coord[1]) <= 180   // Valid longitude range
            );

            if (!isValidLine) {
              console.warn('Invalid line coordinates:', lineCoordinates);
              return;
            }

            const lineOptions = {
              color: availabilityColor.color, // Use dynamic color based on availability
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 5', // Dashed line pattern
              lineCap: 'round',
              lineJoin: 'round'
            };

            const polyline = L.polyline(lineCoordinates, lineOptions).addTo(mapInstance.current);
            
            // Add popup to the line
            const linePopupContent = `
              <div style="font-family: Arial, sans-serif; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: ${availabilityColor.color};">📍 ${street.name}${street.rangeNumber ? ` - Range ${street.rangeNumber}` : ''}</h4>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">${street.nameEn}</p>
                
                <div style="margin: 8px 0; padding: 8px; background: ${availabilityColor.color}22; border-radius: 6px;">
                  <div style="font-size: 14px; color: ${availabilityColor.color}; font-weight: bold;">
                    📏 Viewing Area - ${availabilityColor.text}
                  </div>
                  ${street.rangeNumber ? `<div style="font-size: 12px; color: ${availabilityColor.color}; margin: 2px 0;">Range ${street.rangeNumber}</div>` : ''}
                  <div style="font-size: 12px; color: ${availabilityColor.color}; margin: 4px 0;">
                    ${availableSpaces.toLocaleString()} spaces available (${((availableSpaces / street.capacity) * 100).toFixed(1)}%)
                  </div>
                  <div style="font-size: 11px; color: #666; margin-top: 4px;">
                    Start: ${street.start.lat.toFixed(6)}, ${street.start.lng.toFixed(6)}<br>
                    End: ${street.end.lat.toFixed(6)}, ${street.end.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            `;
            
            polyline.bindPopup(linePopupContent);
            linesRef.current.set(`${street.id}_line`, polyline);

            // Calculate center point for circle placement
            const centerLat = (street.start.lat + street.end.lat) / 2;
            const centerLng = (street.start.lng + street.end.lng) / 2;

            // Validate center coordinates
            if (isNaN(centerLat) || isNaN(centerLng)) {
              console.warn('Invalid center coordinates:', centerLat, centerLng);
              return;
            }

            // Create a circle at the center of the line showing available spaces
            const circleRadius = Math.min(Math.max(availableSpaces / 100, 20), 80); // Dynamic radius based on available spaces

            const circle = L.circle([centerLat, centerLng], {
              color: availabilityColor.color,
              fillColor: availabilityColor.fillColor,
              fillOpacity: availabilityColor.fillOpacity,
              radius: circleRadius,
              weight: 3
            }).addTo(mapInstance.current);

            // Add available spaces text in the center of the circle
            const circleIconHtml = `
              <div style="
                background: ${availabilityColor.bgColor};
                color: white;
                border: 2px solid white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 11px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                position: relative;
              ">
                <div style="text-align: center; line-height: 1;">
                  <div style="font-size: 10px;">${availableSpaces > 999 ? `${(availableSpaces/1000).toFixed(1)}k` : availableSpaces}</div>
                  <div style="font-size: 6px; opacity: 0.9;">FREE</div>
                </div>
              </div>
            `;

            const circleIcon = L.divIcon({
              html: circleIconHtml,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              className: 'custom-circle-icon'
            });

            const circleMarker = L.marker([centerLat, centerLng], { 
              icon: circleIcon 
            }).addTo(mapInstance.current);

            // Add popup to circle marker
            const circlePopupContent = `
              <div style="font-family: Arial, sans-serif; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: ${availabilityColor.color};">
                  🔵 ${street.name}${street.rangeNumber ? ` - Range ${street.rangeNumber}` : ''} - Available Spaces
                </h4>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">${street.nameEn}</p>
                
                <div style="margin: 8px 0; padding: 12px; background: linear-gradient(135deg, ${availabilityColor.color}, ${availabilityColor.color}aa); border-radius: 8px; color: white; text-align: center;">
                  ${street.rangeNumber ? `<div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">Range ${street.rangeNumber}</div>` : ''}
                  <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">
                    ${availableSpaces.toLocaleString()}
                  </div>
                  <div style="font-size: 12px; opacity: 0.9;">Available Spaces</div>
                  <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">
                    ${availabilityColor.text}
                  </div>
                </div>

                <div style="margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 6px;">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                    <div>
                      <div style="color: #666;">Current</div>
                      <div style="font-weight: bold; color: ${availabilityColor.color};">${street.current.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style="color: #666;">Capacity</div>
                      <div style="font-weight: bold; color: ${availabilityColor.color};">${street.capacity.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div style="margin: 8px 0; padding: 6px; background: ${availabilityColor.color}22; border-radius: 4px; text-align: center;">
                  <div style="font-size: 12px; font-weight: bold; color: ${availabilityColor.color};">
                    ${((availableSpaces / street.capacity) * 100).toFixed(1)}% Available
                  </div>
                </div>
              </div>
            `;
            
            circleMarker.bindPopup(circlePopupContent);

            // Store both line and circle references
            linesRef.current.set(`${street.id}_line`, polyline);
            linesRef.current.set(`${street.id}_circle`, circle);
            linesRef.current.set(`${street.id}_circle_marker`, circleMarker);
            
            // Use center point for marker if coordinates are not provided separately
            if (!street.coordinates.lat && !street.coordinates.lng) {
              street.coordinates = { lat: centerLat, lng: centerLng };
            }
          }

          // Create custom icon based on crowd level (only show if no start/end coordinates)
          if (!street.start || !street.end) {
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
          }
        } catch (e) {
          console.warn('Error creating marker/line for street:', street, e);
        }
      });
    } catch (error) {
      console.error('Error updating map markers and lines:', error);
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
        const allCoordinates = [];
        
        // Add all coordinates (markers, start points, end points)
        crowdData.forEach(street => {
          allCoordinates.push([street.coordinates.lat, street.coordinates.lng]);
          if (street.start) {
            allCoordinates.push([street.start.lat, street.start.lng]);
          }
          if (street.end) {
            allCoordinates.push([street.end.lat, street.end.lng]);
          }
        });
        
        if (allCoordinates.length > 0) {
          const bounds = window.L.latLngBounds(allCoordinates);
          if (bounds.isValid()) {
            mapInstance.current.fitBounds(bounds, { 
              padding: [20, 20],
              maxZoom: 16
            });
          }
        }
      } catch (e) {
        console.warn('Error fitting to locations:', e);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Loading Overlay with Circular Progress */}
      {loading && (
        <div className="absolute inset-0 z-[2000] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
            {/* Circular Progress Bar */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="175.93"
                  strokeDashoffset="0"
                  className="animate-spin-slow"
                  style={{
                    animation: 'spin 2s linear infinite'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Loading Text */}
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800 mb-1">
                Loading Live Data
              </div>
              <div className="text-sm text-gray-600">
                Fetching viewing spaces...
              </div>
            </div>
          </div>
        </div>
      )}

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
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={loading ? 'animate-spin' : ''}>
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

        {/* Error Details */}
        {error && (
          <div className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg text-xs sm:text-sm bg-red-50 text-red-700 max-w-xs">
            <div className="font-medium mb-1">Connection Issue</div>
            <div className="text-red-600">{error}</div>
            <button 
              onClick={fetchLiveData}
              className="mt-2 text-red-800 underline hover:no-underline"
            >
              Retry
            </button>
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
            
            {selectedStreet.rangeNumber && (
              <div className="bg-blue-50 p-2 rounded mb-2">
                <div className="text-blue-700 text-sm font-medium">Range {selectedStreet.rangeNumber}</div>
              </div>
            )}
            
            <div className="bg-green-50 p-3 rounded">
              <div className="font-bold text-green-700 text-xl">
                {(selectedStreet.capacity - selectedStreet.current).toLocaleString()}
              </div>
              <div className="text-green-600 text-sm">Available Spaces</div>
              <div className="text-green-500 text-xs">
                {(((selectedStreet.capacity - selectedStreet.current) / selectedStreet.capacity) * 100).toFixed(1)}% available
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">Current</div>
                  <div className="font-medium">{selectedStreet.current.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Capacity</div>
                  <div className="font-medium">{selectedStreet.capacity.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Show viewing area info if available */}
            {selectedStreet.start && selectedStreet.end && (
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-blue-700 text-sm font-medium mb-2">📏 Viewing Area</div>
                <div className="text-xs text-blue-600">
                  <div>Start: {selectedStreet.start.lat.toFixed(4)}, {selectedStreet.start.lng.toFixed(4)}</div>
                  <div>End: {selectedStreet.end.lat.toFixed(4)}, {selectedStreet.end.lng.toFixed(4)}</div>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Updated {selectedStreet.lastUpdated}
            </div>
          </div>
        </div>
      )}

      {/* Data Summary Panel
      {crowdData.length > 0 && (
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-[1000] bg-white/90 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="text-sm font-medium text-gray-800 mb-2">
            {crowdData.length} Viewing Locations
            {crowdData.filter(loc => loc.start && loc.end).length > 0 && (
              <span className="text-blue-600 text-xs ml-2">
                ({crowdData.filter(loc => loc.start && loc.end).length} with areas)
              </span>
            )}
          </div>
          <div className="space-y-1 text-xs">
            {crowdData.map(location => {
              const available = location.capacity - location.current;
              const percentage = (available / location.capacity) * 100;
              return (
                <div key={location.id} className="flex justify-between items-center">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {location.nameEn}
                    {location.start && location.end && (
                      <span className="text-blue-500 ml-1">📏</span>
                    )}
                    {location.rangeNumber && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded ml-1">R{location.rangeNumber}</span>
                    )}
                  </span>
                  <span className={`font-medium ${
                    percentage > 50 ? 'text-green-600' : 
                    percentage > 20 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {available > 999 ? `${(available/1000).toFixed(1)}k` : available}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )} */}

      {/* Legend */}
      {/* <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-[1000] bg-white/90 rounded-lg shadow-lg p-3 text-xs">
        <div className="font-medium text-gray-800 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Plenty Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Limited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-gray-400" style={{clipPath: 'polygon(0 40%, 100% 40%, 100% 60%, 0 60%)', position: 'relative'}}>
              <div style={{position: 'absolute', top: '-2px', left: '25%', width: '2px', height: '6px', background: '#9CA3AF'}}></div>
              <div style={{position: 'absolute', top: '-2px', left: '75%', width: '2px', height: '6px', background: '#9CA3AF'}}></div>
            </div>
            <span>Color = Availability</span>
          </div>
        </div>
      </div> */}

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
        
        .custom-circle-icon {
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

        /* Loading animation for refresh button */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Slower spin for progress bar */
        @keyframes spin-slow {
          from {
            transform: rotate(-90deg);
          }
          to {
            transform: rotate(270deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }

        /* Custom styles for blue lines */
        .leaflet-interactive {
          cursor: pointer;
        }
        
        /* Pulse animation for line areas */
        @keyframes lineGlow {
          0%, 100% {
            filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.8));
          }
        }
      `}</style>
    </div>
  );
};

export default LiveViewingSpaces;