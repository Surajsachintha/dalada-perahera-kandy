import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Route, Users, Bell, ChevronDown, ChevronUp, X, Maximize2 } from 'lucide-react';

const ProcessionRoute = () => {
  const mapRef = useRef(null);
  const modalMapRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [modalMapLoaded, setModalMapLoaded] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [peraheraData, setLoadApiData] = useState({});
  
  // Perahera route data for different days
  const peraheraDataDefault = {
    1: {
    date: "2025-07-29T18:30:00.000Z",
    title: "1st Kumbal Perahera",
    startTime: "07:05 PM",
    duration: "2 hours",
    participants: "150+",
    description: "The first day of the grand Esala Perahera, featuring traditional dancers, drummers, and decorated elephants processing through the historic streets of Kandy.",
    route: [
      {
        lat: 7.293149,
        lng: 80.640455,
        name: "Dalada Street",
        type: "start"
      },
      {
        lat: 7.293114,
        lng: 80.638559,
        name: "D.S Senanayake Street",
        type: "waypoint"
      },
      {
        lat: 7.293543,
        lng: 80.638452,
        name: "D.S Senanayake Street",
        type: "waypoint"
      },
      {
        lat: 7.293601,
        lng: 80.639251,
        name: "Temple Street",
        type: "waypoint"
      },
      {
        lat: 7.293995,
        lng: 80.639321,
        name: "Temple Street",
        type: "waypoint"
      },
      {
        lat: 7.294495,
        lng: 80.635879,
        name: "Colombo Street",
        type: "waypoint"
      },
      {
        lat: 7.295368,
        lng: 80.63582,
        name: "Kandy Street",
        type: "waypoint"
      },
      {
        lat: 7.294825,
        lng: 80.640327,
        name: "Raja Street",
        type: "end"
      }
    ]
  }
  };

  // Use API data if available, otherwise use default data
  const activeData = Object.keys(peraheraData).length > 0 ? peraheraData : peraheraDataDefault;

  const loadApiDataFetch = async () => {
    try {
      const response = await fetch('https://beautyme.lk:4599/json/roadmaps');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Use API data if it has the expected structure
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setLoadApiData(data);
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
      // Continue using default data on error
    }
  };

  const days = Object.keys(activeData).map(key => ({
    id: parseInt(key),
    ...activeData[key]
  }));

  // Initialize main map - removed since we only need modal map
  useEffect(() => {
    loadApiDataFetch();
  }, []);

  // Initialize modal map when modal opens
  useEffect(() => {
    if (!isModalOpen || !modalMapRef.current) return;

    const initializeModalMap = () => {
      if (!window.L || !modalMapRef.current) return;

      // Always remove existing map instance before creating new one
      if (modalMapRef.current.leafletMap) {
        modalMapRef.current.leafletMap.remove();
        modalMapRef.current.leafletMap = null;
      }

      try {
        // Reset the modal map loaded state
        setModalMapLoaded(false);
        
        const map = window.L.map(modalMapRef.current).setView([7.2906, 80.6337], 15);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        modalMapRef.current.leafletMap = map;
        setModalMapLoaded(true);
        
        // Small delay to ensure map is fully rendered before updating route
        setTimeout(() => {
          updateMapRoute(selectedDay, map);
        }, 100);
      } catch (error) {
        console.error('Error initializing modal map:', error);
      }
    };

    if (window.L) {
      // Add a small delay to ensure DOM is ready
      setTimeout(initializeModalMap, 50);
    } else {
      // Load Leaflet if not already loaded
      const loadLeaflet = () => {
        const existingCSS = document.querySelector('link[href*="leaflet.css"]');
        if (!existingCSS) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(cssLink);
        }

        // Add custom popup styles if not already added
        const existingStyles = document.querySelector('#custom-leaflet-styles');
        if (!existingStyles) {
          const customStyles = document.createElement('style');
          customStyles.id = 'custom-leaflet-styles';
          customStyles.textContent = `
            .custom-popup .leaflet-popup-content-wrapper {
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              border: none;
            }
            
            .custom-popup .leaflet-popup-content {
              margin: 0;
              line-height: 1.4;
            }
            
            .custom-popup .leaflet-popup-tip {
              background: white;
              border: none;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .route-popup .leaflet-popup-content-wrapper {
              background: #f8fafc;
              border: 2px solid #0B1FF5;
            }
            
            .custom-popup .leaflet-popup-close-button {
              color: #666;
              font-size: 18px;
              padding: 4px 4px 0 0;
            }
            
            .custom-popup .leaflet-popup-close-button:hover {
              color: #333;
            }
          `;
          document.head.appendChild(customStyles);
        }

        const existingScript = document.querySelector('script[src*="leaflet.js"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            setTimeout(initializeModalMap, 50);
          };
          document.head.appendChild(script);
        }
      };

      loadLeaflet();
    }

    // Cleanup function for modal map
    return () => {
      if (modalMapRef.current?.leafletMap) {
        modalMapRef.current.leafletMap.remove();
        modalMapRef.current.leafletMap = null;
        setModalMapLoaded(false);
      }
    };
  }, [isModalOpen, selectedDay]); // Added selectedDay to dependencies

  // Update map route when day changes - only for modal map
  useEffect(() => {
    if (modalMapLoaded && modalMapRef.current?.leafletMap) {
      updateMapRoute(selectedDay, modalMapRef.current.leafletMap);
    }
  }, [selectedDay, modalMapLoaded]);

  const updateMapRoute = (day, mapInstance) => {
    if (!mapInstance || !window.L) return;

    const data = activeData[day];

    if (!data || !data.route) return;

    // Clear existing markers and routes
    mapInstance.eachLayer((layer) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
        mapInstance.removeLayer(layer);
      }
    });

    // Add route markers
    const routeCoords = [];
    const markers = [];
    
    data.route.forEach((point, index) => {
      if (point && typeof point.lat === 'number' && typeof point.lng === 'number') {
        const icon = getMarkerIcon(point.type, index);
        if (icon) {
          // Create detailed popup content
          const popupContent = createPopupContent(point, index, data);
          
          const marker = window.L.marker([point.lat, point.lng], { icon })
            .addTo(mapInstance)
            .bindPopup(popupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            });
          
          // Add click event to open popup
          marker.on('click', function() {
            this.openPopup();
          });
          
          markers.push(marker);
          routeCoords.push([point.lat, point.lng]);
        }
      }
    });

    // Draw route line
    if (routeCoords.length > 1) {
      const polyline = window.L.polyline(routeCoords, {
        color: '#0B1FF5',
        weight: 4,
        opacity: 0.8
      }).addTo(mapInstance);
      
      // Add click event to polyline to show route info
      polyline.on('click', function(e) {
        const routePopupContent = createRoutePopupContent(data);
        window.L.popup({
          maxWidth: 350,
          className: 'custom-popup route-popup'
        })
        .setLatLng(e.latlng)
        .setContent(routePopupContent)
        .openOn(mapInstance);
      });
    }

    // Fit map to route bounds safely
    if (markers.length > 0) {
      try {
        const group = new window.L.featureGroup(markers);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          mapInstance.fitBounds(bounds.pad(0.1));
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to default view
        mapInstance.setView([7.2906, 80.6337], 15);
      }
    }
  };

  const createPopupContent = (point, index, data) => {
    const pointType = point.type === 'start' ? 'Starting Point' : 
                     point.type === 'end' ? 'End Point' : 
                     `Route Point ${index + 1}`;
    
    const estimatedTime = calculateEstimatedTime(index, data);
    
    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background: ${point.type === 'start' ? '#10b981' : point.type === 'end' ? '#ef4444' : '#3b82f6'}; 
                    color: white; padding: 8px; margin: -10px -10px 10px -10px; border-radius: 4px 4px 0 0;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${point.name}</h3>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">${pointType}</p>
        </div>
        
        <div style="padding: 8px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; 
                         background: ${point.type === 'start' ? '#10b981' : point.type === 'end' ? '#ef4444' : '#3b82f6'}; 
                         margin-right: 8px;"></span>
            <span style="font-size: 13px; color: #666;">Position: ${index + 1} of ${data.route.length}</span>
          </div>
          
          ${estimatedTime ? `
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <span style="margin-right: 8px;">🕐</span>
              <span style="font-size: 13px; color: #666;">Est. arrival: ${estimatedTime}</span>
            </div>
          ` : ''}
          
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="margin-right: 8px;">📍</span>
            <span style="font-size: 13px; color: #666;">Lat: ${point.lat.toFixed(6)}, Lng: ${point.lng.toFixed(6)}</span>
          </div>
          
          ${point.type === 'start' ? `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 8px; margin-top: 8px;">
              <strong style="color: #065f46; font-size: 12px;">🚩 Procession starts here at ${data.startTime}</strong>
            </div>
          ` : point.type === 'end' ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px; margin-top: 8px;">
              <strong style="color: #991b1b; font-size: 12px;">🏁 Procession ends here</strong>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const createRoutePopupContent = (data) => {
    return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background: #0B1FF5; color: white; padding: 8px; margin: -10px -10px 10px -10px; border-radius: 4px 4px 0 0;">
          <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${data.title}</h3>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Procession Route Information</p>
        </div>
        
        <div style="padding: 8px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="margin-right: 8px;">📅</span>
            <span style="font-size: 13px; color: #666;">${formatDate(data.date)}</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="margin-right: 8px;">🕐</span>
            <span style="font-size: 13px; color: #666;">${data.startTime} (${data.duration})</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <span style="margin-right: 8px;">👥</span>
            <span style="font-size: 13px; color: #666;">${data.participants} participants</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="margin-right: 8px;">📍</span>
            <span style="font-size: 13px; color: #666;">${data.route.length} route points</span>
          </div>
          
          ${data.description ? `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; margin-top: 8px;">
              <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">${data.description}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const calculateEstimatedTime = (index, data) => {
    if (!data.startTime || index === 0) return null;
    
    try {
      // Parse start time (assuming format like "07:05 PM")
      const startTime = new Date(`${new Date().toDateString()} ${data.startTime}`);
      // Estimate 10 minutes between each point
      const estimatedMinutes = index * 10;
      const estimatedTime = new Date(startTime.getTime() + estimatedMinutes * 60000);
      
      return estimatedTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return null;
    }
  };

  const getMarkerIcon = (type, index) => {
    if (!window.L) return null;

    let color = '#3b82f6';
    let content = index + 1;
    
    if (type === 'start') {
      color = '#10b981';
      content = 'S';
    } else if (type === 'end') {
      color = '#ef4444';
      content = 'E';
    }

    try {
      return window.L.divIcon({
        html: `<div style="
          background-color: ${color}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-weight: bold; 
          font-size: 11px;
          font-family: Arial, sans-serif;
        ">${content}</div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    } catch (error) {
      console.error('Error creating marker icon:', error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMapClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    // Clean up map before closing modal
    if (modalMapRef.current?.leafletMap) {
      modalMapRef.current.leafletMap.remove();
      modalMapRef.current.leafletMap = null;
    }
    setModalMapLoaded(false);
    setIsModalOpen(false);
  };

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleModalClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);

  const currentData = activeData[selectedDay];

  // Safety check - if currentData is still undefined, show loading or error state
  if (!currentData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading procession data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Route Selection */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-400" />
                Perahera Route Map
              </h2>
              <div className="space-y-3">
                {days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => {
                      setSelectedDay(day.id);
                      setIsModalOpen(true);
                    }}
                    className="w-full text-left p-4 rounded-lg transition-all duration-200 bg-gray-700 hover:bg-orange-600 text-gray-300 hover:text-white group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold group-hover:text-white">{day.title}</div>
                        <div className="text-sm opacity-75">{formatDate(day.date)}</div>
                        <div className="text-xs mt-1 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {day.startTime} • {day.duration}
                        </div>
                      </div>
                      <div className="flex items-center text-orange-400 group-hover:text-white">
                        <MapPin className="w-5 h-5 mr-1" />
                        <span className="text-sm">View Map</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Selection Info */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-orange-400">
                {currentData.title}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{formatDate(currentData.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{currentData.startTime} ({currentData.duration})</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{currentData.participants} participants</span>
                </div>
              </div>

              <div className="mb-4">
                <button
                  onClick={() => setExpandedInfo(!expandedInfo)}
                  className="flex items-center text-orange-400 hover:text-orange-300 transition-colors"
                >
                  <span className="mr-2">Route Information</span>
                  {expandedInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {expandedInfo && (
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm mb-4">{currentData.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-400 flex items-center">
                      <Route className="w-4 h-4 mr-2" />
                      Route Points
                    </h4>
                    {currentData.route.map((point, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          point.type === 'start' ? 'bg-green-500' : 
                          point.type === 'end' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-gray-300">{point.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Map Button */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-all duration-200 text-white font-semibold hover:scale-105 transform"
                >
                  <MapPin className="w-5 h-5" />
                  <span>View Interactive Route Map</span>
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-400" />
                {currentData.title} - Detailed Route Map
              </h2>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 min-h-0">
              <div className="h-full relative">
                <div
                  ref={modalMapRef}
                  className="w-full h-full rounded-lg overflow-hidden"
                  style={{ minHeight: '500px' }}
                >
                  {!modalMapLoaded && (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading detailed map...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-300">Start Point</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-300">Route Points</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-gray-300">End Point</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-4 h-1 bg-blue-700 mr-2"></div>
                  <span className="text-gray-300">Route Path</span>
                </div>
                <div className="flex items-center text-sm text-orange-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{currentData.startTime} ({currentData.duration})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProcessionRoute;