import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Car, Clock, Phone, AlertCircle, Locate } from 'lucide-react';

const ParkingSpaces = () => {
  const [parkingData, setParkingData] = useState([]);
  const [animatedPercentages, setAnimatedPercentages] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // API endpoint
  const API_URL = 'https://beautyme.lk:4599/json/parks';

  // Function to fetch parking data from API
  const fetchParkingData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Format the data to match our component structure
      const formattedData = data.map(location => ({
        ...location,
        distance: `${location.distance} km` // Format distance with unit
      }));
      
      setParkingData(formattedData);
      setApiError(null);
      setLastUpdate(new Date());
      
      // Initialize percentages for new locations
      const newPercentages = {};
      formattedData.forEach(location => {
        if (!(location.id in animatedPercentages)) {
          newPercentages[location.id] = 0;
        }
      });
      if (Object.keys(newPercentages).length > 0) {
        setAnimatedPercentages(prev => ({ ...prev, ...newPercentages }));
      }
      
      // Animate updated percentages
      formattedData.forEach(location => {
        const targetPercentage = calculatePercentage(location.filledSpaces, location.totalSpaces);
        animatePercentage(location.id, targetPercentage);
      });
      
    } catch (error) {
      console.error('Error fetching parking data:', error);
      setApiError(error.message);
    }
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          let errorMessage = "Unable to get your location";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage = "An unknown error occurred";
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
    } else {
      setLocationError("Geolocation is not supported by this browser");
    }
  }, []);

  // Function to open Google Maps directions
  const openDirections = (destination) => {
    if (userLocation) {
      // Use user's current location as starting point
      const directionsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destination.latitude},${destination.longitude}`;
      window.open(directionsUrl, '_blank');
    } else {
      // Fallback: Just open the destination location
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  // Initialize data on mount and set up API polling
  useEffect(() => {
    // Initial fetch
    fetchParkingData();
    setIsLoaded(true);
    
    // Set up polling every 5 seconds
    const interval = setInterval(fetchParkingData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Animate percentages when data loads
  useEffect(() => {
    if (isLoaded && parkingData.length > 0) {
      parkingData.forEach((location, index) => {
        setTimeout(() => {
          const targetPercentage = calculatePercentage(location.filledSpaces, location.totalSpaces);
          animatePercentage(location.id, targetPercentage);
        }, index * 300);
      });
    }
  }, [isLoaded]);

  // Animate percentage fill
  const animatePercentage = (locationId, targetPercentage) => {
    const duration = 2000;
    const startTime = Date.now();
    const startPercentage = animatedPercentages[locationId] || 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentPercentage = Math.round(startPercentage + (targetPercentage - startPercentage) * easeOutCubic);
      
      setAnimatedPercentages(prev => ({
        ...prev,
        [locationId]: currentPercentage
      }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Remove the old simulation effect since we're using real API data
  // The API polling is handled in the initialization useEffect

  const calculatePercentage = (filled, total) => {
    return Math.round((filled / total) * 100);
  };

  const getAvailableSpaces = (filled, total) => {
    return total - filled;
  };

  const getStatusColor = (percentage) => {
    if (percentage <= 50) return { bg: 'bg-green-500', text: 'text-green-400', stroke: '#10b981' };
    if (percentage <= 80) return { bg: 'bg-yellow-500', text: 'text-yellow-400', stroke: '#f59e0b' };
    return { bg: 'bg-red-500', text: 'text-red-400', stroke: '#ef4444' };
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Sacred Area': return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'Festival Zone': return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      case 'Public Area': return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      default: return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
    }
  };

  return (
    <section className="py-16 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Festival Parking Spaces
          </h2>
          <p className="text-gray-400 text-lg mb-6">Real-time parking availability for Dalada Perahara</p>
          
          {/* Live Status */}
          <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">LIVE PARKING DATA</span>
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                (Updated: {lastUpdate.toLocaleTimeString()})
              </span>
            )}
          </div>

          {/* API Error Status */}
          {apiError && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">API Error: {apiError}</span>
            </div>
          )}

          {/* Location Status */}
          <div className="mt-4">
            {userLocation ? (
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full">
                <Locate className="w-4 h-4" />
                <span className="font-medium">Location detected - Ready for directions</span>
              </div>
            ) : locationError ? (
              <div className="inline-flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">{locationError}</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Getting your location...</span>
              </div>
            )}
          </div>
        </div>

        {/* Parking Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Spaces</p>
                <p className="text-2xl font-bold text-white">
                  {parkingData.reduce((acc, loc) => acc + loc.totalSpaces, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Available Now</p>
                <p className="text-2xl font-bold text-white">
                  {parkingData.reduce((acc, loc) => acc + getAvailableSpaces(loc.filledSpaces, loc.totalSpaces), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Locations</p>
                <p className="text-2xl font-bold text-white">{parkingData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Parking Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {parkingData.map((location, index) => {
            const realPercentage = calculatePercentage(location.filledSpaces, location.totalSpaces);
            const animatedPercentage = animatedPercentages[location.id] || 0;
            const availableSpaces = getAvailableSpaces(location.filledSpaces, location.totalSpaces);
            const statusColor = getStatusColor(realPercentage);
            const circumference = 2 * Math.PI * 45;
            const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;
            
            return (
              <div
                key={location.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl opacity-0 animate-slideUp"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: 'forwards'
                }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-1">
                      {location.name}
                    </h3>
                    <p className="text-gray-300 text-sm">{location.subtitle}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getTypeColor(location.type)}`}>
                    {location.type}
                  </div>
                </div>

                {/* Available Space */}
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-gray-400 text-sm">Available Space:</span>
                    <span className="text-3xl font-bold text-green-400 transition-all duration-500">
                      {availableSpaces}
                    </span>
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#374151"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Animated progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke={statusColor.stroke}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                          transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s ease'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${statusColor.text} transition-all duration-500`}>
                          {animatedPercentage}%
                        </div>
                        <div className="text-xs text-gray-400">filled</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Filled Percentage */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${statusColor.bg} transition-all duration-300`}></div>
                      <div>
                        <p className="text-white font-medium">Filled Percentage</p>
                        <p className="text-gray-400 text-sm">
                          <span className={`${statusColor.text} font-bold transition-all duration-500`}>
                            {animatedPercentage}%
                          </span> filled in parking space
                        </p>
                      </div>
                    </div>

                    {/* Available Space */}
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <div>
                        <p className="text-white font-medium">Available Space</p>
                        <p className="text-gray-400 text-sm">
                          <span className="text-green-400 font-bold transition-all duration-500">
                            {100 - animatedPercentage}%
                          </span> space available for the park
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordinates Display */}
                <div className="mb-6 bg-gray-700/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>Lat: {location.latitude}°, Long: {location.longitude}°</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                    <Navigation className="w-4 h-4" />
                    <span>{location.distance} from Temple of the Tooth</span>
                  </div>
                </div>

                {/* Get Direction Button */}
                <button 
                  onClick={() => openDirections(location)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-5 h-5" />
                  <span>
                    {userLocation ? 'Get Direction' : 'View Location'}
                  </span>
                </button>

                {/* Status Indicator */}
                {realPercentage >= 90 && (
                  <div className="mt-4 flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-pulse">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">Almost Full</span>
                  </div>
                )}

                {/* Live Update Indicator */}
                <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Updates every 5 seconds...</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Contact */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Need Parking Assistance?</h3>
            <p className="text-gray-400 mb-4">Contact our parking management team for help</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center space-x-2 text-yellow-400">
                <Phone className="w-5 h-5" />
                <span className="font-medium">+94 81 222 3456</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Clock className="w-5 h-5" />
                <span className="font-medium">24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default ParkingSpaces;