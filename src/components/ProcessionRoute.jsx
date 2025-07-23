import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Route, Users, Bell, ChevronDown, ChevronUp } from 'lucide-react';

const ProcessionRoute = () => {
  const mapRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const [peraheraData, setLoadApiData] = useState({});
  
  // Perahera route data for different days
  const peraheraDataDefault = {
    1: {
      date: "2025-08-01T18:30:00.000Z",
      title: "Kumbal Perahera - Day 1",
      startTime: "7:30 PM",
      duration: "2 hours",
      participants: "150+",
      route: [
        { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "start" },
        { name: "Kandy Lake Round", lat: 7.2916, lng: 80.6356, type: "waypoint" },
        { name: "Queen's Hotel Junction", lat: 7.2936, lng: 80.6376, type: "waypoint" },
        { name: "Clock Tower", lat: 7.2946, lng: 80.6396, type: "waypoint" },
        { name: "Dalada Veediya", lat: 7.2926, lng: 80.6346, type: "waypoint" },
        { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "end" }
      ],
      description: "The first day of Kumbal Perahera featuring traditional drummers and flag bearers."
    },
    // 2: {
    //   date: "2025-08-02T18:30:00.000Z",
    //   title: "Kumbal Perahera - Day 2",
    //   startTime: "7:30 PM",
    //   duration: "2.5 hours",
    //   participants: "200+",
    //   route: [
    //     { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "start" },
    //     { name: "Kandy Lake Bund", lat: 7.2916, lng: 80.6356, type: "waypoint" },
    //     { name: "Dalada Veediya", lat: 7.2926, lng: 80.6346, type: "waypoint" },
    //     { name: "D.S. Senanayake Veediya", lat: 7.2936, lng: 80.6376, type: "waypoint" },
    //     { name: "Yatinuwara Veediya", lat: 7.2946, lng: 80.6396, type: "waypoint" },
    //     { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "end" }
    //   ],
    //   description: "Enhanced procession with additional cultural performances and decorative elephants."
    // },
    // 3: {
    //   date: "2025-08-03T18:30:00.000Z",
    //   title: "Kumbal Perahera - Day 3",
    //   startTime: "7:30 PM",
    //   duration: "3 hours",
    //   participants: "250+",
    //   route: [
    //     { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "start" },
    //     { name: "Kandy Lake Circuit", lat: 7.2916, lng: 80.6356, type: "waypoint" },
    //     { name: "Queens Hotel", lat: 7.2936, lng: 80.6376, type: "waypoint" },
    //     { name: "Tooth Relic Temple", lat: 7.2906, lng: 80.6337, type: "end" }
    //   ],
    //   description: "Grand finale of Kumbal Perahera with full ceremonial display."
    // },
    // 4: {
    //   date: "2025-08-04T18:30:00.000Z",
    //   title: "Randoli Perahera - Day 1",
    //   startTime: "8:00 PM",
    //   duration: "3.5 hours",
    //   participants: "300+",
    //   route: [
    //     { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "start" },
    //     { name: "Kandy Lake Round", lat: 7.2916, lng: 80.6356, type: "waypoint" },
    //     { name: "Queen's Hotel Junction", lat: 7.2936, lng: 80.6376, type: "waypoint" },
    //     { name: "Clock Tower", lat: 7.2946, lng: 80.6396, type: "waypoint" },
    //     { name: "William Gopallawa Mawatha", lat: 7.2956, lng: 80.6416, type: "waypoint" },
    //     { name: "Dalada Veediya", lat: 7.2926, lng: 80.6346, type: "waypoint" },
    //     { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "end" }
    //   ],
    //   description: "First day of the grand Randoli Perahera with majestic elephants and traditional dancers."
    // },
    // 5: {
    //   date: "2025-08-05T18:30:00.000Z",
    //   title: "Randoli Perahera - Day 2",
    //   startTime: "8:00 PM",
    //   duration: "4 hours",
    //   participants: "400+",
    //   route: [
    //     { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "start" },
    //     { name: "Kandy Lake Bund", lat: 7.2916, lng: 80.6356, type: "waypoint" },
    //     { name: "Dalada Veediya", lat: 7.2926, lng: 80.6346, type: "waypoint" },
    //     { name: "D.S. Senanayake Street", lat: 7.2936, lng: 80.6376, type: "waypoint" },
    //     { name: "Yatinuwara Veediya", lat: 7.2946, lng: 80.6396, type: "waypoint" },
    //     { name: "Trincomalee Street", lat: 7.2956, lng: 80.6416, type: "waypoint" },
    //     { name: "Sri Dalada Maligawa", lat: 7.2906, lng: 80.6337, type: "end" }
    //   ],
    //   description: "Spectacular procession featuring the famous Maligawa Tusker carrying the sacred relic casket."
    // }
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
      console.log(data);
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

  // Initialize map
  useEffect(() => {
    loadApiDataFetch();
    if (!mapRef.current || mapLoaded) return;

    const initializeMap = () => {
      if (!window.L || !mapRef.current) return;

      // Check if map is already initialized
      if (mapRef.current.leafletMap) {
        mapRef.current.leafletMap.remove();
        mapRef.current.leafletMap = null;
      }

      try {
        const map = window.L.map(mapRef.current).setView([7.2906, 80.6337], 15);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapRef.current.leafletMap = map;
        setMapLoaded(true);
        updateMapRoute(selectedDay);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Check if Leaflet is already loaded
    if (window.L) {
      initializeMap();
      return;
    }

    // Load Leaflet CSS and JS
    const loadLeaflet = () => {
      // Check if CSS is already loaded
      const existingCSS = document.querySelector('link[href*="leaflet.css"]');
      if (!existingCSS) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);
      }

      // Check if JS is already loaded
      const existingScript = document.querySelector('script[src*="leaflet.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initializeMap();
        };
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    };

    loadLeaflet();

    // Cleanup function
    return () => {
      if (mapRef.current?.leafletMap) {
        mapRef.current.leafletMap.remove();
        mapRef.current.leafletMap = null;
      }
    };
  }, []);

  // Update map route when day changes
  useEffect(() => {
    if (mapLoaded && mapRef.current?.leafletMap) {
      updateMapRoute(selectedDay);
    }
  }, [selectedDay, mapLoaded]);

  const updateMapRoute = (day) => {
    if (!mapRef.current?.leafletMap || !window.L) return;

    const map = mapRef.current.leafletMap;
    const data = activeData[day];

    if (!data || !data.route) return;

    // Clear existing markers and routes
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add route markers
    const routeCoords = [];
    const markers = [];
    
    data.route.forEach((point, index) => {
      if (point && typeof point.lat === 'number' && typeof point.lng === 'number') {
        const icon = getMarkerIcon(point.type, index);
        if (icon) {
          const marker = window.L.marker([point.lat, point.lng], { icon })
            .addTo(map)
            .bindPopup(`<strong>${point.name || 'Route Point'}</strong><br>${point.type === 'start' ? 'Starting Point' : point.type === 'end' ? 'End Point' : 'Route Point'}`);
          
          markers.push(marker);
          routeCoords.push([point.lat, point.lng]);
        }
      }
    });

    // Draw route line
    if (routeCoords.length > 1) {
      window.L.polyline(routeCoords, {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.8
      }).addTo(map);
    }

    // Fit map to route bounds safely
    if (markers.length > 0) {
      try {
        const group = new window.L.featureGroup(markers);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.1));
        }
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to default view
        map.setView([7.2906, 80.6337], 15);
      }
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Selection */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-400" />
                Select Day
              </h2>
              <div className="space-y-3">
                {days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.id)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      selectedDay === day.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{day.title}</div>
                    <div className="text-sm opacity-75">{formatDate(day.date)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Route Details */}
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
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-400" />
                Route Map
              </h3>
              <div className="relative">
                <div
                  ref={mapRef}
                  className="w-full h-96 md:h-[500px] rounded-lg overflow-hidden"
                  style={{ minHeight: '400px' }}
                >
                  {!mapLoaded && (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-2"></div>
                        <p className="text-gray-400">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Map Legend */}
                <div className="mt-4 flex flex-wrap gap-4 justify-center">
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
                    <div className="w-4 h-1 bg-yellow-500 mr-2"></div>
                    <span className="text-gray-300">Route Path</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <Bell className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-200">
                    Routes and timings may change due to weather conditions or official announcements. 
                    Please check local updates before attending the ceremony.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessionRoute;